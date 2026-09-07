import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: {
    default: "FocusTrack — Personal Productivity Tracker",
    template: "%s | FocusTrack",
  },
  description:
    "Modern personal productivity and life management tracker. Organize your day, track habits, manage tasks, measure focus time, and understand your progress.",
  keywords: [
    "productivity",
    "task manager",
    "habit tracker",
    "pomodoro",
    "focus timer",
    "goals",
  ],
  authors: [{ name: "FocusTrack" }],
  creator: "FocusTrack",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "FocusTrack",
    title: "FocusTrack — Personal Productivity Tracker",
    description:
      "Organize your day, track habits, manage tasks, and boost your productivity.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
