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
    let hostname = window.location.hostname;
    const origin = window.location.origin;
    const lang = navigator.language?.substring(0, 2) || 'en';

    if (hostname.includes('localhost')) {
      hostname = 'neetechs.com'; // force production domain
    }

    this.mainDomain = hostname.replace(/^[^.]+\./, '');
    this.frontEndUrl = origin;
    this.mainDomain = hostname.includes('localhost')
      ? 'neetechs.com'
      : hostname.replace(/^[^.]+\./, '');

    this.serverUrl = `https://server.${this.mainDomain}/`;
    this.serverUrlWithoutSlash = this.serverUrl.slice(0, -1);
    this.chatUrl = `wss://server.${this.mainDomain}/ws/chat/`;
    this.loginUrl = `https://accounts.${this.mainDomain}/${lang}/`;

  }
}

}
