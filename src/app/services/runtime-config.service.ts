import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  public serverUrl = '';
  public serverUrlWithoutSlash = '';
  public frontEndUrl = '';
  public chatUrl = '';
  public loginUrl = '';
  public mainDomain = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const hostname = window.location.hostname;
      const origin = window.location.origin;
      const domain = window.location.hostname.replace(/^[^.]+\./, '');

      this.mainDomain = domain;
      this.frontEndUrl = origin;
      this.serverUrl = `https://api.${hostname}/`;
      this.serverUrlWithoutSlash = this.serverUrl.slice(0, -1);
      this.chatUrl = `wss://api.${hostname}/ws/chat/`;
      this.loginUrl = `https://accounts.${hostname}/`;
    }
  }
}
