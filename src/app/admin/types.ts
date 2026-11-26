import type { Product } from "@/lib/catalog";

export type ProductFields = {
  name: string;
  slug: string;
  category: string;
  cuisine: string;
  description: string;
  price: number;
  pack: string;
  weightGrams: number;
  vegetarian: boolean;
  frozen: boolean;
  badge: string | null;
  image: string;
  ingredients: string | null;
  isActive: boolean;
};

export type ProductRecord = ProductFields & Pick<Product, "nutrition"> & { id: number };

export type OrderRecord = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  requestedDeliveryAt: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: { productName: string; quantity: number }[];
};

export type PromotionRecord = {
  id: number;
  title: string;
  code: string | null;
  message: string;
  enabled: boolean;
};

export type CategoryRecord = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export type TransactionRecord = {
  id: number;
  userId: number | null;
  orderId: number | null;
  orderNumber: string | null;
  customerName: string | null;
  transactionId: string;
  transactionName: string | null;
  paymentGateway: string | null;
  types: string | null;
  amount: number;
  currency: string | null;
  status: string;
  response: string | null;
  failureReason: string | null;
  paidAt: string | null;
  provider: "phonepe" | "razorpay" | "cod" | "manual";
  type: "payment" | "refund";
  providerTransactionId: string | null;
  metadata: Record<string, unknown> | null;
  paymentMode: string | null;
  upiId: string | null;
  utr: string | null;
  bankId: string | null;
  bankName: string | null;
  cardType: string | null;
  cardNetwork: string | null;
  cardLast4: string | null;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  errorCode: string | null;
  requestPayload: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Section =
  | "Overview"
  | "Products"
  | "Categories"
  | "Orders"
  | "Transactions"
  | "Promotions"
  | "What's New";

export type RequestResult<T> = T & { error?: string };

export type WhatsNewRecord = {
  id: number;
  title: string;
  description: string;
  version: string | null;
  releasedAt: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};
