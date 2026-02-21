import { Toaster } from "@/components/ui/sonner"
import "./globals.css"  // ← Add this import!

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">  {/* ← Add these classes */}
        <main>{children}</main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}