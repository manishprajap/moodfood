import type { Metadata } from "next";
import { Storefront, type StorefrontPage } from "@/components/storefront";

export const metadata: Metadata = {
  title: "Why Mood Food | Mood Food",
  description: "See what makes Mood Food easy, reliable and full of flavour.",
};

const page: StorefrontPage = "whyUs";

export default function WhyUsPage() {
  return <Storefront page={page} />;
}
