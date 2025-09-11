import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from './cookie.service';
import { API_BASE } from './api.config';

interface LoginResponse { token: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cookies = new CookieService();

  // Ajusta si tu API corre en otro host/puerto
  private readonly TOKEN_NAME = 'jwt_token';
  private logoutTimer: any = null;

  isAuthenticated = signal<boolean>(this.isTokenValid());

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${API_BASE}/api/auth/login`, { username, password });
  }

  handleLoginSuccess(token: string) {
    const exp = this.getTokenExpiration(token);
    const expiresDate = exp ? new Date(exp * 1000) : undefined;
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    this.cookies.set(this.TOKEN_NAME, token, expiresDate, '/', secure);
    this.isAuthenticated.set(true);
    this.scheduleAutoLogout();
  }

  logout() {
    this.cookies.delete(this.TOKEN_NAME);
    this.isAuthenticated.set(false);
    if (this.logoutTimer) { clearTimeout(this.logoutTimer); this.logoutTimer = null; }
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return this.cookies.get(this.TOKEN_NAME); }

  private getTokenPayload(token: string | null): any | null {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  getTokenExpiration(token: string | null = this.getToken()): number | null {
    const payload = this.getTokenPayload(token);
    return payload?.exp ?? null;
  }

  isTokenValid(token: string | null = this.getToken()): boolean {
    if (!token) return false;
    const exp = this.getTokenExpiration(token);
    if (!exp) return false;
    return Date.now() < exp * 1000;
  }

  scheduleAutoLogout() {
    if (this.logoutTimer) { clearTimeout(this.logoutTimer); this.logoutTimer = null; }
    const token = this.getToken();
    const exp = this.getTokenExpiration(token);
    if (!token || !exp) return;
    const ms = exp * 1000 - Date.now();
    if (ms <= 0) { this.logout(); return; }
    this.logoutTimer = setTimeout(() => this.logout(), ms);
  }

  getUsername(): string | null {
    const payload = this.getTokenPayload(this.getToken());
    return payload?.unique_name ?? payload?.name ?? null;
  }
}
