import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIKAWAL",
  description:
    "Workflow koreksi internal, snapshot, history versi, dan audit trail.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
