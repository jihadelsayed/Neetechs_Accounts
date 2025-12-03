import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'neetechs-account';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('userToken');

    // current URL the router thinks we are on, e.g. `/en/login?return_url=...`
    const currentUrl = this.router.url;

    const isAuthRoute =
      currentUrl.includes('/login') ||
      currentUrl.includes('/signup') ||
      currentUrl.includes('/signIn') ||
      currentUrl.includes('/getCredential');

    // 🔥 If we’re already on an auth page, DO NOT redirect/re-navigate.
    if (isAuthRoute) {
      return;
    }

    // Only push user to /login when they try to open some other page
    if (!token || this.isTokenExpired(token)) {
      this.router.navigate(['/login'], {
        queryParamsHandling: 'preserve', // keep any query params if there are any
      });
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }
}
