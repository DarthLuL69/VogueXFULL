import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../shared/services/chat.service';
import { MessageService } from '../../shared/services/message.service';
import { OfferService } from '../../shared/services/offer.service';
import { AuthService } from '../../shared/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Chat, Message, Offer } from '../../shared/models/chat.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-list">
        <h2>Conversaciones</h2>
        <div class="chat-search">
          <input type="text" placeholder="Buscar chats..." [(ngModel)]="searchTerm" (input)="filterChats()">
        </div>
        <div class="chat-items">
          <div 
            *ngFor="let chat of filteredChats" 
            class="chat-item" 
            [class.active]="selectedChat?.id === chat.id"
            (click)="selectChat(chat)">
            <div class="chat-avatar">
              <img 
                [src]="getOtherUserAvatar(chat)" 
                alt="User avatar" 
                onerror="this.src='assets/images/default-avatar.png'">
            </div>
            <div class="chat-info">
              <div class="chat-name">{{ getOtherUserName(chat) }}</div>
              <div class="chat-product">{{ chat.product?.name }}</div>
              <div class="chat-last-message">
                {{ chat.lastMessage?.content || 'No hay mensajes aún' }}
              </div>
            </div>
            <div class="chat-meta">
              <div class="chat-time">
                {{ chat.updated_at | date:'shortTime' }}
              </div>
              <div class="chat-unread" *ngIf="isChatUnread(chat)">
                <span class="unread-badge"></span>
              </div>
            </div>
          </div>
          <div *ngIf="filteredChats.length === 0" class="no-chats">
            No se encontraron conversaciones
          </div>
        </div>
      </div>
      
      <div class="chat-messages" *ngIf="selectedChat; else selectChatPrompt">
        <div class="chat-header">
          <div class="chat-back" (click)="closeChat()">
            <i class="fas fa-arrow-left"></i>
          </div>
          <div class="chat-avatar">
            <img 
              [src]="getOtherUserAvatar(selectedChat)" 
              alt="User avatar" 
              onerror="this.src='assets/images/default-avatar.png'">
          </div>
          <div class="chat-user-info">
            <div class="chat-name">{{ getOtherUserName(selectedChat) }}</div>
            <div class="chat-product">{{ selectedChat.product?.name }} - {{ selectedChat.product?.price | currency }}</div>
          </div>
        </div>
          <div class="messages-container">
          <!-- Messages and Offers combined -->
          <div *ngFor="let item of getCombinedMessages()" class="message" 
               [class.own]="isOwnItem(item)" 
               [class.offer-message]="item.type === 'offer' || item.type === 'offer_response'">
            
            <!-- Regular Message -->
            <div *ngIf="item.messageType === 'message'" class="message-content">
              <div class="message-text">
                {{ item.content }}
              </div>
              <div class="message-time">
                {{ item.created_at | date:'shortTime' }}
              </div>
            </div>
            
            <!-- Offer Display -->
            <div *ngIf="item.messageType === 'offer'" class="offer-content">
              <div class="offer-header">
                <span class="offer-icon">💰</span>
                <span class="offer-title">Oferta</span>
                <span class="offer-amount">{{item.amount | currency}}</span>
              </div>
              <div class="offer-status" [class]="'status-' + item.status">
                {{ getStatusText(item.status) }}
              </div>
              
              <!-- Offer Actions for Receiver -->
              <div *ngIf="item.status === 'pending' && canRespondToOffer(item)" class="offer-actions">
                <button class="accept-btn" (click)="acceptOffer(item.id)">
                  ✓ Aceptar
                </button>
                <button class="reject-btn" (click)="rejectOffer(item.id)">
                  ✗ Rechazar
                </button>
                <button class="counter-btn" (click)="openCounterOfferModal(item)">
                  🔄 Contraoferta
                </button>
              </div>
              
              <div class="offer-time">
                {{ item.created_at | date:'short' }}
              </div>
            </div>
          </div>
          
          <div *ngIf="messages.length === 0 && offers.length === 0" class="no-messages">
            No hay mensajes aún. ¡Inicia la conversación!
          </div>
        </div>
        
        <div class="message-input-container">
          <div class="message-input-wrapper">
            <div class="input-actions">
              <button class="emoji-btn" (click)="toggleEmojiPicker()" title="Agregar emoji">
                😊
              </button>
              <button class="offer-btn" (click)="openOfferModal()" *ngIf="selectedChat" title="Enviar oferta">
                💰
              </button>
            </div>
            <input 
              type="text" 
              class="message-input"
              placeholder="Escribe un mensaje..." 
              [(ngModel)]="newMessage" 
              (keyup.enter)="sendMessage()"
              [disabled]="isTyping">
            <button class="send-btn" (click)="sendMessage()" [disabled]="!newMessage.trim() || isTyping">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
          
          <!-- Emoji Picker -->
          <div class="emoji-picker" *ngIf="showEmojiPicker">
            <div class="emoji-grid">
              <span *ngFor="let emoji of commonEmojis" (click)="addEmoji(emoji)" class="emoji-item">{{emoji}}</span>
            </div>
          </div>
        </div>
        
        <!-- Offer Modal -->
        <div class="offer-modal-overlay" *ngIf="showOfferModal" (click)="closeOfferModal()">
          <div class="offer-modal" (click)="$event.stopPropagation()">
            <div class="offer-modal-header">
              <h3>Enviar Oferta</h3>
              <button class="close-btn" (click)="closeOfferModal()">×</button>
            </div>
            <div class="offer-modal-body">
              <div class="product-info" *ngIf="selectedChat?.product">
                <img [src]="selectedChat.product?.image_url || 'assets/images/product-placeholder.png'" 
                     [alt]="selectedChat.product?.name || 'Product'" 
                     class="product-image">
                <div class="product-details">
                  <h4>{{selectedChat.product?.name}}</h4>
                  <p class="original-price">Precio original: {{selectedChat.product?.price | currency}}</p>
                </div>
              </div>
              <div class="offer-form">
                <label>Tu oferta:</label>
                <div class="price-input">
                  <input 
                    type="number" 
                    [(ngModel)]="offerAmount" 
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    class="offer-price">
                  <span class="currency">€</span>
                </div>
                <label>Mensaje (opcional):</label>
                <textarea 
                  [(ngModel)]="offerMessage" 
                  placeholder="Agrega un mensaje a tu oferta..."
                  class="offer-message"></textarea>
              </div>
            </div>
            <div class="offer-modal-footer">
              <button class="cancel-btn" (click)="closeOfferModal()">Cancelar</button>
              <button class="send-offer-btn" (click)="sendOffer()" [disabled]="!offerAmount || isTyping">
                {{isTyping ? 'Enviando...' : 'Enviar Oferta'}}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ng-template #selectChatPrompt>
        <div class="no-chat-selected">
          <div class="prompt">
            <i class="fas fa-comments"></i>
            <h3>Selecciona una conversación</h3>
            <p>Elige una conversación de la lista para empezar a chatear</p>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      height: 100vh;
      max-height: 600px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      background: white;
    }
    
    .chat-list {
      width: 320px;
      border-right: 1px solid #eee;
      background: #fff;
      display: flex;
      flex-direction: column;
    }
    
    .chat-list h2 {
      padding: 20px;
      margin: 0;
      border-bottom: 1px solid #eee;
      font-size: 18px;
    }
    
    .chat-search {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .chat-search input {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }
    
    .chat-items {
      flex: 1;
      overflow-y: auto;
    }
    
    .chat-item {
      display: flex;
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .chat-item:hover, .chat-item.active {
      background: #f8f9fa;
    }
    
    .chat-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .chat-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .chat-info {
      flex: 1;
      overflow: hidden;
    }
    
    .chat-name {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 14px;
    }
    
    .chat-product {
      font-size: 12px;
      color: #888;
      margin-bottom: 4px;
    }
    
    .chat-last-message {
      font-size: 13px;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .chat-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex-shrink: 0;
    }
    
    .chat-time {
      font-size: 11px;
      color: #888;
    }
    
    .unread-badge {
      width: 8px;
      height: 8px;
      background: #ff4747;
      border-radius: 50%;
      margin-top: 4px;
    }
    
    .chat-messages {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }
    
    .chat-header {
      display: flex;
      padding: 15px 20px;
      background: #fff;
      border-bottom: 1px solid #eee;
      align-items: center;
    }
    
    .chat-header .chat-avatar {
      width: 35px;
      height: 35px;
      margin-right: 12px;
    }
    
    .chat-user-info .chat-name {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 2px;
    }
    
    .chat-user-info .chat-product {
      color: #666;
      font-size: 12px;
    }
    
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    
    .message {
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
      max-width: 70%;
    }
    
    .message.own {
      align-self: flex-end;
      align-items: flex-end;
    }
    
    .message-content {
      padding: 10px 15px;
      border-radius: 18px;
      word-wrap: break-word;
    }
    
    .message:not(.own) .message-content {
      background: #fff;
      color: #333;
      border-bottom-left-radius: 4px;
    }
    
    .message.own .message-content {
      background: #007bff;
      color: #fff;
      border-bottom-right-radius: 4px;
    }
      .message-time {
      font-size: 10px;
      color: #888;
      margin-top: 4px;
    }

    /* Offer Message Styles */
    .offer-message {
      max-width: 300px;
    }

    .offer-content {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 2px solid #28a745;
      border-radius: 12px;
      padding: 15px;
      color: #333;
    }

    .message.own .offer-content {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-color: #2196f3;
    }

    .offer-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .offer-icon {
      font-size: 18px;
    }

    .offer-title {
      color: #28a745;
      font-size: 14px;
    }

    .message.own .offer-title {
      color: #2196f3;
    }

    .offer-amount {
      margin-left: auto;
      font-size: 16px;
      font-weight: bold;
      color: #28a745;
    }

    .message.own .offer-amount {
      color: #2196f3;
    }

    .offer-status {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .status-accepted {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-rejected {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .offer-actions {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }

    .accept-btn, .reject-btn, .counter-btn {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .accept-btn {
      background: #28a745;
      color: white;
    }

    .accept-btn:hover {
      background: #218838;
    }

    .reject-btn {
      background: #dc3545;
      color: white;
    }

    .reject-btn:hover {
      background: #c82333;
    }

    .counter-btn {
      background: #17a2b8;
      color: white;
    }

    .counter-btn:hover {
      background: #138496;
    }

    .offer-time {
      font-size: 10px;
      color: #888;
      margin-top: 8px;
      text-align: right;
    }
    
    .message-input-container {
      background: #fff;
      border-top: 1px solid #eee;
    }
    
    .message-input-wrapper {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      gap: 10px;
    }
    
    .input-actions {
      display: flex;
      gap: 5px;
    }
    
    .emoji-btn, .offer-btn {
      background: none;
      border: none;
      font-size: 18px;
      padding: 8px;
      border-radius: 50%;
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .emoji-btn:hover, .offer-btn:hover {
      background: #f0f0f0;
    }
    
    .message-input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }
    
    .send-btn {
      background: #007bff;
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .send-btn:disabled {
      background: #ccc;
    }
    
    .emoji-picker {
      position: absolute;
      bottom: 100%;
      left: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 5px;
    }
    
    .emoji-item {
      padding: 5px;
      border-radius: 4px;
      cursor: pointer;
      text-align: center;
      font-size: 16px;
    }
    
    .emoji-item:hover {
      background: #f0f0f0;
    }
    
    .offer-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .offer-modal {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 400px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .offer-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }
    
    .offer-modal-header h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }
    
    .offer-modal-body {
      padding: 20px;
    }
    
    .product-info {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    
    .product-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: 15px;
    }
    
    .offer-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .offer-form label {
      font-weight: 600;
      font-size: 14px;
    }
    
    .price-input {
      position: relative;
    }
    
    .offer-price {
      width: 100%;
      padding: 10px 35px 10px 15px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
    }
    
    .currency {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
    }
    
    .offer-message {
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 6px;
      resize: vertical;
      min-height: 60px;
      font-family: inherit;
    }
    
    .offer-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid #eee;
    }
    
    .cancel-btn, .send-offer-btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    
    .cancel-btn {
      border: 1px solid #ddd;
      background: white;
      color: #666;
    }
    
    .send-offer-btn {
      border: none;
      background: #28a745;
      color: white;
    }
    
    .send-offer-btn:disabled {
      background: #ccc;
    }
    
    .no-chat-selected {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #666;
    }
    
    .no-messages, .no-chats {
      text-align: center;
      color: #666;
      padding: 20px;
      font-style: italic;
    }
    
    @media (max-width: 768px) {
      .chat-container {
        height: 100vh;
      }
      
      .chat-list {
        width: 100%;
        position: absolute;
        left: 0;
        z-index: 10;
      }
      
      .chat-messages {
        width: 100%;
      }
      
      .chat-back {
        display: block !important;
      }
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
  isTyping: boolean = false;  
  private readonly destroy$ = new Subject<void>();
  private userId: number = 1; // Will be updated from auth service
  
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly offerService: OfferService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService
  ) {}
    ngOnInit(): void {
    // Get current user first
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.userId = response.data.id;
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
            this.chats = response.data;
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
      .subscribe({        next: (response) => {
          if (response.success) {
            this.offers = response.data;
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
  
  getOtherUserAvatar(chat: Chat | null): string {
    if (!chat) return 'assets/images/default-avatar.png';
    
    return this.userId === chat.buyer_id
      ? chat.seller?.avatar ?? 'assets/images/default-avatar.png'
      : chat.buyer?.avatar ?? 'assets/images/default-avatar.png';
  }
    isOwnMessage(message: Message): boolean {
    return message.user_id === this.userId;
  }
    isChatUnread(chat: Chat): boolean {
    if (this.userId === chat.buyer_id) {
      return !chat.buyer_read_at || new Date(chat.buyer_read_at) < new Date(chat.updated_at);
    } else {
      return !chat.seller_read_at || new Date(chat.seller_read_at) < new Date(chat.updated_at);
    }
  }

  // Offer-related functions
  getCombinedMessages(): any[] {
    const combined: any[] = [];
    
    // Add messages
    this.messages.forEach(message => {
      combined.push({
        ...message,
        messageType: 'message'
      });
    });
    
    // Add offers
    this.offers.forEach(offer => {
      combined.push({
        ...offer,
        messageType: 'offer'
      });
    });
    
    // Sort by creation date
    return combined.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  isOwnItem(item: any): boolean {
    if (item.messageType === 'message') {
      return item.user_id === this.userId;
    } else if (item.messageType === 'offer') {
      return item.buyer_id === this.userId;
    }
    return false;
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
    return this.userId === offer.seller_id;
  }

  acceptOffer(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, 'accepted')
      .pipe(takeUntil(this.destroy$))
      .subscribe({        next: (response) => {
          if (response.success) {
            this.loadOffers();
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
      .subscribe({        next: (response) => {
          if (response.success) {
            this.loadOffers();
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
}
