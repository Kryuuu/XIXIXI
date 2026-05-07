import type { Metadata } from "next";
import "./globals.css";
import SharedLayout from "@/components/SharedLayout";

export const metadata: Metadata = {
  title: "Kimilatte ❤️ | Our Love Story",
  description: "A digital love letter — every moment with you is a favorite memory. Forever & Always. 💕",
  keywords: ["love", "couple", "romantic", "kimilatte", "memories"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <SharedLayout>
          {children}
        </SharedLayout>
      </body>
    </html>
  );
}
