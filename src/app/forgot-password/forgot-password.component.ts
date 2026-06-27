import { Component } from '@angular/core';
import { Router } from '@angular/router';

type ForgotStep = 'email' | 'otp' | 'password';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  step: ForgotStep = 'email';

  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';

  constructor(private router: Router) {}

  sendOtpCode(): void {
    if (!this.email) {
      return;
    }
    this.step = 'otp';
  }

  resendCode(): void {
    // OTP resend API integration pending
  }

  verifyOtp(): void {
    if (!this.otp) {
      return;
    }
    this.step = 'password';
  }

  updatePassword(): void {
    if (!this.newPassword || this.newPassword !== this.confirmPassword) {
      return;
    }
    this.router.navigate(['/login']);
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
