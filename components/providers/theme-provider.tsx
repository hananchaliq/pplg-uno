"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
   children: React.ReactNode;
   attribute?: string;
   defaultTheme?: Theme;
   enableSystem?: boolean;
   disableTransitionOnChange?: boolean;
}

interface UseThemeProps {
   theme: Theme;
   setTheme: (theme: Theme) => void;
   resolvedTheme: "light" | "dark";
}

const ThemeContext = React.createContext<UseThemeProps>({
   theme: "light",
   setTheme: () => {},
   resolvedTheme: "light",
});

export function ThemeProvider({ children, defaultTheme = "light", enableSystem = true }: ThemeProviderProps) {
   const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
   const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

   const applyThemeToDOM = React.useCallback(
      (targetTheme: Theme) => {
         if (typeof window === "undefined") return;
         const root = window.document.documentElement;
         const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
         const isDark = targetTheme === "dark" || (targetTheme === "system" && enableSystem && systemDark);

         root.classList.toggle("dark", isDark);
         root.style.colorScheme = isDark ? "dark" : "light";
         setResolvedTheme(isDark ? "dark" : "light");
      },
      [enableSystem]
   );

   React.useEffect(() => {
      const saved = window.localStorage.getItem("pplg1-theme") as Theme | null;
      const initial = saved || defaultTheme;
      setThemeState(initial);
      applyThemeToDOM(initial);
   }, [defaultTheme, applyThemeToDOM]);

   const setTheme = React.useCallback(
      (nextTheme: Theme) => {
         setThemeState(nextTheme);
         if (typeof window !== "undefined") {
            window.localStorage.setItem("pplg1-theme", nextTheme);
         }
         applyThemeToDOM(nextTheme);
      },
      [applyThemeToDOM]
   );

   const value = React.useMemo(() => ({ theme, setTheme, resolvedTheme }), [theme, setTheme, resolvedTheme]);

   return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): UseThemeProps {
   return React.useContext(ThemeContext);
}
