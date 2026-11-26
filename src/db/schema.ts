import {
  boolean,
  datetime,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const customers = mysqlTable(
  "customers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }),
    phone: varchar("phone", { length: 16 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("customers_phone_unique").on(table.phone)],
);

export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("categories_slug_unique").on(table.slug)],
);

export const subcategories = mysqlTable(
  "subcategories",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("subcategories_category_slug_unique").on(table.categoryId, table.slug),
    index("subcategories_category_idx").on(table.categoryId),
  ],
);

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    cuisine: varchar("cuisine", { length: 80 }).notNull(),
    description: text("description").notNull(),
    price: int("price").notNull(),
    pack: varchar("pack", { length: 60 }).notNull(),
    weightGrams: int("weight_grams").notNull().default(500),
    vegetarian: boolean("vegetarian").notNull().default(false),
    frozen: boolean("frozen").notNull().default(false),
    badge: varchar("badge", { length: 80 }),
    image: varchar("image", { length: 500 }).notNull(),
    ingredients: text("ingredients"),
    nutrition: json("nutrition").$type<{
      caloriesKcal: number;
      proteinGrams: number;
      carbohydratesGrams: number;
      fatGrams: number;
    } | null>(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_category_active_idx").on(table.category, table.isActive),
  ],
);

export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    orderNumber: varchar("order_number", { length: 32 }).notNull(),
    customerId: int("customer_id"),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 16 }).notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    requestedDeliveryAt: datetime("requested_delivery_at", { mode: "date" }).notNull(),
    status: mysqlEnum("status", [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ])
      .notNull()
      .default("pending"),
    paymentStatus: mysqlEnum("payment_status", [
      "pending",
      "paid",
      "refunded",
    ])
      .notNull()
      .default("pending"),
    paymentMethod: varchar("payment_method", { length: 40 }).notNull().default("upi"),
    subtotal: int("subtotal").notNull(),
    gstAmount: int("gst_amount").notNull().default(0),
    total: int("total").notNull(),
    customerNote: text("customer_note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("orders_number_unique").on(table.orderNumber),
    index("orders_status_created_idx").on(table.status, table.createdAt),
    index("orders_phone_idx").on(table.phone),
  ],
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("order_id").notNull(),
    productId: int("product_id"),
    productName: varchar("product_name", { length: 150 }).notNull(),
    quantity: int("quantity").notNull(),
    unitPrice: int("unit_price").notNull(),
    lineTotal: int("line_total").notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const promotions = mysqlTable(
  "promotions",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 160 }).notNull(),
    code: varchar("code", { length: 40 }),
    message: text("message").notNull(),
    enabled: boolean("enabled").notNull().default(false),
    startsAt: datetime("starts_at", { mode: "date" }),
    endsAt: datetime("ends_at", { mode: "date" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("promotions_code_unique").on(table.code)],
);

export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const admins = mysqlTable(
  "admins",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 254 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("admins_email_unique").on(table.email)],
);

