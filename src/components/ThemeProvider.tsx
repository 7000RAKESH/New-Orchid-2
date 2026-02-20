'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeKey, applyTheme } from '@/lib/theme';

interface ThemeContextValue {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'lavender',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>('lavender');

  const setTheme = (t: ThemeKey) => {
    setThemeState(t);
    applyTheme(t);
    if (typeof window !== 'undefined') localStorage.setItem('ipqc-theme', t);
  };

  useEffect(() => {
    const saved = (localStorage.getItem('ipqc-theme') as ThemeKey) || 'lavender';
    setTheme(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
