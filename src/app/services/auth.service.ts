import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  user?: any;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'authToken';
  private readonly userKey = 'authUser';

  constructor(private http: HttpClient) {}

  /** REGISTER: email OR phone + password (+ optional names) */
  register(payload: {
    identifier: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
  }): Observable<AuthResponse> {
    const body: any = {
      password: payload.password,
      confirm_password: payload.confirmPassword,
    };

    if (this.isEmail(payload.identifier)) {
      body.email = payload.identifier;
    } else {
      body.phone = payload.identifier;
    }
    if (payload.firstName) body.first_name = payload.firstName;
    if (payload.lastName) body.last_name = payload.lastName;

    return this.http
      .post<AuthResponse>(`${environment.SERVER_URL}auth/register/`, body)
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  /** LOGIN: identifier (email or phone) + password */
  login(payload: { identifier: string; password: string }): Observable<AuthResponse> {
    const body = {
      identifier: payload.identifier,
      password: payload.password,
    };
    return this.http
      .post<AuthResponse>(`${environment.SERVER_URL}auth/login/`, body)
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  /** LOGOUT: send token to Django, then clear local storage */
  logout(): Observable<any> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Token ${token}` })
      : undefined;

    return this.http
      .post(`${environment.SERVER_URL}auth/logout/`, {}, { headers })
      .pipe(tap(() => this.clear()));
  }

  /** Called from login/register paths to persist session */
  private handleAuthResponse(res: AuthResponse | null | undefined): void {
    if (!res) return;
    if (res.token) {
      this.setToken(res.token);
    }
    if (res.user) {
      this.setUser(res.user);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): any | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  setUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clear(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  private isEmail(value: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  }
}
