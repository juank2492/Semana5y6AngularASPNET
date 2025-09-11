import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CustomersService } from '../../services/customers.service';
import { Customer, CustomerInput } from '../../models/customer';
import { Observable, map } from 'rxjs';

declare const bootstrap: any;
declare const Swal: any;

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  private svc = inject(CustomersService);

  customers = signal<Customer[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  // Modal state
  modalRef: any = null;
  modalTitle = signal('');
  model: CustomerInput = { name: '', email: '' };
  editingId: number | null = null;

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (list) => this.customers.set(list),
      error: () => this.error.set('No se pudieron cargar los clientes'),
      complete: () => this.loading.set(false)
    });
  }

  openNew(modalEl: HTMLElement) {
    this.modalTitle.set('Nuevo Cliente');
    this.model = { name: '', email: '' };
    this.editingId = null;
    this.openModal(modalEl);
  }

  openEdit(modalEl: HTMLElement, c: Customer) {
    this.modalTitle.set('Editar Cliente');
    this.model = { id: c.id, name: c.name, email: c.email ?? '' };
    this.editingId = c.id;
    this.openModal(modalEl);
  }

  openModal(modalEl: HTMLElement) {
    this.modalRef = bootstrap ? new bootstrap.Modal(modalEl) : null;
    if (this.modalRef) this.modalRef.show();
  }

  closeModal() {
    if (this.modalRef) this.modalRef.hide();
  }

  submit(f: NgForm) {
    if (!f.valid) return;
    this.saving.set(true);
    const op: Observable<void> = this.editingId
      ? this.svc.update(this.editingId, { name: this.model.name, email: this.model.email })
      : this.svc.create({ name: this.model.name, email: this.model.email }).pipe(map(() => void 0));
    op.subscribe({
      next: () => {
        this.closeModal();
        this.refresh();
      },
      error: () => this.error.set('No se pudo guardar el cliente'),
      complete: () => this.saving.set(false)
    });
  }

  async confirmDelete(c: Customer) {
    if (!Swal) return;
    const res = await Swal.fire({
      title: '¿Eliminar cliente?',
      text: `Se eliminará "${c.name}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });
    if (res.isConfirmed) {
      this.svc.delete(c.id).subscribe({
        next: () => this.refresh(),
        error: () => this.error.set('No se pudo eliminar el cliente')
      });
    }
  }
}
