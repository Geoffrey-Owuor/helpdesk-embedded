import { ThemeProvider } from "next-themes";

interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  return (
    <ThemeProvider enableSystem defaultTheme="system" disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
};

export default Provider;
