import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Message } from '../models/chat.model';
import { EchoService } from './echo.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly apiUrl = `${environment.apiUrl}/messages`;
  private readonly activeChatPolling: { [chatId: number]: Subject<void> } = {};
  private readonly messageCallbacks: { [chatId: number]: (message: Message) => void } = {};
  private readonly lastMessageTimestamps: { [chatId: number]: string } = {};
  
  constructor(
    private readonly http: HttpClient,
    private readonly echoService: EchoService
  ) { }

  /**
   * Get messages for a specific chat
   * @param chatId Chat ID
   */
  getMessages(chatId: number): Observable<{ success: boolean, data: Message[] }> {
    return this.http.get<{ success: boolean, data: Message[] }>(
      `${environment.apiUrl}/chats/${chatId}/messages`
    );
  }

  /**
   * Send a new message in a chat
   * @param chatId Chat ID
   * @param content Message content
   */
  sendMessage(chatId: number, content: string): Observable<{ success: boolean, message: string, data: Message }> {
    return this.http.post<{ success: boolean, message: string, data: Message }>(
      this.apiUrl,
      { chat_id: chatId, content }
    );
  }
  /**
   * Subscribe to real-time messages for a specific chat
   * Uses polling as fallback when Echo/Pusher is not available
   * @param chatId Chat ID
   * @param callback Function to call when a new message is received
   */
  subscribeToChat(chatId: number, callback: (message: Message) => void): void {
    this.messageCallbacks[chatId] = callback;
    
    // Try to use Echo first (real-time)
    try {
      this.echoService.listenToChat(chatId, (data) => {
        callback(data as Message);
      });
    } catch (error) {
      console.warn('Echo not available, falling back to polling:', error);
    }
    
    // Always set up polling as backup
    this.startPolling(chatId);
  }

  /**
   * Unsubscribe from real-time messages for a specific chat
   * @param chatId Chat ID
   */
  unsubscribeFromChat(chatId: number): void {
    // Stop Echo subscription
    this.echoService.stopListeningToChat(chatId);
    
    // Stop polling
    this.stopPolling(chatId);
    
    // Clean up
    delete this.messageCallbacks[chatId];
    delete this.lastMessageTimestamps[chatId];
  }

  /**
   * Start polling for new messages in a chat
   * @param chatId Chat ID
   */
  private startPolling(chatId: number): void {
    if (this.activeChatPolling[chatId]) {
      return; // Already polling
    }

    const stopSubject = new Subject<void>();
    this.activeChatPolling[chatId] = stopSubject;

    // Poll every 3 seconds
    const polling$ = interval(3000).pipe(
      switchMap(() => this.getMessages(chatId)),
      takeUntil(stopSubject),
      tap((response) => {
        if (response.success && response.data.length > 0) {
          this.checkForNewMessages(chatId, response.data);
        }
      })
    );

    polling$.subscribe({
      error: (error) => {
        console.error('Error in message polling:', error);
      }
    });
  }

  /**
   * Stop polling for a specific chat
   * @param chatId Chat ID
   */
  private stopPolling(chatId: number): void {
    if (this.activeChatPolling[chatId]) {
      this.activeChatPolling[chatId].next();
      this.activeChatPolling[chatId].complete();
      delete this.activeChatPolling[chatId];
    }
  }

  /**
   * Check for new messages and trigger callback
   * @param chatId Chat ID
   * @param messages Array of messages
   */
  private checkForNewMessages(chatId: number, messages: Message[]): void {
    if (!this.messageCallbacks[chatId] || messages.length === 0) {
      return;
    }

    const lastTimestamp = this.lastMessageTimestamps[chatId];
    const newMessages = lastTimestamp 
      ? messages.filter(msg => new Date(msg.created_at) > new Date(lastTimestamp))
      : [];

    // Update last message timestamp
    if (messages.length > 0) {
      this.lastMessageTimestamps[chatId] = messages[messages.length - 1].created_at;
    }

    // Trigger callback for new messages
    newMessages.forEach(message => {
      this.messageCallbacks[chatId](message);
    });
  }
}
