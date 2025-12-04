import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-password-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup-password-step.component.html',
    styleUrls: ['./signup-password-step.component.scss'],

})
export class SignupPasswordStepComponent {
  @Input() user!: { password1: string; password2: string };
  @Input() passwordStrength = { percent: 0, label: '', strengthClass: '' };
  @Input() strengthClass = '';
  @Input() passwordMismatch = false;
  @Input() showPassword = false;
  @Input() loading = false;

  // events sent back to parent
  @Output() showPasswordChange = new EventEmitter<boolean>();
  @Output() back = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  @Output() passwordInput = new EventEmitter<string>(); // for strength calc

  togglePassword(): void {
    this.showPasswordChange.emit(!this.showPassword);
  }

  onBack(): void {
    this.back.emit();
  }

  onSubmitClick(): void {
    this.submit.emit();
  }

  onPasswordInput(value: string): void {
    this.passwordInput.emit(value);
  }
}
