import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageInterceptorInterceptor implements HttpInterceptor {
  currentLocale: string;

  constructor(@Inject(LOCALE_ID) public locale: string) {
    this.currentLocale = this.locale.split('-', 1)[0];
  }
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('locale', this.currentLocale);
    // Clone the request to add the new header
    const clonedRequest = request.clone({
      headers: request.headers.set('accept-language', this.currentLocale),
    });
    // Pass the cloned request instead of the original request to the next handle
    return next.handle(clonedRequest);
  }
}
