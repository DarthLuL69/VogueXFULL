import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService, ContactMessage, ContactStats } from '../../../shared/services/contact.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-messages.component.html',
  styleUrl: './admin-messages.component.scss'
})
export class AdminMessagesComponent implements OnInit {
  messages: ContactMessage[] = [];
  selectedMessage: ContactMessage | null = null;
  stats: any = {};
  loading = false;
  currentPage = 1;
  totalPages = 1;
  filter: 'all' | 'unread' | 'read' = 'all';
  unreadCount = 0;

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.loadMessages();
    this.loadStats();
  }

  loadMessages() {
    this.loading = true;
    const status = this.filter === 'all' ? undefined : this.filter;
    
    this.contactService.getMessages(this.currentPage, status).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages = response.data.data;
          this.currentPage = response.data.current_page;
          this.totalPages = response.data.last_page;
          this.unreadCount = response.unread_count;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.loading = false;
      }
    });
  }

  loadStats() {
    this.contactService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  selectMessage(message: ContactMessage) {
    this.selectedMessage = message;
    
    // Marcar como leído si no lo está
    if (!message.is_read) {
      this.markAsRead(message.id!);
    }
  }

  markAsRead(id: number) {
    this.contactService.markAsRead(id).subscribe({
      next: (response) => {
        if (response.success) {
          const message = this.messages.find(m => m.id === id);
          if (message) {
            message.is_read = true;
            message.read_at = new Date().toISOString();
          }
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      },
      error: (error) => {
        console.error('Error marking as read:', error);
      }
    });
  }

  markAsUnread(id: number) {
    this.contactService.markAsUnread(id).subscribe({
      next: (response) => {
        if (response.success) {
          const message = this.messages.find(m => m.id === id);
          if (message) {
            message.is_read = false;
            message.read_at = undefined;
          }
          this.unreadCount++;
        }
      },
      error: (error) => {
        console.error('Error marking as unread:', error);
      }
    });
  }

  deleteMessage(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      this.contactService.deleteMessage(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.messages = this.messages.filter(m => m.id !== id);
            if (this.selectedMessage?.id === id) {
              this.selectedMessage = null;
            }
          }
        },
        error: (error) => {
          console.error('Error deleting message:', error);
        }
      });
    }
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadMessages();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadMessages();
  }

  closeMessageDetail() {
    this.selectedMessage = null;
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
