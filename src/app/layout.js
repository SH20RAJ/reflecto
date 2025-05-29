import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import { SWRProvider } from "@/lib/swr-config";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ensureDatabaseSchema from "@/lib/db-init";
import ClientPWAWrapper from "@/components/ClientPWAWrapper";

// Initialize database schema on app startup
// This is run server-side only
try {
  if (typeof window === 'undefined') {
    console.log('Initializing database schema...');
    ensureDatabaseSchema();
  }
} catch (error) {
  console.error('Error initializing database schema:', error);
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Reflecto | Simple reflections, deeper insights",
  description: "A minimal yet smart daily reflection app designed for busy students, creators, and professionals. Write your thoughts, get AI insights, and grow through reflection.",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  themeColor: "#7b1fa2",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Reflecto",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SWRProvider>
              {children}
            </SWRProvider>
          </AuthProvider>
          <Toaster />
          <ClientPWAWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
