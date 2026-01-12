import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terrier Eats",
  description: "Track BU dining points, swipes, and budgets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}