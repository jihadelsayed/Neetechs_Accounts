import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PhoneService } from '../../services/phone-service.service';

@Component({
  selector: 'app-signup-phone-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Re-use the signup SCSS so the design matches
  styleUrls: ['../sign-up.component.scss'],
  templateUrl: './signup-phone-verification.component.html',
})
export class SignupPhoneVerificationComponent {
  @Input() selectedCountry: string = 'US';
  @Input() phone: string = '';

  @Output() back = new EventEmitter<void>();
  @Output() verify = new EventEmitter<void>();

  constructor(public phoneService: PhoneService) {}

  get formattedPhone(): string {
    return this.phoneService.getFullPhoneNumber(
      this.selectedCountry,
      this.phone
    );
  }

  onBack() {
    this.back.emit();
  }

  onVerify() {
    this.verify.emit();
  }
}
