"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import AdminSidebar from "./admin-sidebar";
import CategoriesSection from "./sections/categories-section";
import OrdersSection from "./sections/orders-section";
import OverviewSection from "./sections/overview-section";
import ProductsSection from "./sections/products-section";
import PromotionsSection from "./sections/promotions-section";
import TransactionsSection from "./sections/transactions-section";
import WhatsNewSection from "./sections/whats-new-section";
import type {
  CategoryRecord,
  OrderRecord,
  ProductRecord,
  PromotionRecord,
  Section,
  TransactionRecord,
} from "./types";
import { ErrorBanner } from "./ui";
import { requestJson } from "./utils";
import { LoginScreen } from "./login-screen";
import { AdminHeader } from "./admin-header";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [section, setSection] = useState<Section>("Overview");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Lets the Overview "Add a menu item" shortcut open the product dialog after switching sections.
  const [startNewProduct, setStartNewProduct] = useState(false);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productResult, categoryResult, orderResult, promotionResult, transactionResult] = await Promise.all([
        requestJson<{ products: ProductRecord[] }>("/api/admin/products"),
        requestJson<{ categories: CategoryRecord[] }>("/api/admin/categories"),
        requestJson<{ orders: OrderRecord[] }>("/api/admin/orders"),
        requestJson<{ promotions: PromotionRecord[] }>("/api/admin/promotions"),
        requestJson<{ transactions: TransactionRecord[] }>("/api/admin/transactions"),
      ]);
      setProducts(productResult.products);
      setCategories(categoryResult.categories);
      setOrders(orderResult.orders);
      setPromotions(promotionResult.promotions);
      setTransactions(transactionResult.transactions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The admin data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session")
      .then(async (response) => {
        const result = (await response.json()) as { authenticated: boolean };
        if (active) setAuthenticated(result.authenticated);
        if (result.authenticated && active) await loadAdminData();
      })
      .catch(() => {
        if (active) {
          setAuthenticated(false);
          setError("Could not reach the admin service.");
        }
      });
    return () => {
      active = false;
    };
  }, [loadAdminData]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestJson("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuthenticated(true);
      setPassword("");
      await loadAdminData();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setProducts([]);
    setCategories([]);
    setOrders([]);
    setPromotions([]);
    setTransactions([]);
    setSection("Overview");
  }

  const handleStartNewHandled = useCallback(() => setStartNewProduct(false), []);
  const pendingOrders = orders.filter((order) => order.status === "pending").length;

  if (authenticated === null) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5ef] text-sm text-[#747166]">
        <p>Opening your workspace…</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <LoginScreen
        email={email}
        password={password}
        loading={loading}
        error={error}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={signIn}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#28271f]">
      <AdminSidebar
        section={section}
        open={mobileSidebar}
        pendingOrders={pendingOrders}
        onSelect={(next) => { setSection(next); setMobileSidebar(false); }}
        onClose={() => setMobileSidebar(false)}
        onSignOut={signOut}
      />

      <div className="min-h-screen lg:pl-[250px]">
        <AdminHeader section={section} onOpenSidebar={() => setMobileSidebar(true)} />

        <div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

          {section === "Overview" && (
            <OverviewSection
              products={products}
              orders={orders}
              promotions={promotions}
              loading={loading}
              onRefresh={loadAdminData}
              onNavigate={setSection}
              onAddProduct={() => { setSection("Products"); setStartNewProduct(true); }}
            />
          )}

          {section === "Products" && (
            <ProductsSection
              products={products}
              categories={categories}
              loading={loading}
              error={error}
              setProducts={setProducts}
              setError={setError}
              onRefresh={loadAdminData}
              startNew={startNewProduct}
              onStartNewHandled={handleStartNewHandled}
            />
          )}

          {section === "Categories" && (
            <CategoriesSection categories={categories} products={products} setCategories={setCategories} setError={setError} />
          )}

          {section === "Orders" && <OrdersSection orders={orders} setOrders={setOrders} setError={setError} />}

          {section === "Transactions" && (
            <TransactionsSection transactions={transactions} loading={loading} onRefresh={loadAdminData} />
          )}

          {section === "Promotions" && (
            <PromotionsSection promotions={promotions} setPromotions={setPromotions} setError={setError} onCreated={loadAdminData} />
          )}

          {section === "What's New" && <WhatsNewSection setError={setError} />}
        </div>
      </div>
    </main>
  );
}
