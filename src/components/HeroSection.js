import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] py-12 overflow-hidden bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        {/* Hero content */}
        <div className="text-center max-w-4xl mx-auto mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 md:mb-6 [text-shadow:_0_4px_4px_rgb(0_0_0_/_50%)]">
            Web Novel Vault
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 md:mb-12">
            Read light novel, web novel, korean novel and chinese novel online for free. You can find hundreds of english translated light novel, web novel, korean novel and chinese novel which are daily updated!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/novels" className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-semibold">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              Popular Novels
            </Link>
            <Link href="/library" className="inline-flex items-center px-6 py-3 rounded-lg border border-purple-500 hover:bg-purple-500/10 transition text-white font-semibold">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
              </svg>
              My Library
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur border border-gray-700">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"/>
              </svg>
              <h3 className="text-xl font-semibold text-white">Global Access</h3>
            </div>
            <p className="text-gray-300">Read your favorite novels anytime, anywhere, with our easy-to-use platform.</p>
          </div>

          <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur border border-gray-700">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
              </svg>
              <h3 className="text-xl font-semibold text-white">Daily Updates</h3>
            </div>
            <p className="text-gray-300">Stay current with the latest chapters from your favorite series.</p>
          </div>

          <div className="p-6 rounded-xl bg-gray-800/50 backdrop-blur border border-gray-700">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
              </svg>
              <h3 className="text-xl font-semibold text-white">Track Progress</h3>
            </div>
            <p className="text-gray-300">Keep track of your reading history and bookmark your favorite novels.</p>
          </div>
        </div>
      </div>
    </section>
  )
} 