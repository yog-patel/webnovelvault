import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Layout from '@/components/Layout'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Web Novel Vault - Read Novels Online',
  description: 'A platform for reading web novels and light novels online for free',
  icons: {
    icon: '/big_fav_icon_min.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/big_fav_icon_min.ico" type="image/ico" />
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
