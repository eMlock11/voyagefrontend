import React, { createContext, useContext } from 'react';

export type Theme = 'dark';

interface ThemeContextType {
  theme: 'dark';
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
