import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';
import { Customer, CustomerInput } from '../models/customer';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private http = inject(HttpClient);

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${API_BASE}/api/customers`);
  }

  create(input: CustomerInput): Observable<Customer> {
    return this.http.post<Customer>(`${API_BASE}/api/customers`, input);
  }

  update(id: number, input: CustomerInput): Observable<void> {
    return this.http.put<void>(`${API_BASE}/api/customers/${id}`, { id, ...input });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/api/customers/${id}`);
  }
}

