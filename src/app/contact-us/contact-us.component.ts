import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface ContactInfo {
  emailSupport: string | null;
  callSupport: string | null;
  headquarters: { label: string; address: string | null };
  lab: { name: string | null; address: string | null; mapEmbedUrl: string | null } | null;
  social: {
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    whatsapp: string | null;
  };
}

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  private base = `${environment.apiUrl}/api/public`;

  contactInfo: ContactInfo | null = null;
  infoLoading = true;

  form = { name: '', email: '', subject: '', message: '' };
  sending = false;
  success = false;
  errorMsg = '';
  fieldErrors: Record<string, string> = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${this.base}/contact-info`).subscribe({
      next: r => { this.contactInfo = r.data?.contactInfo ?? null; this.infoLoading = false; },
      error: () => { this.infoLoading = false; }
    });
  }

  get email(): string {
    return this.contactInfo?.emailSupport || 'support@shrizanaturals.com';
  }

  get phone(): string {
    return this.contactInfo?.callSupport || '+91 98765 43210';
  }

  get hqAddress(): string {
    return this.contactInfo?.headquarters?.address || 'Hiranandani Estate, Thane, MH';
  }

  sendMessage(): void {
    this.fieldErrors = {};
    this.errorMsg = '';

    if (!this.form.name.trim() || !this.form.email.trim() || !this.form.subject.trim() || !this.form.message.trim()) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.sending = true;
    const payload = {
      fullName: this.form.name.trim(),
      email: this.form.email.trim(),
      subject: this.form.subject.trim(),
      message: this.form.message.trim(),
    };

    this.http.post<any>(`${this.base}/contact`, payload, { withCredentials: true }).subscribe({
      next: () => {
        this.sending = false;
        this.success = true;
        this.form = { name: '', email: '', subject: '', message: '' };
      },
      error: err => {
        this.sending = false;
        const details: { field: string; message: string }[] = err?.error?.details || [];
        if (details.length) {
          details.forEach(d => {
            // map backend field names to our form keys
            const key = d.field === 'fullName' ? 'name' : d.field;
            this.fieldErrors[key] = d.message;
          });
        } else {
          this.errorMsg = err?.error?.message || 'Could not send message. Please try again.';
        }
      }
    });
  }

  resetSuccess(): void {
    this.success = false;
  }
}
