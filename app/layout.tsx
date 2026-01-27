import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../css/globals.css";
import { AlertProvider } from "@/contexts/AlertContext";
import Alert from "@/components/Modules/Alert";
import Provider from "@/components/Themes/Provider";
import { LoadingLineProvider } from "@/contexts/LoadingLineContext";
import LoadingLine from "@/components/Modules/LoadingLine";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IssueDesk",
  description:
    "A centralized internal issue tracking tool that enables teams to manage user-reported issues with clear ownership and status updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="IssueDesk" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 antialiased dark:bg-neutral-950`}
      >
        <Provider>
          <LoadingLineProvider>
            <AlertProvider>
              <LoadingLine />
              <Alert />
              {children}
            </AlertProvider>
          </LoadingLineProvider>
        </Provider>
      </body>
    </html>
  );
}
