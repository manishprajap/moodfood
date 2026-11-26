import type { Metadata } from "next";
import { Storefront, type StorefrontPage } from "@/components/storefront";

export const metadata: Metadata = {
  title: "Cuisines | Mood Food",
  description: "Explore Andhra, Lucknowi and Mughlai flavours at Mood Food.",
};

const page: StorefrontPage = "cuisines";

export default function CuisinesPage() {
  return <Storefront page={page} />;
}
