import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../shared/services/order.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';
  constructor(private readonly orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }
  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.orders = response.data;
        } else {
          this.error = 'Error al cargar los pedidos';
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.error = 'Error al cargar los pedidos';
        this.loading = false;
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'En camino',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }
  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  cancelOrder(orderId: number): void {
    const reason = prompt('¿Por qué quieres cancelar este pedido?');
    if (reason?.trim()) {
      this.orderService.cancelOrder(orderId, reason.trim()).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadOrders(); // Reload orders
            alert('Pedido cancelado exitosamente');
          } else {
            alert('Error al cancelar el pedido');
          }
        },
        error: (error: any) => {
          console.error('Error cancelling order:', error);
          alert('Error al cancelar el pedido');
        }
      });
    }
  }

  trackOrder(trackingNumber: string): void {
    // Open tracking in new window/tab
    const trackingUrl = `https://www.correos.es/ss/Satellite/site/pagina-localizador_busqueda/busqueda?buscar.x=0&buscar.y=0&numero=${trackingNumber}`;
    window.open(trackingUrl, '_blank');
  }
}
