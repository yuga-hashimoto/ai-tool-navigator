import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { CompareProvider } from "@/context/CompareContext";
import { Footer } from "@/components/Footer";
import { CompareBar } from "@/components/CompareBar";
import NewsletterPopup from "@/components/NewsletterPopup";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { Navigation } from "@/components/Navigation";
import StickyNotificationBar from "@/components/StickyNotificationBar";
import BackToTop from "@/components/BackToTop";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tool-navigator.vercel.app'),
  title: "AI Tool Navigator | Best AI Tools Comparison",
  description: "Compare the best AI tools for writing, coding, image generation, and more. Find the perfect AI solution for your workflow.",
  openGraph: {
    type: 'website',
    siteName: 'AI Tool Navigator',
    title: "AI Tool Navigator | Best AI Tools Comparison",
    description: "Compare the best AI tools for writing, coding, image generation, and more. Find the perfect AI solution for your workflow.",
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI Tool Navigator | Best AI Tools Comparison",
    description: "Compare the best AI tools for writing, coding, image generation, and more. Find the perfect AI solution for your workflow.",
  },
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CompareProvider>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-727KCHJ884"} />
            <div className="sticky top-0 z-50 flex flex-col">
              <StickyNotificationBar />
              <Navigation className="relative" />
            </div>
            {children}
            <Footer />
            <CompareBar />
            <NewsletterPopup />
            <ExitIntentPopup />
            <BackToTop />
            </CompareProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
