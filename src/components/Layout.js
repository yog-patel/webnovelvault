'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaBook, FaTrophy, FaSearch, FaUser, FaBookmark, FaBars, FaTimes, FaHome } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import SearchDropdown from './SearchDropdown'
import Footer from './Footer'

export default function Layout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = [
    { name: 'Home', href: '/', icon: <FaHome /> },
    { name: 'Novels', href: '/novels', icon: <FaBook /> },
    { name: 'Rankings', href: '/rankings', icon: <FaTrophy /> },
  ]

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && !event.target.closest('.search-container')) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSearchOpen])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-purple-500">Web Novel Vault</span>
              </Link>
              <div className="hidden lg:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              {/* Search Container */}
              <div className="relative search-container mx-4 hidden lg:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search novels..."
                    className="bg-gray-700 text-white px-4 py-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Search novels"
                    onFocus={() => setIsSearchOpen(true)}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute right-3 top-3 text-gray-400" />
                </div>
                <SearchDropdown
                  key="search-dropdown"
                  isOpen={isSearchOpen}
                  onClose={() => setIsSearchOpen(false)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>

              {session ? (
                <div className="hidden lg:flex items-center space-x-4">
                  <Link
                    href="/library"
                    className="text-gray-300 hover:text-white transition-colors"
                    aria-label="My Library"
                  >
                    <FaBookmark className="text-xl" />
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-300 hover:text-white transition-colors"
                    aria-label="My Profile"
                  >
                    <FaUser className="text-xl" />
                  </Link>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              <button
                className="lg:hidden ml-4 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet menu */}
        <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Search Container */}
            <div className="px-3 py-2 search-container relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search novels..."
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Search novels"
                  onFocus={() => setIsSearchOpen(true)}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute right-3 top-3 text-gray-400" />
              </div>
              <SearchDropdown
                key="mobile-search-dropdown"
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>

            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.name}
              </Link>
            ))}

            {session ? (
              <>
                <Link
                  href="/library"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaBookmark className="mr-2" />
                  My Library
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUser className="mr-2" />
                  My Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium bg-purple-500 text-white hover:bg-purple-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}