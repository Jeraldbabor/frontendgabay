import type { Metadata } from "next";
import { AuthProvider } from "@/features/auth/hooks/auth-provider";
import { ToastProvider } from "@/shared/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GABAY AI — Your teaching companion",
    template: "%s · GABAY AI",
  },
  description:
    "Plan. Teach. Assess. Analyze. Improve. A thoughtful teaching companion for Philippine educators.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
