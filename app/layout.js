import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SubjectProvider } from "@/lib/SubjectContext";
import AppShell from "@/components/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Orios Class",
    template: "%s — Orios Class",
  },
  description:
    "Your smart class companion. Access notes, track assignments, check schedules, and stay updated.",
  icons: {
    icon: "/orio-square.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SubjectProvider>
            <AppShell>{children}</AppShell>
          </SubjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
