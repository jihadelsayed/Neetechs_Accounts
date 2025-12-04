import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Only touch calls going to your backend
    if (token && req.url.startsWith(environment.SERVER_URL)) {
      const url = req.url;

      // Don't send token to auth endpoints themselves
      const isAuthRoute =
        url.includes('/auth/login/') ||
        url.includes('/auth/register/') ||
        url.includes('/auth/logout/');

      if (!isAuthRoute) {
        const prefix = token.includes('.') ? 'Bearer' : 'Token';
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `${prefix} ${token}`),
        });
        return next.handle(authReq);
      }
    }

    return next.handle(req);
  }
}
