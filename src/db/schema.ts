import {
  boolean,
  datetime,
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
    id: varchar("id", { length: 36 }).primaryKey(),
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
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("categories_slug_unique").on(table.slug)],
);

export const products = mysqlTable(
  "products",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
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
    id: varchar("id", { length: 36 }).primaryKey(),
    orderNumber: varchar("order_number", { length: 32 }).notNull(),
    customerId: varchar("customer_id", { length: 36 }),
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
    id: varchar("id", { length: 36 }).primaryKey(),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }),
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
    id: varchar("id", { length: 36 }).primaryKey(),
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
