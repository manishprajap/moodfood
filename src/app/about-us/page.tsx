import type { Metadata } from "next";
import { Storefront, type StorefrontPage } from "@/components/storefront";

export const metadata: Metadata = {
  title: "About Us | Mood Food",
  description: "Learn about Mood Food and our approach to making dinner easy.",
};

const page: StorefrontPage = "about";

export default function AboutUsPage() {
  return <Storefront page={page} />;
}
