import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent {
  form = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  submitted = false;

  sendMessage(): void {
    this.submitted = true;
    // API integration pending
    console.log('Contact form submitted', this.form);
  }
}
