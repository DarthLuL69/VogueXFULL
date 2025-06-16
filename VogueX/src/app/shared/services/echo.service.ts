// Echo configuration for real-time chat messaging
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally
(window as any).Pusher = Pusher;

@Injectable({
  providedIn: 'root'
})
export class EchoService {
  private echo: Echo<any> | null = null;
  private echoInitialized = false;

  constructor(private authService: AuthService) {
    this.initEcho();
  }

  /**
   * Initialize Laravel Echo
   */
  private initEcho(): void {
    try {
      // Check if Pusher is properly configured
      if (!environment.pusher?.key || environment.pusher.key === 'your_pusher_key') {
        console.warn('Pusher not configured properly. Real-time features disabled.');
        return;
      }

      this.echo = new Echo({
        broadcaster: 'pusher',
        key: environment.pusher.key,
        cluster: environment.pusher.cluster ?? 'eu',
        forceTLS: environment.pusher.forceTLS,
        authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`
          }
        },
        enabledTransports: ['ws', 'wss'],
      });
      
      this.echoInitialized = true;
      console.log('Echo initialized successfully');
    } catch (error) {
      console.error('Error initializing Echo:', error);
      this.echoInitialized = false;
    }
  }

  /**
   * Subscribe to a channel
   */
  subscribeToChannel(channelName: string) {
    if (!this.echo || !this.echoInitialized) {
      console.warn('Echo not initialized');
      return null;
    }

    try {
      return this.echo.channel(channelName);
    } catch (error) {
      console.error(`Error subscribing to channel ${channelName}:`, error);
      return null;
    }
  }

  /**
   * Subscribe to a private channel
   */
  subscribeToPrivateChannel(channelName: string) {
    if (!this.echo || !this.echoInitialized) {
      console.warn('Echo not initialized');
      return null;
    }

    try {
      return this.echo.private(channelName);
    } catch (error) {
      console.error(`Error subscribing to private channel ${channelName}:`, error);
      return null;
    }
  }

  /**
   * Listen to an event on a channel
   */
  listen(channelName: string, eventName: string, callback: (data: any) => void) {
    const channel = this.subscribeToChannel(channelName);
    if (channel) {
      channel.listen(eventName, callback);
    }
  }

  /**
   * Listen to chat events
   */
  listenToChat(chatId: number, callback: (data: any) => void) {
    const channelName = `chat.${chatId}`;
    const channel = this.subscribeToPrivateChannel(channelName);
    if (channel) {
      channel.listen('MessageSent', callback);
    }
  }

  /**
   * Stop listening to chat events
   */
  stopListeningToChat(chatId: number): void {
    if (this.echo) {
      const channelName = `chat.${chatId}`;
      this.echo.leave(channelName);
    }
  }

  /**
   * Disconnect Echo
   * This should be called when the user logs out
   */
  disconnectEcho(): void {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
      this.echoInitialized = false;
      console.log('Echo disconnected');
    }
  }
}
