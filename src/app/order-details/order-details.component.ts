import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService, OrderDetail } from '../order.service';

const RETURN_REASONS: { value: string; label: string }[] = [
  { value: 'received_damaged',  label: 'Received Damaged'     },
  { value: 'wrong_item',        label: 'Wrong Item Delivered'  },
  { value: 'not_as_described',  label: 'Not As Described'      },
  { value: 'changed_mind',      label: 'Changed My Mind'       },
  { value: 'defective',         label: 'Product Defective'     },
  { value: 'missing_item',      label: 'Item Missing in Order' },
  { value: 'other',             label: 'Other'                 },
];

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  constructor(private route: ActivatedRoute, public orderService: OrderService) {}

  loading = false;
  error = '';
  detail: OrderDetail | null = null;

  showReturnForm = false;
  returnReasons = RETURN_REASONS;
  returnForm = { reason: '', description: '', returnType: 'refund' as 'refund' | 'exchange' };
  returnLoading = false;
  returnError = '';
  returnSuccess = '';

  ngOnInit(): void {
    const num =
      this.route.snapshot.queryParamMap.get('order') ||
      this.orderService.placedOrder?.orderNumber;
    if (num) {
      this.load(num);
    } else {
      this.error = 'No order specified. Please navigate here from your order history.';
    }
  }

  load(orderNumber: string): void {
    this.loading = true;
    this.error = '';
    this.orderService.fetchOrderDetail(orderNumber).subscribe({
      next: d => { this.loading = false; this.detail = d; },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message || 'Could not load order details.';
      }
    });
  }

  get canReturn(): boolean {
    if (!this.detail || this.detail.status !== 'delivered') return false;
    if (!this.detail.deliveredAt) return true;
    const days = (Date.now() - new Date(this.detail.deliveredAt).getTime()) / 86_400_000;
    return days <= 7;
  }

  submitReturn(): void {
    if (!this.detail || !this.returnForm.reason) return;
    this.returnLoading = true;
    this.returnError = '';
    this.orderService.requestReturn(this.detail.orderNumber, {
      reason:      this.returnForm.reason,
      description: this.returnForm.description || undefined,
      returnType:  this.returnForm.returnType,
    }).subscribe({
      next: () => {
        this.returnLoading = false;
        this.returnSuccess = 'Return request submitted. We will review it within 24 hours.';
        this.showReturnForm = false;
        if (this.detail) this.detail = { ...this.detail, status: 'return_requested' };
      },
      error: err => {
        this.returnLoading = false;
        this.returnError = err?.error?.message || 'Could not submit return request. Please try again.';
      }
    });
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    const date = new Date(d);
    return isNaN(date.getTime()) ? d : date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  statusLabel(s: string): string {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
