export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type DeliveryAddress = {
  address: string;
  city: string;
  notes?: string;
};

export type PaymentMethod = 'cash_on_delivery';

export type OrderStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryAddress: DeliveryAddress;
  status: OrderStatus;
  createdAt: string;
  driverId?: string;
};

export type CreateOrderPayload = {
  items: { productId: string; quantity: number }[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
};

export type CartTotals = {
  subtotal: number;
  deliveryFee: number;
  total: number;
};