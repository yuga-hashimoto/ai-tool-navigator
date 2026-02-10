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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Tool Navigator | Best AI Tools Comparison",
  description: "Compare the best AI tools for writing, coding, image generation, and more. Find the perfect AI solution for your workflow.",
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
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
            <CompareProvider>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-727KCHJ884"} />
            <Navigation />
            {children}
            <Footer />
            <CompareBar />
            <NewsletterPopup />
            <ExitIntentPopup />
            </CompareProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
