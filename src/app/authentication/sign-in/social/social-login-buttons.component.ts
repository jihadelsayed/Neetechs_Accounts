import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  PLATFORM_ID,
} from '@angular/core';

@Component({
  selector: 'app-social-login-buttons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="oauth-buttons">
      <button
        type="button"
        class="oauth google"
        (click)="loginWithGoogle()"
      >
        Google
      </button>

      <button
        type="button"
        class="oauth apple"
        (click)="loginWithFacebook()"
      >
        Facebook
      </button>
    </div>
    <style>
  .oauth-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .oauth {
      flex: 1;
      padding: 0.6rem;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid #d3d3d3;
      background: white;
      color: #333;
      cursor: pointer;

      &:hover {
        background: #f5f5f5;
        transform: scale(1.01); // subtle lift effect
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      }

      &.google::before {
        content: "🔎 ";
        color: #004d40;
      }

      &.apple::before {
        content: " ";
        color: black; 
      }

      & + .oauth {
        margin-left: 1rem;
      }
    }
  }
      </style>
  `,
})
export class SocialLoginButtonsComponent {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  loginWithGoogle(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.location.href =
      'https://neetechs.com/auth/google/?process=login';
  }

  loginWithFacebook(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.location.href =
      'https://neetechs.com/auth/facebook/?process=login';
  }
}
