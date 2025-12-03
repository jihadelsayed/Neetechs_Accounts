import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-get-credential',
  templateUrl: './get-credential.component.html',
  styleUrls: ['./get-credential.component.scss'],
})
export class GetCredentialComponent implements OnInit {
  host: string | null = null;
  language: string | null = null;
  pathname: string | null = null;

  userToken: string | null = null;
  userInfo: string | null = null;

  mainDomain = '';
  frontEndUrl = '';
  serverUrl = '';
  serverUrlWithoutSlash = '';
  chatUrl = '';
  loginUrl = '';

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      let hostname = window.location.hostname;
      let origin = window.location.origin;
      const lang = window.navigator.language?.substring(0, 2) || 'en';

      // When testing from localhost, force real domain
      if (hostname.includes('localhost')) {
        hostname = 'neetechs.com';
        origin = 'https://neetechs.com';
      }

      this.mainDomain = hostname;
      this.frontEndUrl = origin;
      this.language = lang;
      this.serverUrl = `https://server.${hostname}/`;
      this.serverUrlWithoutSlash = this.serverUrl.slice(0, -1);
      this.chatUrl = `wss://server.${hostname}/ws/chat/`;
      this.loginUrl = `https://accounts.neetechs.com/${lang}/getCredential`;
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // pull from localStorage on the accounts domain
    this.userToken = localStorage.getItem('userToken');
    this.userInfo = localStorage.getItem('UserInfo');

    this.route.queryParams.subscribe((params) => {
      this.host = params['host'] || null;
      this.language = params['language'] || this.language || 'en';
      this.pathname = params['pathname'] || '';

      console.log('GET CREDENTIAL PARAMS:', {
        host: this.host,
        language: this.language,
        pathname: this.pathname,
      });

      // If no host, we can’t safely postMessage – just bail
      if (!this.host) {
        return;
      }

      if (this.userToken) {
        // Sync cookies for *.neetechs.com so Django sees the session
        document.cookie = `userToken=${this.userToken}; domain=.neetechs.com; path=/; Secure; SameSite=None`;
        document.cookie = `UserInfo=${this.userInfo ?? ''}; domain=.neetechs.com; path=/; Secure; SameSite=None`;

        // Send credential back to parent window
        window.top?.postMessage(
          {
            type: 'credential',
            getToken: this.userToken,
            getUserInfo: this.userInfo,
          },
          this.host
        );
      } else {
        // No token stored on accounts → tell parent to show login
        window.top?.postMessage(
          { type: 'login_required' },
          this.host
        );
      }
    });
  }
}
