'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { ChatWidget } from '@/components/chat-widget'
import { fetchProductDetails, ProductDetails } from '@/app/actions/fetchProducts'
import { useCart } from '@/components/cart-context'
import { MapPin, Star, ShieldCheck, RefreshCcw, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params) // unwrapping the params promise in Next.js 15+
  const { addToCart } = useCart()

  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string>('')
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchProductDetails(id)
        if (data) {
          setProduct(data)
          // Set active image with proper fallback
          const firstImage = data.images && data.images.length > 0 ? data.images[0] : null
          setActiveImage(firstImage || `https://placehold.co/600x600/e5e7eb/1f2937?text=${encodeURIComponent(data.name.substring(0, 20))}`)
        } else {
          setError('Product not found')
        }
      } catch (error) {
        console.error('Failed to load product details', error)
        setError(error instanceof Error ? error.message : 'Failed to load product details')
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header onChatOpen={() => setIsChatOpen(true)} />
        <div className="max-w-7xl mx-auto p-8 text-center mt-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 mx-auto rounded"></div>
            <div className="h-64 w-64 bg-gray-200 mx-auto rounded"></div>
            <div className="h-4 w-96 bg-gray-200 mx-auto rounded"></div>
          </div>
          <p className="mt-8 text-gray-500">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header onChatOpen={() => setIsChatOpen(true)} />
        <div className="max-w-7xl mx-auto p-8 text-center mt-20">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          {error && <p className="mt-4 text-red-600">{error}</p>}
          <p className="mt-2 text-gray-600">We couldn't find the product you're looking for.</p>
          <button 
            onClick={() => router.push('/')} 
            className="mt-6 px-6 py-2 bg-[#FFD814] hover:bg-[#F7CA00] text-black font-medium rounded-full transition-colors"
          >
            Return to Home
          </button>
        </div>
        <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      image: product.images[0],
      qty: 1
    })
  }

  return (
    <div className="min-h-screen bg-white text-black font-amazon">
      {/* Header */}
      <Header onChatOpen={() => setIsChatOpen(true)} />

      {/* Main Content */}
      <main className="max-w-[1500px] mx-auto p-4 md:p-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-6 flex gap-2">
           <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span> 
           <span>›</span> 
           <span className="hover:underline cursor-pointer">Products</span> 
           <span>›</span> 
           <span className="text-gray-900 truncate max-w-[200px] inline-block align-bottom">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Image Gallery (Span 5) */}
          <div className="md:col-span-5 flex gap-4">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col gap-2 w-16">
              {product.images.filter(img => img && img.trim() !== '').map((img, idx) => (
                <div 
                  key={idx} 
                  onMouseEnter={() => setActiveImage(img)}
                  className={`border-2 rounded-sm p-1 cursor-pointer w-12 h-12 flex items-center justify-center ${activeImage === img ? 'border-[#e77600] shadow-sm' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              ))}
            </div>
            {/* Active Image */}
            <div className="flex-1 border border-gray-200 rounded-sm p-4 flex items-center justify-center min-h-[400px]">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="w-full max-h-[500px] object-contain mix-blend-multiply" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-32 h-32 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Middle Column: Details (Span 4) */}
          <div className="md:col-span-4 flex flex-col">
            <h1 className="text-2xl font-medium leading-tight mb-2">
               {product.name}
            </h1>
            {product.brand && <div className="text-sm text-[#007185] hover:underline cursor-pointer mb-2">Brand: {product.brand}</div>}
            
            {/* Ratings */}
            <div className="flex items-center gap-4 mb-4 border-b border-gray-200 pb-4">
              <div className="flex items-center">
                <span className="text-sm mr-1">{product.rating.toFixed(1)}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(product.rating) ? 'fill-[#FFA41C] text-[#FFA41C]' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-[#007185] hover:underline cursor-pointer">{product.reviews.toLocaleString()} ratings</span>
            </div>

            {/* Price */}
            <div className="mb-4">
               {product.originalPrice && product.price && product.originalPrice > product.price && (
                  <div className="text-sm text-gray-500 mb-1">
                     M.R.P.: <span className="line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  </div>
               )}
               {product.price !== undefined && product.price !== null ? (
                 <div className="flex items-start text-[#B12704]">
                    <span className="text-sm mt-1">₹</span>
                    <span className="text-3xl font-medium">{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-sm mt-1">.00</span>
                 </div>
               ) : (
                 <div className="text-sm text-gray-500">Price not available</div>
               )}
               <p className="text-sm text-gray-900 mt-1">Inclusive of all taxes</p>
               {product.prime && (
                 <div className="mt-2 inline-block bg-[#00A8E1] text-white px-2 py-0.5 rounded-sm text-xs font-bold font-sans">
                    prime
                 </div>
               )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 border-y border-gray-200 py-4 mb-4">
              <div className="flex flex-col items-center text-center max-w-[80px]">
                <Truck size={28} strokeWidth={1} className="text-[#007185] mb-2" />
                <span className="text-xs text-[#007185]">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center max-w-[80px]">
                <RefreshCcw size={28} strokeWidth={1} className="text-[#007185] mb-2" />
                <span className="text-xs text-[#007185]">7 days Replacement</span>
              </div>
              <div className="flex flex-col items-center text-center max-w-[80px]">
                <ShieldCheck size={28} strokeWidth={1} className="text-[#007185] mb-2" />
                <span className="text-xs text-[#007185]">1 Year Warranty</span>
              </div>
            </div>

            {/* About */}
            <div className="mt-2">
               <h3 className="font-bold text-base mb-2">About this item</h3>
               <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                 {product.features && product.features.length > 0 ? (
                   product.features.map((feature, i) => (
                     <li key={i}>{feature}</li>
                   ))
                 ) : product.description && product.description !== 'No description available.' ? (
                   <li>{product.description}</li>
                 ) : (
                   <>
                     <li>Premium quality product from trusted brand</li>
                     <li>Designed for durability and long-lasting performance</li>
                     <li>Customer satisfaction guaranteed</li>
                     <li>Free delivery and easy returns available</li>
                   </>
                 )}
               </ul>
            </div>
          </div>

          {/* Right Column: Buy Box (Span 3) */}
          <div className="md:col-span-3">
            <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
               {product.price !== undefined && product.price !== null ? (
                 <div className="text-[#B12704] text-xl font-bold mb-4">
                   ₹{product.price.toLocaleString('en-IN')}.00
                 </div>
               ) : (
                 <div className="text-gray-500 text-sm mb-4">Price not available</div>
               )}

               <div className="mb-4 text-sm">
                 <span className="text-[#007185] font-medium hover:underline cursor-pointer">FREE delivery</span> 
                 <span className="font-bold"> {product.deliveryTime || 'Monday, typically in 2 days'}</span>. 
                 <div className="text-gray-500 mt-1">Order within 21 hrs 30 mins.</div>
               </div>

               <div className="flex items-center gap-2 mb-4">
                 <MapPin size={16} className="text-gray-600" />
                 <span className="text-sm text-[#007185] hover:underline cursor-pointer">Deliver to India</span>
               </div>

               <h4 className={`text-lg font-medium mb-4 ${product.stock === 'in-stock' ? 'text-[#007600]' : 'text-[#B12704]'}`}>
                  {product.stock === 'in-stock' ? 'In stock' : 'Only few left in stock'}
               </h4>

               <div className="space-y-3">
                 <Button 
                   onClick={handleAddToCart}
                   className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-black rounded-full font-medium shadow-sm h-9"
                 >
                   Add to Cart
                 </Button>
                 <Button 
                   className="w-full bg-[#FFA41C] hover:bg-[#FA8900] border border-[#FF8F00] text-black rounded-full font-medium shadow-sm h-9"
                 >
                   Buy Now
                 </Button>
               </div>

               <div className="mt-4 space-y-2 text-xs text-gray-500 flex flex-col">
                  <div className="flex justify-between">
                     <span>Ships from</span>
                     <span className="text-gray-900">Amazon Quicky</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Sold by</span>
                     <span className="text-[#007185] hover:underline cursor-pointer">Quicky Retail</span>
                  </div>
               </div>

            </div>
          </div>

        </div>
      </main>

      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}
