import { Component } from '@angular/core';
import { OrderService } from '../order.service';

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

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.css']
})
export class TrackOrderComponent {
  constructor(public order: OrderService) {}

  steps: ProgressStep[] = [
    { label: 'Ordered', desc: 'Order received & confirmed', status: 'done', icon: 'check' },
    { label: 'Packed', desc: 'Packed at Shriza warehouse', status: 'current', icon: 'box' },
    { label: 'Shipped', desc: 'Handed to Delhivery logistics', status: 'pending', icon: 'truck' },
    { label: 'Out for Delivery', desc: 'Nearest hub, out on vehicle', status: 'pending', icon: 'compass' },
    { label: 'Delivered', desc: 'Delivered to your doorstep', status: 'pending', icon: 'flag' }
  ];

  courier = {
    partner: 'Delhivery Express',
    awb: 'DEL982103445'
  };

  activityLog: ActivityEntry[] = [
    {
      title: 'Package Packed',
      timestamp: '2026-06-23 04:00 PM',
      desc: 'Your items have been carefully packed in amber glass and sealed.',
      status: 'current'
    },
    {
      title: 'Order Confirmed',
      timestamp: '2026-06-23 10:30 AM',
      desc: 'We have received your payment and confirmed your order.',
      status: 'pending'
    }
  ];
}
