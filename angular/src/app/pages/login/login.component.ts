import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = false;

  submit(f: NgForm) {
    if (!f.valid) return;
    this.error.set(null);
    this.loading.set(true);
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.auth.handleLoginSuccess(res.token);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Credenciales inválidas');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  ngOnInit() {
    if (this.auth.isTokenValid()) {
      this.auth.scheduleAutoLogout();
      this.router.navigate(['/home']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
