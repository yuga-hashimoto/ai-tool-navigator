import { getTranslations } from "next-intl/server";
import { SecurityDashboard } from "./SecurityDashboard";
import { redirect } from "next/navigation";
import { hasPermission, type Role } from "@/lib/security/access-control";
import { cookies } from "next/headers";

// User session fetch from cookies
async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("auth-session-token");

  if (!sessionToken) return null;

  // In a real app, verify token with DB/Auth provider
  // We use the ENCRYPTION_KEY as a basic check for the admin session token
  const adminSecret = process.env.ENCRYPTION_KEY || 'default-fallback-secret';

  if (sessionToken.value === adminSecret) {
    return {
      user: {
        id: "admin_1",
        role: "ADMIN" as Role,
      }
    };
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: "Security Intelligence Platform | Admin",
    description: "Advanced security monitoring, threat detection, and compliance",
  };
}

export default async function AdminSecurityPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // RBAC Check
  const session = await getSession();
  if (!session || !hasPermission(session.user.role, 'view:security-dashboard')) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/admin/security`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SecurityDashboard />
    </div>
  );
}
