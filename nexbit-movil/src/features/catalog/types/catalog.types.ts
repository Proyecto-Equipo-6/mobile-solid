export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  available: boolean;
  createdAt: string;
};

export type CreateProductPayload = {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  available: boolean;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;