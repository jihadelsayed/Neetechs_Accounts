import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class DeviceIdService {
  private key = 'device_id';
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getOrGenerateDeviceId(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    let id = localStorage.getItem(this.key);
    if (!id) {
      id = crypto.randomUUID(); // Use native secure UUID
      localStorage.setItem(this.key, id);
    }
    return id;
  }
}
