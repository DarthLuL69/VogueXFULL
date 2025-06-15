// Echo configuration for real-time chat messaging
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

// Declare types for window extensions
declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EchoService {
  private echoInitialized: boolean = false;

  constructor() {
    this.initEcho();
  }

  /**
   * Initialize Laravel Echo
   */
  private async initEcho(): Promise<void> {
    if (this.echoInitialized) return;

    try {
      // Dynamically import the libraries only when needed
      const { default: Echo } = await import('laravel-echo');
      const { default: Pusher } = await import('pusher-js');
      
      // Set up Pusher instance
      window.Pusher = Pusher;
      
      // Initialize Laravel Echo
      window.Echo = new Echo({
        broadcaster: 'pusher',
        key: environment.pusherKey ?? 'your_pusher_key', // Replace with your actual Pusher key
        cluster: environment.pusherCluster ?? 'mt1',
        wsHost: window.location.hostname,
        wsPort: 6001,
        wssPort: 6001,
        forceTLS: false,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
      });
      
      this.echoInitialized = true;
      console.log('Echo initialized');
    } catch (error) {
      console.error('Failed to initialize Echo:', error);
    }
  }

  /**
   * Listen to private chat channel
   * @param chatId ID of the chat to listen to
   * @param callback Callback function when a new message is received
   * @returns Echo subscription object
   */
  listenToChat(chatId: number, callback: (data: any) => void): any {
    if (!window.Echo) {
      console.warn('Echo not initialized, trying to initialize now');
      this.initEcho().then(() => this.listenToChat(chatId, callback));
      return;
    }

    return window.Echo.private(`chat.${chatId}`)
      .listen('.new.message', (e: any) => {
        callback(e);
      });
  }

  /**
   * Stop listening to a chat channel
   * @param chatId ID of the chat to stop listening to
   */
  stopListeningToChat(chatId: number): void {
    if (window.Echo) {
      window.Echo.leave(`chat.${chatId}`);
    }
  }

  /**
   * Disconnect from Laravel Echo Server
   * This should be called when the user logs out
   */
  disconnectEcho(): void {
    if (window.Echo) {
      window.Echo.disconnect();
      this.echoInitialized = false;
    }
  }
}
