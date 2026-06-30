import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../css/globals.css";
import Alert from "@/components/Modules/Alert";
import Provider from "@/components/Themes/Provider";
import LoadingLine from "@/components/Modules/LoadingLine";
import {
  ConfirmationDialog,
  PromiseOverlay,
} from "@/components/Modules/Overlays";
import QueryProvider from "@/components/Navigation/QueryProvider";
import { DbRecoveryManager } from "@/components/Modules/DbStatus/DbRecoveryManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HelpDesk",
    template: `%s - HelpDesk`,
  },
  description:
    "A centralized internal issue tracking tool that enables teams to manage user-reported issues with clear ownership and status updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="apple-mobile-web-app-title" content="HelpDesk" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 antialiased dark:bg-neutral-950`}
      >
        <Provider>
          <DbRecoveryManager />
          <LoadingLine />
          <Alert />
          <PromiseOverlay />
          <ConfirmationDialog />

          <QueryProvider>{children}</QueryProvider>
        </Provider>
      </body>
    </html>
  );
}
