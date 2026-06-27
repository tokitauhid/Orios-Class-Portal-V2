"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme as useNextTheme } from "next-themes";

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  
  const toggleTheme = () => {
    const current = theme === "system" ? systemTheme : theme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  return { theme, toggleTheme };
}

