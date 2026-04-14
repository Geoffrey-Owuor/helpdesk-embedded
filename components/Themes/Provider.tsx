import { ThemeProvider } from "next-themes";

interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  return (
    <ThemeProvider
      enableSystem={true}
      defaultTheme="system"
      disableTransitionOnChange={true}
      attribute="data-theme"
    >
      {children}
    </ThemeProvider>
  );
};

export default Provider;
