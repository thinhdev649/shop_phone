import type { AuthSession, LoginRequest, RegisterRequest } from '../types';

const AUTH_SESSION_KEY = 'authSession';

class AuthService {
  private async request<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const payload = await this.parseJson(response);

    if (!response.ok) {
      const message = this.getErrorMessage(payload) || `Request failed: ${response.status}`;
      throw new Error(message);
    }

    return payload as T;
  }

  async register(data: RegisterRequest): Promise<unknown> {
    const payload = this.cleanRegisterPayload(data);
    return this.request('/auth/register', payload);
  }

  async login(data: LoginRequest): Promise<AuthSession> {
    const response = await this.request<unknown>('/auth/login', data);
    const session = this.createSession(response, data.username);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: session }));
    return session;
  }

  logout(): void {
    localStorage.removeItem(AUTH_SESSION_KEY);
    window.dispatchEvent(new CustomEvent('auth:changed'));
  }

  getSession(): AuthSession | null {
    const stored = localStorage.getItem(AUTH_SESSION_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as AuthSession;
    } catch {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.getSession());
  }

  getAuthHeader(): Record<string, string> {
    const token = this.getSession()?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getDisplayName(): string {
    const session = this.getSession();
    return session?.fullName || session?.username || session?.email || 'Tài khoản';
  }

  private cleanRegisterPayload(data: RegisterRequest): RegisterRequest {
    const payload: RegisterRequest = {
      username: data.username.trim(),
      password: data.password,
      fullName: data.fullName.trim(),
      email: data.email.trim(),
    };

    if (data.role === 'ADMIN') {
      payload.role = 'ADMIN';
      payload.adminSecret = data.adminSecret?.trim() || '';
    }

    return payload;
  }

  private async parseJson(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  private getErrorMessage(payload: unknown): string {
    if (!payload || typeof payload !== 'object') return '';
    const record = payload as Record<string, unknown>;
    const data = record.data;

    return String(
      record.message ||
      record.error ||
      (data && typeof data === 'object' ? (data as Record<string, unknown>).message : '') ||
      ''
    );
  }

  private createSession(response: unknown, fallbackUsername: string): AuthSession {
    const data = this.extractData(response);
    const user = data.user && typeof data.user === 'object'
      ? data.user as Record<string, unknown>
      : data;

    return {
      token: this.extractToken(response, data),
      username: this.pickString(user, ['username', 'userName', 'login']) || fallbackUsername,
      fullName: this.pickString(user, ['fullName', 'name']),
      email: this.pickString(user, ['email']),
      role: this.pickString(user, ['role', 'authority']),
      raw: response,
    };
  }

  private extractData(response: unknown): Record<string, unknown> {
    if (!response || typeof response !== 'object') return {};
    const record = response as Record<string, unknown>;
    const data = record.data;

    if (typeof data === 'string') {
      return { token: data };
    }

    if (data && typeof data === 'object') {
      return data as Record<string, unknown>;
    }

    return record;
  }

  private extractToken(response: unknown, data: Record<string, unknown>): string | undefined {
    const root = response && typeof response === 'object' ? response as Record<string, unknown> : {};
    const token =
      this.pickString(data, ['token', 'accessToken', 'access_token', 'jwt']) ||
      this.pickString(root, ['token', 'accessToken', 'access_token', 'jwt']);

    return token || undefined;
  }

  private pickString(source: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return '';
  }
}

export const authService = new AuthService();
