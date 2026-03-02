"use client";
import { ReactNode } from "react";
import { LayoutProvider } from "./context/LayoutContext";
import { AppLayout } from "./components/AppLayout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutProvider>
      <AppLayout>{children}</AppLayout>
    </LayoutProvider>
  );
}
