import type { Metadata } from "next";
import { Storefront, type StorefrontPage } from "@/components/storefront";

export const metadata: Metadata = {
  title: "What's New | Mood Food",
  description: "See the latest updates and fresh batches from Mood Food.",
};

const page: StorefrontPage = "whatsNew";

export default function WhatsNewPage() {
  return <Storefront page={page} />;
}
