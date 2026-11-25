import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mood Food — Quick food for easy life",
  description:
    "Small-batch marinades, kebabs and curries for the moments you want really good food, without all the prep.",
  applicationName: "Mood Food",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Mood Food — Quick food for easy life",
    description: "Marinades, kebabs and curries, made for your kind of mood.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
