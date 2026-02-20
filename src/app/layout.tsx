import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IPQC — In-Process Quality Control | Lab Iconics",
  description: "Enterprise-grade Pharmaceutical IPQC management platform by Lab Iconics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body className={`${inter.variable} antialiased`}>
          {/* Suppress the harmless ResizeObserver loop warning from WebGL/framer-motion */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var e=window.onerror;window.onerror=function(msg,src,l,c,err){if(typeof msg==='string'&&msg.indexOf('ResizeObserver loop')!==-1)return true;return e?e(msg,src,l,c,err):false};})();`,
            }}
          />
          {children}
          <VisualEditsMessenger />
        </body>
      </html>
  );
}
