import type { Metadata } from "next";
import { Storefront, type StorefrontPage } from "@/components/storefront";

export const metadata: Metadata = {
  title: "Our Product | Mood Food",
  description: "Explore Mood Food marinades, kebabs, curries and snacks.",
};

const page: StorefrontPage = "products";

export default function ProductsPage() {
  return <Storefront page={page} />;
}
