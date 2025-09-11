export class CookieService {
  set(name: string, value: string, expires?: Date, path: string = '/', secure: boolean = false) {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}`;
    if (expires) cookie += `; expires=${expires.toUTCString()}`;
    if (secure) cookie += '; Secure';
    cookie += '; SameSite=Lax';
    document.cookie = cookie;
  }

  get(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  delete(name: string, path: string = '/') {
    this.set(name, '', new Date(0), path);
  }
}

