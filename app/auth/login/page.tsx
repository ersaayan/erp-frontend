"use client";

import React, { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

// SVG'leri dinamik olarak import ediyoruz
const LogoDark = dynamic(
  () =>
    import("@/public/logo-dark.svg").then((mod) => {
      const Component = (props: React.SVGProps<SVGSVGElement>) => (
        <mod.default {...props} />
      );
      Component.displayName = "LogoDark";
      return Component;
    }),
  { ssr: false }
);

const LogoLight = dynamic(
  () =>
    import("@/public/logo-light.svg").then((mod) => {
      const Component = (props: React.SVGProps<SVGSVGElement>) => (
        <mod.default {...props} />
      );
      Component.displayName = "LogoLight";
      return Component;
    }),
  { ssr: false }
);

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const Logo =
    theme === "dark" || resolvedTheme === "dark" ? LogoLight : LogoDark;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-[240px] h-[40px]">
              <Logo className="w-full h-full" />
            </div>
            <h2 className="text-2xl font-bold text-center text-foreground">
              Hoş Geldiniz
            </h2>
          </div>
          <LoginForm />
        </div>
      </div>
    </ThemeProvider>
  );
}