export const transactions = mysqlTable(
  "transactions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id"),
    orderId: int("order_id"),
    transactionId: varchar("transaction_id", { length: 255 }).notNull(),
    transactionName: varchar("transaction_name", { length: 255 }), // e.g. "Payment for order KB-XXXX"
    paymentGateway: varchar("payment_gateway", { length: 100 }),
    types: varchar("types", { length: 255 }),
    amount: int("amount").notNull(),
    currency: varchar("currency", { length: 10 }).default("INR"),
    status: mysqlEnum("status", ["created", "authorized", "captured", "success", "failed", "processed", "pending", "refunded"]).notNull(),
    response: text("response"),
    failureReason: text("failure_reason"),
    paidAt: timestamp("paid_at"),
    provider: mysqlEnum("provider", ["phonepe", "razorpay", "cod", "manual"]).notNull(),
    type: mysqlEnum("type", ["payment", "refund"]).notNull(),
    providerTransactionId: varchar("provider_transaction_id", { length: 100 }),
    metadata: json("metadata").$type<Record<string, unknown>>(),



    // ---- Payment instrument (filled from the gateway callback/status) ----
    paymentMode: varchar("payment_mode", { length: 30 }), // COD | UPI | CARD | NET_BANKING | WALLET
    upiId: varchar("upi_id", { length: 100 }),            // payer VPA
    utr: varchar("utr", { length: 50 }),                  // bank reference / RRN
    bankId: varchar("bank_id", { length: 50 }),
    bankName: varchar("bank_name", { length: 100 }),
    cardType: varchar("card_type", { length: 30 }),       // CREDIT_CARD | DEBIT_CARD
    cardNetwork: varchar("card_network", { length: 30 }), // VISA, MASTERCARD...
    cardLast4: varchar("card_last4", { length: 4 }),      // NEVER store full card numbers

    // ---- Gateway references ----
    gatewayOrderId: varchar("gateway_order_id", { length: 100 }),
    gatewayPaymentId: varchar("gateway_payment_id", { length: 100 }),
    errorCode: varchar("error_code", { length: 100 }),

    // ---- Audit ----
    requestPayload: json("request_payload").$type<Record<string, unknown>>(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: varchar("user_agent", { length: 255 }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    orderIndex: index("idx_order_id").on(table.orderId),
    providerIdIndex: index("transactions_provider_id_index").on(table.providerTransactionId),
    transactionIdIndex: index("transactions_transaction_id_index").on(table.transactionId),
    gatewayOrderIndex: index("transactions_gateway_order_id_index").on(table.gatewayOrderId),
    utrIndex: index("transactions_utr_index").on(table.utr),
  }),
);
export const refunds = mysqlTable(
  "refunds",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("order_id").notNull(),
    transactionId: int("transaction_id").notNull(),
    providerRefundId: varchar("provider_refund_id", { length: 100 }),
    amount: int("amount").notNull(),
    reason: varchar("reason", { length: 500 }).notNull(),
    status: mysqlEnum("status", ["pending", "processed", "failed"]).notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    orderIndex: index("refunds_order_index").on(table.orderId),
    providerIdIndex: index("refunds_provider_id_index").on(table.providerRefundId),
  }),
);
export const countries = mysqlTable(
  "countries",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    sortname: varchar("sortname", { length: 100 }).notNull(),
  },
);

export const states = mysqlTable(
  "states",
  {
    id: int("id").autoincrement().primaryKey(),
    countryId: int("country_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (t) => ({
    byCountry: index("states_country_id_index").on(t.countryId),
  }),
);

export const cities = mysqlTable(
  "cities",
  {
    id: int("id").autoincrement().primaryKey(),
    stateId: int("state_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (t) => ({
    byState: index("cities_state_id_index").on(t.stateId),
  }),
);
export const carts = mysqlTable(
  "carts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id"), // nullable (guest carts)
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index("carts_user_idx").on(table.userId)],
);

export const cartDetails = mysqlTable(
  "cart_details",
  {
    id: int("id").autoincrement().primaryKey(),
    cartId: int("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: int("product_id").notNull(),
    quantity: int("quantity", { unsigned: true }).notNull().default(1),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("cart_details_cart_idx").on(table.cartId),
    index("cart_details_product_idx").on(table.productId),
    uniqueIndex("cart_details_cart_product_unique").on(table.cartId, table.productId),
  ],
);


export const whatsNew = mysqlTable(
  "whats_new",
  {
    id: int("id").autoincrement().primaryKey(),

    title: varchar("title", { length: 255 }).notNull(),

    description: text("description").notNull(),

    version: varchar("version", { length: 50 }),



    isPublished: boolean("is_published")
      .notNull()
      .default(true),

     createdAt: timestamp("created_at").notNull().defaultNow(),
    releasedAt: timestamp("released_at").notNull().defaultNow(),

  },
  (table) => ({
    releasedAtIdx: index("whats_new_released_at_idx").on(table.releasedAt),
    createdAtIdx: index("whats_new_created_at_idx").on(table.createdAt),
  })
);