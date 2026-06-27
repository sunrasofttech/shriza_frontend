import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  activeTab: 'email' | 'mobile' = 'email';

  hidePassword = true;

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {

    this.loginForm = this.fb.group({
      email: [''],
      mobile: [''],
      password: ['', Validators.required]
    });
  }

  switchTab(tab: 'email' | 'mobile') {
    this.activeTab = tab;
  }

  login() {

    if (this.activeTab === 'email') {

      if (!this.loginForm.value.email) {
        return;
      }

      console.log('Email Login', this.loginForm.value);

    } else {

      if (!this.loginForm.value.mobile) {
        return;
      }

      this.router.navigate(['/verify-otp'], {
        queryParams: { mobile: this.loginForm.value.mobile }
      });
    }
  }

  loginWithGoogle() {
    console.log('Google Login');
  }

  loginWithFacebook() {
    console.log('Facebook Login');
  }

  continueAsGuest() {
    console.log('Guest Login');
  }
}