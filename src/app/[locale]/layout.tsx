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
import ExitIntentWrapper from "@/components/ExitIntentWrapper";
import { SocialProof } from "@/components/SocialProof";
import { Navigation } from "@/components/Navigation";
import StickyNotificationBar from "@/components/StickyNotificationBar";
import BackToTop from "@/components/BackToTop";
import { ThemeProvider } from "@/components/ThemeProvider";
import { generateOrganizationSchema, generateSearchBoxSchema } from "@/lib/schema";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI Tool Navigator",
  },
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
  const organizationSchema = generateOrganizationSchema();
  const searchBoxSchema = generateSearchBoxSchema(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchBoxSchema) }}
        />
      </head>
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
            <StickyNotificationBar />
            <Navigation />
            {children}
            <Footer />
            <CompareBar />
            <NewsletterPopup />
            <ExitIntentWrapper />
            <SocialProof />
            <BackToTop />
            </CompareProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
