"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    const updateDevExtremeTheme = (theme: string) => {
      const linkId = 'devextreme-theme-link';
      let link = document.getElementById(linkId) as HTMLLinkElement;

      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      link.href = theme === 'dark'
        ? 'https://cdn3.devexpress.com/jslib/23.2.4/css/dx.fluent.saas.dark.css'
        : 'https://cdn3.devexpress.com/jslib/23.2.4/css/dx.fluent.saas.light.css';
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          updateDevExtremeTheme(theme);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    // İlk yükleme için tema güncelleme
    const initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    updateDevExtremeTheme(initialTheme);

    return () => observer.disconnect();
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}