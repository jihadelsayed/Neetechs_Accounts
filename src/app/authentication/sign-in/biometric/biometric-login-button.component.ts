import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  Input,
  PLATFORM_ID,
} from '@angular/core';
import { WebAuthnService } from '../../services/webauthn.service';


@Component({
  selector: 'app-biometric-login-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" (click)="loginWithBiometric()">
      dY"? Login with Face/Touch ID
    </button>
  `,
  styleUrls: ['../sign-in.component.scss'],
})
export class BiometricLoginButtonComponent {
  /** Optional return URL for redirect after biometric login */
  @Input() returnUrl: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private webauthnService: WebAuthnService,
  ) {}

  loginWithBiometric(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const userInfoRaw = localStorage.getItem('UserInfo') || '{}';
    const userId = JSON.parse(userInfoRaw).id;

    if (!userId) {
      console.error('Biometric login: no userId found in UserInfo.');
      return;
    }

    this.webauthnService
      .login(userId)
      .then((res) => {
        // store token (same as before)
        if (res?.token) {
          localStorage.setItem('userToken', res.token);
        }

        // redirect (same logic as before)
        const target = this.computeRedirectTarget();
        window.location.href = target;
      })
      .catch((err) => {
        console.error('Biometric login failed', err);
      });
  }

  private computeRedirectTarget(): string {
    if (this.returnUrl) {
      let target = this.returnUrl;
      try {
        target = decodeURIComponent(this.returnUrl);
      } catch {}
      return target;
    }
    return 'https://neetechs.com/en/';
  }
}
