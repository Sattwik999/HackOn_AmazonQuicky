'use client'

import { useState, Suspense } from 'react'
import { Header } from '@/components/header'
import { HomeHero } from '@/components/home-hero'
import { ChatWidget } from '@/components/chat-widget'
import { ProductGrid } from '@/components/product-grid'

export default function Page() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Authentic Amazon "Back to top" functionality
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    // Amazon's classic light grey background for the whole page
    <div className="min-h-screen bg-[#EAEDED] flex flex-col font-amazon">
      
      <div className="relative overflow-hidden bg-[#05070d]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.16),transparent_36%),linear-gradient(135deg,#05070d_0%,#0c1220_52%,#04060b_100%)]" />

        {/* Header - Wrapped in Suspense because it uses useSearchParams */}
        <div className="relative z-20">
          <Suspense fallback={<div className="h-[100px] bg-[#05070d] w-full" />}>
            <Header onChatOpen={() => setIsChatOpen(true)} />
          </Suspense>
        </div>

        {/* Discovery hero */}
        <div className="relative z-10">
          <HomeHero onChatOpen={() => setIsChatOpen(true)} />
        </div>
      </div>

      {/* Main Content (ProductGrid now handles its own fetching, loading, and titles!) */}
      <main className="w-full flex-grow relative z-10 -mt-4 md:-mt-8">
        <Suspense fallback={<div className="flex justify-center py-20 text-[#0F1111]">Loading products...</div>}>
          <ProductGrid />
        </Suspense>
      </main>

      {/* Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* --- AUTHENTIC AMAZON FOOTER --- */}
      <footer className="w-full mt-auto">
        
        {/* Back to top button */}
        <button 
          onClick={scrollToTop}
          className="w-full bg-[#37475A] hover:bg-[#485769] text-white text-[13px] py-4 text-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#008296] focus:ring-inset"
        >
          Back to top
        </button>

        {/* Main Links Area */}
        <div className="bg-[#232F3E] py-10 px-4">
          <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
            <div>
              <h5 className="font-bold mb-3.5 text-[16px]">Get to Know Us</h5>
              <ul className="space-y-2.5 text-[14px] text-[#DDDDDD]">
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Press Releases</a></li>
                <li><a href="#" className="hover:underline">Amazon Science</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-3.5 text-[16px]">Connect with Us</h5>
              <ul className="space-y-2.5 text-[14px] text-[#DDDDDD]">
                <li><a href="#" className="hover:underline">Facebook</a></li>
                <li><a href="#" className="hover:underline">Twitter</a></li>
                <li><a href="#" className="hover:underline">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-3.5 text-[16px]">Make Money with Us</h5>
              <ul className="space-y-2.5 text-[14px] text-[#DDDDDD]">
                <li><a href="#" className="hover:underline">Sell on Amazon</a></li>
                <li><a href="#" className="hover:underline">Sell under Amazon Accelerator</a></li>
                <li><a href="#" className="hover:underline">Protect and Build Your Brand</a></li>
                <li><a href="#" className="hover:underline">Amazon Global Selling</a></li>
                <li><a href="#" className="hover:underline">Become an Affiliate</a></li>
                <li><a href="#" className="hover:underline">Fulfilment by Amazon</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-3.5 text-[16px]">Let Us Help You</h5>
              <ul className="space-y-2.5 text-[14px] text-[#DDDDDD]">
                <li><a href="#" className="hover:underline">COVID-19 and Amazon</a></li>
                <li><a href="#" className="hover:underline">Your Account</a></li>
                <li><a href="#" className="hover:underline">Returns Centre</a></li>
                <li><a href="#" className="hover:underline">100% Purchase Protection</a></li>
                <li><a href="#" className="hover:underline">Amazon App Download</a></li>
                <li><a href="#" className="hover:underline">Help</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Logo & Language/Country Divider */}
        <div className="bg-[#232F3E] border-t border-[#3A4553] py-8 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 mb-4">
             <span className="text-2xl font-bold tracking-tighter text-white leading-none">amazon</span>
             <span className="text-white text-sm mt-1">.in</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-[12px] text-[#DDDDDD] max-w-4xl text-center">
            <a href="#" className="hover:underline">Australia</a>
            <a href="#" className="hover:underline">Brazil</a>
            <a href="#" className="hover:underline">Canada</a>
            <a href="#" className="hover:underline">China</a>
            <a href="#" className="hover:underline">France</a>
            <a href="#" className="hover:underline">Germany</a>
            <a href="#" className="hover:underline">Italy</a>
            <a href="#" className="hover:underline">Japan</a>
            <a href="#" className="hover:underline">Mexico</a>
            <a href="#" className="hover:underline">Netherlands</a>
            <a href="#" className="hover:underline">Poland</a>
            <a href="#" className="hover:underline">Singapore</a>
            <a href="#" className="hover:underline">Spain</a>
            <a href="#" className="hover:underline">Turkey</a>
            <a href="#" className="hover:underline">United Arab Emirates</a>
            <a href="#" className="hover:underline">United Kingdom</a>
            <a href="#" className="hover:underline">United States</a>
          </div>
        </div>

        {/* Bottom Copyright Area */}
        <div className="bg-[#131A22] py-8 text-center flex flex-col items-center justify-center">
          <div className="flex gap-4 text-[#DDDDDD] text-[12px] mb-1.5 font-medium">
            <a href="#" className="hover:underline">Conditions of Use & Sale</a>
            <a href="#" className="hover:underline">Privacy Notice</a>
            <a href="#" className="hover:underline">Interest-Based Ads</a>
          </div>
          <p className="text-[#DDDDDD] text-[12px]">
            &copy; 1996-{new Date().getFullYear()}, Amazon.com, Inc. or its affiliates
          </p>
        </div>
        
      </footer>
    </div>
  )
}
