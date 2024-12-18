"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthService } from "@/lib/services/auth";
import dynamic from "next/dynamic";

// Dynamically import components that use localStorage
const MainContent = dynamic(() => import("@/components/MainContent"), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthService();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.push("/auth/login");
    }
  }, [mounted, router, isAuthenticated]);

  if (!mounted) {
    return null; // Return null during SSR
  }

  return <MainContent />;
}
