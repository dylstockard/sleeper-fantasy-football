import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sleeper Fantasy Football Dashboard",
  description: "Live dashboard, standings, and matchups for Sleeper Fantasy Football leagues.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-teal-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
