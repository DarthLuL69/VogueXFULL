import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../../../shared/services/order.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  error = '';
  isLoading = false;
  userId = 0; // This should be set from auth service
  showCancelModal = false;
  showShippingModal = false;
  isProcessing = false;
  cancelReason = '';
  trackingNumber = '';
  shippingNotes = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly orderService: OrderService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    if (orderId) {
      this.loadOrder(parseInt(orderId));
    } else {
      this.error = 'ID de pedido no válido';
    }
  }

  loadOrder(orderId: number): void {
    this.loading = true;
    this.orderService.getOrder(orderId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.order = response.data;
        } else {
          this.error = 'Pedido no encontrado';
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading order:', error);
        this.error = 'Error al cargar el pedido';
        this.loading = false;
      }
    });
  }

  // Additional methods needed by template
  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusTexts[status] || status;
  }

  getPaymentMethodText(paymentMethod: string): string {
    const methodTexts: { [key: string]: string } = {
      'visa': 'Visa',
      'debit': 'Tarjeta de débito',
      'apple_pay': 'Apple Pay',
      'paypal': 'PayPal'
    };
    return methodTexts[paymentMethod] || paymentMethod;
  }

  canCancelOrder(): boolean {
    return this.order?.status === 'pending' || this.order?.status === 'processing';
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelReason = '';
  }

  confirmCancel(): void {
    if (!this.order) return;
    
    this.isProcessing = true;
    this.orderService.cancelOrder(this.order.id, this.cancelReason).subscribe({
      next: (response) => {
        if (response.success) {
          this.order = response.data;
          this.closeCancelModal();
        } else {
          this.error = response.message || 'Error al cancelar el pedido';
        }
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Error canceling order:', error);
        this.error = 'Error al cancelar el pedido';
        this.isProcessing = false;
      }
    });
  }

  markAsReceived(): void {
    if (!this.order) return;
    
    this.updateStatus('delivered');
  }

  updateStatus(status: string): void {
    if (!this.order) return;

    this.isProcessing = true;
    this.orderService.updateOrderStatus({
      order_id: this.order.id,
      status: status as any,
      tracking_number: this.trackingNumber,
      notes: this.shippingNotes
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.order = response.data;
        } else {
          this.error = response.message || 'Error al actualizar el estado';
        }
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.error = 'Error al actualizar el estado del pedido';
        this.isProcessing = false;
      }
    });
  }

  openShippingModal(): void {
    this.showShippingModal = true;
  }

  closeShippingModal(): void {
    this.showShippingModal = false;
    this.trackingNumber = '';
    this.shippingNotes = '';
  }

  confirmShipping(): void {
    this.updateStatus('shipped');
    this.closeShippingModal();
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
