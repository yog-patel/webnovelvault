import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Layout from '@/components/Layout'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Web Novel Vault - Read Novels Online',
  description: 'Read free web novels online with Web Novel Vault. Thousands of stories in fantasy, romance, action, and more. No ads. No paywalls.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Layout>
            {children}
          </Layout>
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
