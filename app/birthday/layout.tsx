import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "🎂 Selamat Ulang Tahun Sayang! ❤️",
  description: "Kejutan spesial ulang tahun — dari hatiku untukmu, selamanya 💕",
};

export default function BirthdayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
