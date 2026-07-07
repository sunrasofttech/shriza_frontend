import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  submitted = false;
  loading = false;
  errorMsg = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        full_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  get f() { return this.signupForm.controls; }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirm_password')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  register(): void {
    this.submitted = true;
    this.errorMsg = '';

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.auth.register({
      name: this.signupForm.value.full_name,
      email: this.signupForm.value.email,
      phone: this.signupForm.value.mobile,
      password: this.signupForm.value.password,
      confirmPassword: this.signupForm.value.confirm_password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/verify-otp'], {
          queryParams: { mobile: this.signupForm.value.mobile, purpose: 'register' }
        });
      },
      error: (err) => {
        this.loading = false;
        const body = err?.error;
        this.errorMsg = (Array.isArray(body?.details) && body.details.length)
          ? body.details[0].message
          : (body?.message || 'Registration failed. Please try again.');
      }
    });
  }

  togglePassword(): void { this.hidePassword = !this.hidePassword; }
  toggleConfirmPassword(): void { this.hideConfirmPassword = !this.hideConfirmPassword; }
}
