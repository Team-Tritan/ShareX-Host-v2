import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import PlausibleProvider from "next-plausible";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tritan Uploader - Free ShareX Host",
  description: "A place to put screenshots, images, gifs, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <PlausibleProvider
      domain="tritan.gg"
      customDomain="https://files.tritan.gg"
      selfHosted={true}
      trackLocalhost={true}
      trackOutboundLinks={true}
      enabled={true}
    >
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#1b1b1b",
              color: "#fff",
            },
          }}
        />
        {children}
      </body>
    </html>
    </PlausibleProvider>
  );
}
