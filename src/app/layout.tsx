import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "NextPick – Sports Prediction App",
  description: "Predict sports outcomes and compete on the leaderboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-white flex flex-col font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
