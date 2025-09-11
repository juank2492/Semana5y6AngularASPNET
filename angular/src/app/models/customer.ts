export interface Customer {
  id: number;
  name: string;
  email?: string | null;
  createdAt?: string;
  createdBy?: number;
}

export type CustomerInput = Pick<Customer, 'name' | 'email'> & { id?: number };

