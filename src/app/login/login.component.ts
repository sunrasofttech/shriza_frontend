import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  activeTab: 'email' | 'mobile' = 'email';
  hidePassword = true;
  loading = false;
  errorMsg = '';

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {
    this.loginForm = this.fb.group({
      email: [''],
      mobile: [''],
      password: ['']
    });
  }

  switchTab(tab: 'email' | 'mobile'): void {
    this.activeTab = tab;
    this.errorMsg = '';
  }

  login(): void {
    this.errorMsg = '';

    if (this.activeTab === 'email') {
      const { email, password } = this.loginForm.value;
      if (!email || !password) {
        this.errorMsg = 'Please enter your email and password.';
        return;
      }
      this.loading = true;
      this.auth.login(email, password).subscribe({
        next: () => { this.loading = false; this.router.navigate(['/home']); },
        error: (err) => { this.loading = false; this.errorMsg = extractError(err); }
      });
    } else {
      const { mobile } = this.loginForm.value;
      if (!mobile) {
        this.errorMsg = 'Please enter your mobile number.';
        return;
      }
      this.loading = true;
      this.auth.sendLoginOtp(mobile).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/verify-otp'], { queryParams: { mobile, purpose: 'login' } });
        },
        error: (err) => { this.loading = false; this.errorMsg = extractError(err); }
      });
    }
  }

  togglePassword(): void { this.hidePassword = !this.hidePassword; }

  loginWithGoogle(): void {}
  loginWithFacebook(): void {}

  continueAsGuest(): void {
    this.router.navigate(['/home']);
  }
}

function extractError(err: any): string {
  const body = err?.error;
  if (Array.isArray(body?.details) && body.details.length) {
    return body.details[0].message;
  }
  return body?.message || 'Something went wrong. Please try again.';
}
