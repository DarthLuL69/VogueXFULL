import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../shared/services/chat.service';
import { MessageService } from '../../shared/services/message.service';
import { OfferService } from '../../shared/services/offer.service';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { ApiService } from '../../core/services/api.service';
import { Chat, Message, Offer } from '../../shared/models/chat.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule],  template: `    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-4">
      <div class="max-w-7xl mx-auto">
        <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div class="flex h-[calc(100vh-8rem)]">
            
            <!-- Chat List Sidebar -->
            <div class="w-80 bg-gradient-to-b from-slate-50 to-gray-100 border-r border-gray-200 flex flex-col">              <!-- Header -->
              <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900">
                <h2 class="text-xl font-bold text-white mb-2">💬 Conversaciones</h2>
                <p class="text-slate-300 text-sm">Gestiona tus chats activos</p>
              </div>
                <!-- Search -->
              <div class="p-4 border-b border-gray-200 bg-white">
                <div class="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar conversaciones..." 
                    [(ngModel)]="searchTerm" 
                    (input)="filterChats()"
                    class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent
                           placeholder-gray-500 text-sm transition-all duration-200 hover:border-gray-400">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Chat Items -->
              <div class="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
                <div 
                  *ngFor="let chat of filteredChats; trackBy: trackByChat"                  class="group relative flex items-center p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 
                         cursor-pointer transition-all duration-300 border-b border-gray-100 hover:border-slate-200"
                  [class.bg-gradient-to-r]="selectedChat?.id === chat.id"
                  [class.from-slate-100]="selectedChat?.id === chat.id"
                  [class.to-blue-100]="selectedChat?.id === chat.id"
                  [class.border-slate-300]="selectedChat?.id === chat.id"
                  (click)="selectChat(chat)">                  <!-- Avatar with status -->
                  <div class="relative flex-shrink-0 mr-3">
                    <div class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
                      <div 
                        *ngIf="getOtherUserAvatar(chat); else avatarPlaceholder" 
                        class="w-full h-full">
                        <img 
                          [src]="getOtherUserAvatar(chat)" 
                          alt="User avatar" 
                          class="w-full h-full object-cover">
                      </div>
                      <ng-template #avatarPlaceholder>
                        <div 
                          class="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                          [ngClass]="getAvatarBackgroundColor(getOtherUserName(chat))">
                          {{ getUserInitials(getOtherUserName(chat)) }}
                        </div>
                      </ng-template>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  
                  <!-- Chat Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <h3 class="font-semibold text-gray-900 text-sm truncate">
                        {{ getOtherUserName(chat) }}
                      </h3>
                      <span class="text-xs text-gray-500">
                        {{ chat.updated_at | date:'shortTime' }}
                      </span>
                    </div>
                      <div class="flex items-center justify-between mb-1">
                      <p class="text-xs text-slate-600 font-medium truncate">
                        {{ chat.product?.name }}
                      </p>
                      <span class="text-xs font-bold text-emerald-600">
                        {{ chat.product?.price | currency:'EUR':'symbol':'1.0-0' }}
                      </span>
                    </div>
                    
                    <p class="text-xs text-gray-600 truncate">
                      {{ chat.lastMessage?.content || 'No hay mensajes aún' }}
                    </p>
                  </div>
                  
                  <!-- Unread indicator -->
                  <div *ngIf="isChatUnread(chat)" 
                       class="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                
                <div *ngIf="filteredChats.length === 0" 
                     class="flex flex-col items-center justify-center p-8 text-center">                  <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <p class="text-slate-500 text-sm">No se encontraron conversaciones</p>
                </div>
              </div>
            </div>
            
            <!-- Chat Messages Area -->
            <div class="flex-1 flex flex-col" *ngIf="selectedChat; else selectChatPrompt">
                <!-- Chat Header -->
              <div class="p-4 bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 text-white">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <button class="lg:hidden mr-3 p-2 hover:bg-white/20 rounded-lg transition-colors" 
                            (click)="closeChat()">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                      <div class="flex items-center">
                      <div class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/50 mr-3">
                        <div 
                          *ngIf="getOtherUserAvatar(selectedChat); else headerAvatarPlaceholder" 
                          class="w-full h-full">
                          <img 
                            [src]="getOtherUserAvatar(selectedChat)" 
                            alt="User avatar" 
                            class="w-full h-full object-cover">
                        </div>
                        <ng-template #headerAvatarPlaceholder>
                          <div 
                            class="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                            [ngClass]="getAvatarBackgroundColor(getOtherUserName(selectedChat))">
                            {{ getUserInitials(getOtherUserName(selectedChat)) }}
                          </div>
                        </ng-template>
                      </div>
                      <div>
                        <h3 class="font-semibold text-white">{{ getOtherUserName(selectedChat) }}</h3>                        <div class="flex items-center text-slate-300 text-sm">
                          <span>{{ selectedChat.product?.name }}</span>
                          <span class="mx-2">•</span>
                          <span class="font-semibold text-emerald-400">{{ selectedChat.product?.price | currency:'EUR':'symbol':'1.0-0' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button class="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Información">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Messages Container -->
              <div class="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                <div *ngFor="let item of getCombinedMessages(); trackBy: trackByMessage" 
                     class="flex" 
                     [class.justify-end]="isOwnItem(item)">
                  
                  <!-- Message Bubble -->
                  <div class="max-w-xs lg:max-w-md" 
                       [class.order-2]="isOwnItem(item)">
                    
                    <!-- Regular Message -->
                    <div *ngIf="item.messageType === 'message'" 
                         class="relative group">
                      <div class="px-4 py-3 rounded-2xl shadow-sm"
                           [class.bg-gradient-to-r]="isOwnItem(item)"
                           [class.from-blue-500]="isOwnItem(item)"
                           [class.to-purple-600]="isOwnItem(item)"
                           [class.text-white]="isOwnItem(item)"
                           [class.bg-white]="!isOwnItem(item)"
                           [class.text-gray-800]="!isOwnItem(item)"
                           [class.border]="!isOwnItem(item)"
                           [class.border-gray-200]="!isOwnItem(item)">
                        <p class="text-sm">{{ item.content }}</p>
                      </div>
                      <div class="flex items-center mt-1"
                           [class.justify-end]="isOwnItem(item)">
                        <span class="text-xs text-gray-500">
                          {{ item.created_at | date:'shortTime' }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Offer Message -->
                    <div *ngIf="item.messageType === 'offer'" 
                         class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                      
                      <!-- Offer Header -->
                      <div class="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center">
                            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                              <span class="text-lg">💰</span>
                            </div>
                            <div>
                              <h4 class="font-semibold text-sm">Oferta</h4>
                              <p class="text-xs text-amber-100">{{ getOfferTypeText(item, userId) }}</p>
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="text-2xl font-bold">{{ item.amount | currency:'EUR':'symbol':'1.0-0' }}</div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Offer Status -->
                      <div class="p-4">
                        <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3"
                             [class.bg-yellow-100]="item.status === 'pending'"
                             [class.text-yellow-800]="item.status === 'pending'"
                             [class.bg-green-100]="item.status === 'accepted'"
                             [class.text-green-800]="item.status === 'accepted'"
                             [class.bg-red-100]="item.status === 'rejected'"
                             [class.text-red-800]="item.status === 'rejected'">
                          <span class="mr-1">{{ getStatusIcon(item.status) }}</span>
                          {{ getStatusText(item.status) }}
                        </div>
                        
                        <!-- Offer Actions for Seller -->
                        <div *ngIf="item.status === 'pending' && canRespondToOffer(item)" 
                             class="flex gap-2 mb-3">
                          <button (click)="acceptOffer(item.id)" 
                                  class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg 
                                         text-sm font-medium transition-colors duration-200 flex items-center justify-center">
                            <span class="mr-1">✓</span>
                            Aceptar
                          </button>
                          <button (click)="rejectOffer(item.id)" 
                                  class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg 
                                         text-sm font-medium transition-colors duration-200 flex items-center justify-center">
                            <span class="mr-1">✗</span>
                            Rechazar
                          </button>
                        </div>
                        
                        <div *ngIf="item.status === 'pending' && canRespondToOffer(item)" 
                             class="mb-3">
                          <button (click)="openCounterOfferModal(item)" 
                                  class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg 
                                         text-sm font-medium transition-colors duration-200 flex items-center justify-center">
                            <span class="mr-1">🔄</span>
                            Contraoferta
                          </button>
                        </div>
                        
                        <!-- Status for Buyer when pending -->
                        <div *ngIf="item.status === 'pending' && !canRespondToOffer(item)" 
                             class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <div class="flex items-center text-yellow-700">
                            <span class="text-lg mr-2">⏳</span>
                            <span class="text-sm font-medium">Oferta enviada - Esperando respuesta del vendedor</span>
                          </div>
                        </div>
                        
                        <!-- Payment section for accepted offers (ONLY for buyer) -->
                        <div *ngIf="item.status === 'accepted' && item.buyer_id === userId" 
                             class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg mb-3">
                          <div class="flex items-center mb-3">
                            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                              <span class="text-lg">🎉</span>
                            </div>
                            <div>
                              <p class="font-semibold text-sm">¡Oferta aceptada!</p>
                              <p class="text-xs text-green-100">Procede al pago para completar la compra</p>
                            </div>
                          </div>
                          <button (click)="proceedToPayment(item)" 
                                  class="w-full bg-white text-green-600 font-bold py-3 px-4 rounded-lg 
                                         hover:bg-gray-50 transition-all duration-200 flex items-center justify-center
                                         shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            <span class="mr-2 text-xl">💳</span>
                            <span>Proceder al pago</span>
                          </button>
                        </div>
                        
                        <!-- Status for Seller when accepted -->
                        <div *ngIf="item.status === 'accepted' && canRespondToOffer(item)" 
                             class="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <div class="flex items-center text-green-700">
                            <span class="text-lg mr-2">✅</span>
                            <span class="text-sm font-medium">Oferta aceptada - Esperando pago del comprador</span>
                          </div>
                        </div>
                        
                        <div class="text-xs text-gray-500 text-center">
                          {{ item.created_at | date:'short' }}
                        </div>
                      </div>
                    </div>
                  </div>
                    <!-- Avatar for other user's messages -->
                  <div *ngIf="!isOwnItem(item)" class="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 self-end">
                    <div 
                      *ngIf="getOtherUserAvatar(selectedChat); else messageAvatarPlaceholder" 
                      class="w-full h-full">
                      <img [src]="getOtherUserAvatar(selectedChat)" 
                           alt="User avatar" 
                           class="w-full h-full object-cover">
                    </div>
                    <ng-template #messageAvatarPlaceholder>
                      <div 
                        class="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                        [ngClass]="getAvatarBackgroundColor(getOtherUserName(selectedChat))">
                        {{ getUserInitials(getOtherUserName(selectedChat)) }}
                      </div>
                    </ng-template>
                  </div>
                </div>
                
                <div *ngIf="messages.length === 0 && offers.length === 0" 
                     class="flex flex-col items-center justify-center py-12 text-center">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">¡Inicia la conversación!</h3>
                  <p class="text-gray-500 text-sm">Envía un mensaje o haz una oferta para comenzar</p>
                </div>
              </div>
              
              <!-- Message Input -->
              <div class="bg-white border-t border-gray-200 p-4">
                <div class="flex items-center space-x-3">
                  <!-- Action Buttons -->
                  <div class="flex space-x-1">
                    <button (click)="toggleEmojiPicker()" 
                            class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Agregar emoji">
                      <span class="text-xl">😊</span>
                    </button>
                    <button (click)="openOfferModal()" 
                            *ngIf="selectedChat"
                            class="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Enviar oferta">
                      <span class="text-xl">💰</span>
                    </button>
                  </div>
                  
                  <!-- Message Input -->
                  <div class="flex-1 relative">
                    <input 
                      type="text" 
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             placeholder-gray-400 text-sm transition-all duration-200"
                      placeholder="Escribe un mensaje..." 
                      [(ngModel)]="newMessage" 
                      (keyup.enter)="sendMessage()"
                      [disabled]="isTyping">
                  </div>
                  
                  <!-- Send Button -->
                  <button (click)="sendMessage()" 
                          [disabled]="!newMessage.trim() || isTyping"
                          class="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl
                                 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-all duration-200 flex items-center justify-center
                                 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Emoji Picker -->
                <div *ngIf="showEmojiPicker" 
                     class="absolute bottom-20 left-4 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-10">
                  <div class="grid grid-cols-5 gap-2">
                    <button *ngFor="let emoji of commonEmojis" 
                            (click)="addEmoji(emoji)" 
                            class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                      <span class="text-lg">{{emoji}}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No Chat Selected -->
            <ng-template #selectChatPrompt>
              <div class="flex-1 flex items-center justify-center bg-gray-50">
                <div class="text-center">
                  <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-gray-900 mb-2">Selecciona una conversación</h3>
                  <p class="text-gray-500 text-lg">Elige una conversación de la lista para empezar a chatear</p>
                </div>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
        
    <!-- Offer Modal -->
    <div *ngIf="showOfferModal" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Header -->
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <span class="text-xl">💰</span>
              </div>
              <div>
                <h3 class="text-xl font-bold">Enviar Oferta</h3>
                <p class="text-amber-100 text-sm">Haz tu mejor propuesta</p>
              </div>
            </div>
            <button (click)="closeOfferModal()" 
                    class="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Modal Body -->
        <div class="p-6">          <!-- Product Info -->
          <div *ngIf="selectedChat?.product" 
               class="flex items-center p-4 bg-gray-50 rounded-xl mb-6">
            <img [src]="selectedChat?.product?.image_url ?? 'assets/images/product-placeholder.png'" 
                 [alt]="selectedChat?.product?.name ?? 'Product'" 
                 class="w-16 h-16 object-cover rounded-lg mr-4">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 mb-1">{{selectedChat?.product?.name}}</h4>
              <p class="text-sm text-gray-600 mb-1">Precio original</p>
              <p class="text-lg font-bold text-green-600">{{selectedChat?.product?.price | currency:'EUR':'symbol':'1.0-0'}}</p>
            </div>
          </div>
          
          <!-- Offer Form -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Tu oferta</label>
              <div class="relative">
                <input 
                  type="number" 
                  [(ngModel)]="offerAmount" 
                  placeholder="0"
                  min="1"
                  step="0.01"
                  class="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                         text-lg font-semibold text-gray-900 transition-all duration-200">
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 font-semibold">EUR</span>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Mensaje (opcional)</label>
              <textarea 
                [(ngModel)]="offerMessage" 
                placeholder="Agrega un mensaje a tu oferta..."
                rows="3"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                       text-sm text-gray-900 transition-all duration-200 resize-none"></textarea>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div class="flex gap-3">
            <button (click)="closeOfferModal()" 
                    class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold
                           hover:bg-gray-300 transition-colors duration-200">
              Cancelar
            </button>
            <button (click)="sendOffer()" 
                    [disabled]="!offerAmount || isTyping"
                    class="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold
                           hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 shadow-lg hover:shadow-xl">
              {{isTyping ? 'Enviando...' : 'Enviar Oferta'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,  styles: [`
    /* Minimal custom styles since we're using Tailwind */
    .chat-container {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    /* Custom scrollbar */
    .overflow-y-auto::-webkit-scrollbar {
      width: 4px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 2px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
    
    /* Smooth animations */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
    
    /* Custom shadows */
    .shadow-custom {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    /* Message animation */
    @keyframes messageSlide {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .message {
      animation: messageSlide 0.3s ease-out;
    }
  `]
})
export class ChatListComponent implements OnInit, OnDestroy {
  chats: Chat[] = [];
  filteredChats: Chat[] = [];
  selectedChat: Chat | null = null;
  messages: Message[] = [];
  offers: Offer[] = [];
  newMessage: string = '';
  searchTerm: string = '';
  
  // Emoji functionality
  showEmojiPicker: boolean = false;
  commonEmojis: string[] = ['😊', '😂', '❤️', '👍', '👎', '🔥', '✨', '🎉', '😍', '🤔', '😎', '💯', '👏', '🙌', '💪'];
  
  // Offer functionality
  showOfferModal: boolean = false;
  offerAmount: number | null = null;
  offerMessage: string = '';
  isTyping: boolean = false;    private readonly destroy$ = new Subject<void>();
  public userId: number = 1; // Will be updated from auth service
  
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly offerService: OfferService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {}
  
  ngOnInit(): void {// Get current user first
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.userId = response.data.id;
            console.log('🔍 Current user loaded:', {
              userId: this.userId,
              userData: response.data
            });
            this.loadChats();
          }
        },
        error: (error) => {
          console.error('Error getting current user:', error);
          // Fallback to loading chats anyway
          this.loadChats();
        }
      });
    
    // Check if we have a specific chat ID in the route
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        const chatId = parseInt(params['id'], 10);
        this.selectChatById(chatId);
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.selectedChat) {
      this.messageService.unsubscribeFromChat(this.selectedChat.id);
    }
  }
    loadChats(): void {
    this.chatService.getChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Filtrar chats donde el usuario no se está chateando consigo mismo
            this.chats = response.data.filter(chat => 
              chat.buyer_id !== this.userId || chat.seller_id !== this.userId
            );
            this.filterChats();
          }
        },
        error: (error) => {
          console.error('Error loading chats:', error);
        }
      });
  }
  
  private selectChatById(chatId: number, retryCount: number = 0): void {
    const targetChat = this.chats.find(chat => chat.id === chatId);
    
    if (targetChat) {
      this.selectChat(targetChat);
    } else if (retryCount < 5) {
      setTimeout(() => {
        this.selectChatById(chatId, retryCount + 1);
      }, 500);
    } else {
      console.warn(`Chat with ID ${chatId} not found after retries`);
    }
  }
  
  filterChats(): void {
    if (!this.searchTerm) {
      this.filteredChats = this.chats;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredChats = this.chats.filter(chat => 
      (chat.buyer?.name?.toLowerCase().includes(term) || 
       chat.seller?.name?.toLowerCase().includes(term) ||
       chat.product?.name?.toLowerCase().includes(term) ||
       chat.lastMessage?.content?.toLowerCase().includes(term))
    );
  }
    selectChat(chat: Chat): void {
    if (this.selectedChat) {
      this.messageService.unsubscribeFromChat(this.selectedChat.id);
    }

    this.selectedChat = chat;
    this.messages = [];
    this.offers = [];

    this.chatService.markAsRead(chat.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Load messages
    this.messageService.getMessages(chat.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messages = response.data;
            
            this.messageService.subscribeToChat(chat.id, (message) => {
              const exists = this.messages.some(m => m.id === message.id);
              if (!exists) {
                this.messages.push(message);
              }
            });
          }
        },
        error: (error) => {
          console.error('Error loading messages:', error);
        }
      });

    // Load offers
    this.offerService.getOffers(chat.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.offers = response.data;
            console.log('Offers loaded:', this.offers);
          }
        },
        error: (error) => {          console.error('Error loading offers:', error);
        }
      });
  }
  
  closeChat(): void {
    if (this.selectedChat) {
      this.messageService.unsubscribeFromChat(this.selectedChat.id);
    }
    this.selectedChat = null;
    this.messages = [];
  }
  
  sendMessage(): void {
    if (!this.selectedChat || !this.newMessage.trim()) {
      return;
    }
    
    this.messageService.sendMessage(this.selectedChat.id, this.newMessage.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.newMessage = '';
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
        }
      });
  }
  
  // Emoji functionality
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string): void {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }

  // Offer functionality
  openOfferModal(): void {
    if (this.selectedChat) {
      this.showOfferModal = true;
      this.offerAmount = null;
      this.offerMessage = '';
    }
  }

  closeOfferModal(): void {
    this.showOfferModal = false;
    this.offerAmount = null;
    this.offerMessage = '';
  }

  sendOffer(): void {
    if (!this.selectedChat || !this.offerAmount) {
      return;
    }

    this.isTyping = true;
    
    this.apiService.createOffer({
      chat_id: this.selectedChat.id,
      amount: this.offerAmount,
      message: this.offerMessage || `Oferta de ${this.offerAmount}€ para ${this.selectedChat.product?.name}`
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        if (response.success) {
          const offerMessage = `💰 Oferta: ${this.offerAmount}€ para ${this.selectedChat?.product?.name}${this.offerMessage ? '\n' + this.offerMessage : ''}`;
          
          this.messageService.sendMessage(this.selectedChat!.id, offerMessage)
            .pipe(takeUntil(this.destroy$))            .subscribe({
              next: () => {
                this.closeOfferModal();
                this.isTyping = false;
                // Reload offers to show the new one
                this.loadOffers();
              },
              error: (error: any) => {
                console.error('Error sending offer message:', error);
                this.isTyping = false;
              }
            });
        }
      },
      error: (error: any) => {
        console.error('Error creating offer:', error);
        this.isTyping = false;
      }
    });
  }
    getOtherUserName(chat: Chat | null): string {
    if (!chat) return 'Usuario';
    
    return this.userId === chat.buyer_id 
      ? chat.seller?.name ?? 'Vendedor'
      : chat.buyer?.name ?? 'Comprador';
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'expired': return 'Expirada';
      default: return status;
    }
  }

  canRespondToOffer(offer: any): boolean {
    // The receiver (seller) can respond to offers from the buyer
    console.log('🔍 canRespondToOffer check:', {
      userId: this.userId,
      offerSellerId: offer.seller_id,
      offerBuyerId: offer.buyer_id,
      offerId: offer.id,
      canRespond: this.userId === offer.seller_id
    });
    return this.userId === offer.seller_id;
  }

  acceptOffer(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, 'accepted')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMessages();
          }
        },
        error: (error) => {
          console.error('Error accepting offer:', error);
        }
      });
  }

  rejectOffer(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, 'rejected')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMessages();
          }
        },
        error: (error) => {
          console.error('Error rejecting offer:', error);
        }
      });
  }

  openCounterOfferModal(originalOffer: any): void {
    this.offerAmount = originalOffer.amount;
    this.offerMessage = `Contraoferta para ${originalOffer.amount}`;
    this.showOfferModal = true;
  }
  proceedToPayment(offer: any): void {
    console.log('🔍 Proceeding to payment for offer:', offer);
    console.log('🔍 User ID:', this.userId);
    console.log('🔍 Buyer ID:', offer.buyer_id);
    console.log('🔍 Offer status:', offer.status);
    
    // Navigate directly to payment page
    this.router.navigate(['/payment', offer.id]);
  }

  private loadOffers(): void {
    if (this.selectedChat) {
      this.offerService.getOffers(this.selectedChat.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.offers = response.data;
            }
          },
          error: (error) => {
            console.error('Error loading offers:', error);
          }
        });
    }
  }

  private loadMessages(): void {
    if (this.selectedChat) {
      this.messageService.getMessages(this.selectedChat.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.messages = response.data;
            }
          },
          error: (error) => {
            console.error('Error loading messages:', error);
          }
        });
    }
  }

  isChatUnread(chat: Chat): boolean {
    return false; // Implement unread logic as needed
  }

  isOwnItem(item: any): boolean {
    if (item.messageType === 'message') {
      return item.sender_id === this.userId;
    } else if (item.messageType === 'offer') {
      return item.buyer_id === this.userId;
    }
    return false;
  }

  getCombinedMessages(): any[] {
    const combined: any[] = [];
    
    // Add messages
    this.messages.forEach(message => {
      combined.push({
        ...message,
        messageType: 'message',
        created_at: message.created_at
      });
    });
    
    // Add offers
    this.offers.forEach(offer => {
      combined.push({
        ...offer,
        messageType: 'offer',
        created_at: offer.created_at
      });
    });
    
    // Sort by created_at
    return combined.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }  getOtherUserAvatar(chat: Chat): string | null {
    if (!chat) return null;
    
    const otherUser = this.userId === chat.buyer_id ? chat.seller : chat.buyer;
    if (!otherUser?.avatar) return null;
    
    // Use UserService to get full avatar URL
    return this.userService.getAvatarUrl(otherUser.avatar);
  }

  getOtherUser(chat: Chat): any {
    if (!chat) return null;
    return this.userId === chat.buyer_id ? chat.seller : chat.buyer;
  }

  getUserInitials(name: string): string {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }
  getAvatarBackgroundColor(name: string): string {
    if (!name) return 'bg-slate-500';
    
    const elegantColors = [
      'bg-slate-600', 'bg-gray-600', 'bg-zinc-600', 'bg-stone-600',
      'bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500', 'bg-purple-500',
      'bg-violet-500', 'bg-indigo-500', 'bg-blue-500', 'bg-sky-500',
      'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-green-500',
      'bg-lime-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'
    ];
    
    const charCode = name.charCodeAt(0);
    return elegantColors[charCode % elegantColors.length];
  }

  getOfferTypeText(offer: any, userId: number): string {
    return offer.buyer_id === userId ? 'Oferta enviada' : 'Oferta recibida';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'expired': return '⏰';
      default: return '📋';
    }
  }

  trackByChat(index: number, chat: Chat): number {
    return chat.id;
  }

  trackByMessage(index: number, item: any): string {
    return `${item.messageType}-${item.id}`;
  }
}
