import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService, TrackingData } from '../order.service';

type StepStatus = 'done' | 'current' | 'pending';
type StepIcon = 'check' | 'box' | 'truck' | 'compass' | 'flag';

interface ProgressStep {
  label: string;
  desc: string;
  status: StepStatus;
  icon: StepIcon;
}

interface ActivityEntry {
  title: string;
  timestamp: string;
  desc: string;
  status: StepStatus;
}

const STEP_ICON_MAP: Record<string, StepIcon> = {
  ordered:          'check',
  packed:           'box',
  shipped:          'truck',
  out_for_delivery: 'compass',
  delivered:        'flag',
};

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.css']
})
export class TrackOrderComponent implements OnInit {
  constructor(public orderService: OrderService, private route: ActivatedRoute) {}

  loading = false;
  error = '';
  tracking: TrackingData | null = null;

  steps: ProgressStep[] = [];
  activityLog: ActivityEntry[] = [];

  searchInput = '';
  searchLoading = false;
  searchError = '';

  ngOnInit(): void {
    const qpNum    = this.route.snapshot.queryParamMap.get('orderNumber');
    const placedNum = this.orderService.placedOrder?.orderNumber;
    const num = qpNum || placedNum;
    if (num) {
      this.loadTracking(num);
    }
  }

  loadTracking(orderNumber: string): void {
    this.loading = true;
    this.error = '';
    this.tracking = null;
    this.orderService.fetchOrderTracking(orderNumber).subscribe({
      next: data => {
        this.loading = false;
        this.tracking = data;
        this.steps = this.buildSteps(data);
        this.activityLog = this.buildActivityLog(data);
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message || 'Could not load tracking info. Please try again.';
      }
    });
  }

  searchOrder(): void {
    const q = this.searchInput.trim();
    if (!q) return;
    this.searchError = '';
    this.loadTracking(q);
  }

  private buildSteps(data: TrackingData): ProgressStep[] {
    const { steps, currentStep } = data.deliveryProgress;
    const allDone = steps.every(s => s.completed);
    return steps.map(s => {
      let status: StepStatus;
      if (!s.completed) {
        status = 'pending';
      } else if (allDone || s.key !== currentStep) {
        status = 'done';
      } else {
        status = 'current';
      }
      return {
        label:  s.label,
        desc:   s.description,
        icon:   STEP_ICON_MAP[s.key] || 'check',
        status,
      };
    });
  }

  private buildActivityLog(data: TrackingData): ActivityEntry[] {
    return data.activityLog.map((e, i) => ({
      title:     e.label,
      timestamp: this.formatTimestamp(e.timestamp),
      desc:      e.description || '',
      status:    (i === 0 ? 'current' : 'pending') as StepStatus,
    }));
  }

  private formatTimestamp(ts: string): string {
    if (!ts) return '';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  }
}
