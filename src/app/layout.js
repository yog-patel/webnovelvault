import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Layout from '@/components/Layout'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Web Novel Vault - Read Novels Online',
  description: 'A platform for reading novels online for free',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/big_fav_icon.png" type="image/png" />
      </head>
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
