import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* About Section */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Web Novel Vault</h3>
            <p className="text-sm leading-relaxed">
              Read light novels, web novels, Korean novels, and Chinese novels online for free. Discover hundreds of English-translated novels updated daily. Read novels online, free light novels, and more!
            </p>
          </div>

          {/* Links Section */}
          <div className="flex-1 md:text-right">
            <ul className="flex flex-wrap justify-center md:justify-end space-x-4 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-white transition-colors">
                  ToS
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-white transition-colors">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link href="/donate" className="hover:text-white transition-colors">
                  Donate
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-700 pt-4 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Web Novel Vault. All rights reserved.
          </p>
          <a
            href="#"
            className="text-purple-400 hover:text-white transition-colors"
            aria-label="Back to top"
          >
            <i className="fas fa-arrow-up text-lg"></i>
          </a>
        </div>
      </div>
    </footer>
  )
}