import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';
import * as Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class PusherService {
  private pusher: any;
  private channels: { [key: string]: any } = {};

  constructor(private authService: AuthService) {
    this.initializePusher();
  }

  /**
   * Initialize Pusher connection with proper error handling
   */
  private initializePusher(): void {
    try {
      // Check if Pusher key is properly configured
      if (environment.pusher?.key === 'your-actual-pusher-key' || 
          !environment.pusher?.key) {
        console.warn('Pusher not configured. Please set proper Pusher key in environment.');
        return;
      }

      this.pusher = new Pusher(environment.pusher.key, {
        cluster: environment.pusher.cluster,
        forceTLS: environment.pusher.forceTLS,
        authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`
          }
        }
      });
      
      console.log('Pusher initialized successfully');
    } catch (error) {
      console.error('Error initializing Pusher:', error);
    }
  }

  /**
   * Subscribe to a channel
   */
  subscribeToChannel(channelName: string) {
    try {
      if (!this.pusher) {
        console.warn('Pusher not initialized');
        return null;
      }
      
      if (!this.channels[channelName]) {
        this.channels[channelName] = this.pusher.subscribe(channelName);
        console.log(`Subscribed to channel: ${channelName}`);
      }
      
      return this.channels[channelName];
    } catch (error) {
      console.error(`Error subscribing to channel ${channelName}:`, error);
      return null;
    }
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribeFromChannel(channelName: string): void {
    if (!this.pusher || !this.channels[channelName]) {
      return;
    }

    try {
      this.pusher.unsubscribe(channelName);
      delete this.channels[channelName];
      console.log(`Unsubscribed from channel: ${channelName}`);
    } catch (error) {
      console.error(`Error unsubscribing from channel ${channelName}:`, error);
    }
  }

  /**
   * Listen to an event on a channel
   */
  listen(channelName: string, eventName: string, callback: (data: any) => void) {
    const channel = this.subscribeToChannel(channelName);
    if (channel) {
      channel.bind(eventName, callback);
      console.log(`Listening to ${eventName} on ${channelName}`);
    }
  }

  /**
   * Stop listening to an event on a channel
   */
  stopListening(channelName: string, eventName: string): void {
    if (!this.channels[channelName]) {
      return;
    }

    this.channels[channelName].unbind(eventName);
    console.log(`Stopped listening to ${eventName} on ${channelName}`);
  }

  /**
   * Clean up all Pusher subscriptions
   */
  cleanup(): void {
    Object.keys(this.channels).forEach(channel => {
      this.unsubscribeFromChannel(channel);
    });
  }
}
