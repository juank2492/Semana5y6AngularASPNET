import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CustomersComponent } from '../customers/customers.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CustomersComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = this.auth.getUsername();
  active = 'clientes';
  year = new Date().getFullYear();

  logout() {
    this.auth.logout();
  }
}
