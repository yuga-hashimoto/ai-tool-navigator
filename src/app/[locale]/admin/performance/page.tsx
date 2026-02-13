import { getTranslations } from "next-intl/server";
import { PerformanceDashboard } from "./PerformanceDashboard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: "Performance Dashboard | Admin",
    description: "Monitor Core Web Vitals and performance metrics",
  };
}

export default async function AdminPerformancePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="min-h-screen bg-gray-50">
      <PerformanceDashboard />
    </div>
  );
}
