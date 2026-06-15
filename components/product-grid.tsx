'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { X, Star, Loader2, AlertCircle, MapPin, ShieldCheck, Flame, Sparkles, BadgePercent, Clock, Headphones, Dumbbell, PackagePlus, Trophy, ArrowRight, Grid3X3 } from 'lucide-react'
import { ProductCard, SerpProduct } from './product-card'
import { useCart } from '@/components/cart-context'

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

interface CategoryCollectionsProps {
  products: SerpProduct[]
  searchQuery: string
  onProductOpen: (productId: string) => void
}

const getProductId = (product: SerpProduct, index: number) => {
  return product.asin || product.product_id || product.position?.toString() || `fallback-${index}`
}

const collectionSearches = {
  resume: 'home deals',
  recommended: 'recommended products',
  trending: 'trending products',
  topRated: 'top rated products',
  arrivals: 'new arrivals',
  electronics: 'electronics deals',
}

// function CollectionCard({
//   title,
//   subtitle,
//   products,
//   icon: Icon,
//   cta,
//   href,
//   onProductOpen,
// }: {
//   title: string
//   subtitle: string
//   products: SerpProduct[]
//   icon: typeof Sparkles
//   cta: string
//   href: string
//   onProductOpen: (productId: string) => void
// }) {
//   const previews = products.slice(0, 4)

//   return (
//     <article className="group flex min-h-[315px] flex-col rounded-[20px] border border-white/70 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.13)] dark:border-white/10 dark:bg-slate-900">
//       <div className="mb-4 flex items-start justify-between gap-3">
//         <div>
//           <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
//             <Icon size={13} />
//             Quicky picks
//           </div>
//           <h2 className="text-xl font-black leading-tight text-slate-950 dark:text-white">{title}</h2>
//           <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p>
//         </div>
//       </div>

//       <div className="grid flex-1 grid-cols-2 gap-3">
//         {previews.map((product, index) => {
//           const safeId = getProductId(product, index)

//           return (
//             <button
//               key={`${safeId}-${title}`}
//               type="button"
//               onClick={() => onProductOpen(safeId)}
//               className="group/item overflow-hidden rounded-2xl bg-slate-50 p-2 text-left ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-50 hover:ring-cyan-200 focus:outline-none focus:ring-2 focus:ring-[#008296] dark:bg-slate-800 dark:ring-white/10 dark:hover:bg-slate-700"
//               aria-label={`View ${product.title}`}
//             >
//               <div className="flex aspect-square items-center justify-center rounded-xl bg-white p-2 dark:bg-slate-950">
//                 <img
//                   src={product.thumbnail}
//                   alt={product.title}
//                   loading="lazy"
//                   decoding="async"
//                   className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover/item:scale-105 dark:mix-blend-normal"
//                 />
//               </div>
//               <p className="mt-2 line-clamp-2 text-xs font-semibold leading-4 text-slate-700 dark:text-slate-200">
//                 {product.title}
//               </p>
//             </button>
//           )
//         })}
//       </div>

//       <a
//         href={href}
//         className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#007185] transition-colors hover:text-[#c45500] hover:underline dark:text-cyan-300"
//       >
//         {cta}
//         <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
//       </a>
//     </article>
//   )
// }

function CollectionCard({
  title,
  subtitle,
  products: initialProducts,
  fetchQuery,
  icon: Icon,
  cta,
  href,
  onProductOpen,
}: {
  title: string
  subtitle: string
  products: SerpProduct[]
  fetchQuery?: string
  icon: typeof Sparkles // Adjust this type if you are importing Lucide icons differently
  cta: string
  href: string
  onProductOpen: (productId: string) => void
}) {
  // 1. Initialize with the passed-in products (acts as a fallback/skeleton)
  const [localProducts, setLocalProducts] = useState<SerpProduct[]>(initialProducts.slice(0, 4));

  // 2. Fetch specific category data if a fetchQuery is provided
  useEffect(() => {
    if (!fetchQuery) return;

    const fetchCategoryProducts = async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(fetchQuery)}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          // Filter out junk and keep only valid products
          const validProducts = data.filter((item: any) => item.asin || item.product_id);
          
          // Only update if we actually got results back
          if (validProducts.length > 0) {
            setLocalProducts(validProducts.slice(0, 4));
          }
        }
      } catch (error) {
        console.error(`Failed to fetch products for ${title}:`, error);
      }
    };

    fetchCategoryProducts();
  }, [fetchQuery, title]);

  return (
    <article className="group flex min-h-[315px] flex-col rounded-[20px] border border-white/70 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.13)] dark:border-white/10 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
            <Icon size={13} />
            Quicky picks
          </div>
          <h2 className="text-xl font-black leading-tight text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3">
        {/* 3. Map over localProducts instead of the static previews */}
        {localProducts.map((product, index) => {
          const safeId = getProductId(product, index);

          // Handle potential image fallback mapping
          const displayImage = product.thumbnail || product.image || 'https://via.placeholder.com/150';

          return (
            <button
              key={`${safeId}-${title}-${index}`}
              type="button"
              onClick={() => onProductOpen(safeId)}
              className="group/item overflow-hidden rounded-2xl bg-slate-50 p-2 text-left ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-50 hover:ring-cyan-200 focus:outline-none focus:ring-2 focus:ring-[#008296] dark:bg-slate-800 dark:ring-white/10 dark:hover:bg-slate-700"
              aria-label={`View ${product.title}`}
            >
              <div className="flex aspect-square items-center justify-center rounded-xl bg-white p-2 dark:bg-slate-950">
                <img
                  src={displayImage}
                  alt={product.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover/item:scale-105 dark:mix-blend-normal"
                />
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-semibold leading-4 text-slate-700 dark:text-slate-200">
                {product.title}
              </p>
            </button>
          )
        })}
      </div>

      <a
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#007185] transition-colors hover:text-[#c45500] hover:underline dark:text-cyan-300"
      >
        {cta}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </a>
    </article>
  )
}

// function CategoryCollections({ products, searchQuery, onProductOpen }: CategoryCollectionsProps) {
//   const collections = useMemo(() => {
//     const rotated = (start: number) => [...products.slice(start), ...products.slice(0, start)]

//     return [
//       {
//         title: `Keep shopping for ${searchQuery}`,
//         subtitle: 'Recent picks and fast-moving essentials from this search.',
//         icon: Clock,
//         cta: 'Continue browsing',
//         href: `/?q=${encodeURIComponent(searchQuery)}`,
//         products: rotated(0),
//       },
//       {
//         title: 'Pick up where you left off',
//         subtitle: 'A quick restart point for items you may want to compare.',
//         icon: PackagePlus,
//         cta: 'Resume shopping',
//         href: `/?q=${encodeURIComponent(collectionSearches.resume)}`,
//         products: rotated(4),
//       },
//       {
//         title: 'Trending now',
//         subtitle: 'Popular finds with strong signals and easy cart potential.',
//         icon: Flame,
//         cta: 'See trending',
//         href: `/?q=${encodeURIComponent(collectionSearches.trending)}`,
//         products: rotated(8),
//       },
//       {
//         title: 'Recommended for you',
//         subtitle: 'Balanced picks for value, ratings, and everyday usefulness.',
//         icon: Sparkles,
//         cta: 'Explore recommendations',
//         href: `/?q=${encodeURIComponent(collectionSearches.recommended)}`,
//         products: rotated(12),
//       },
//       {
//         title: 'Electronics deals',
//         subtitle: 'Smart upgrades, audio picks, and desk-friendly tech finds.',
//         icon: Headphones,
//         cta: 'Shop electronics',
//         href: `/?q=${encodeURIComponent(collectionSearches.electronics)}`,
//         products: rotated(2),
//       },
//       {
//         title: 'Fitness essentials',
//         subtitle: 'Gear and wellness picks for stronger daily routines.',
//         icon: Dumbbell,
//         cta: 'Shop fitness',
//         href: `/?q=${encodeURIComponent('fitness essentials')}`,
//         products: rotated(6),
//       },
//       {
//         title: 'New arrivals',
//         subtitle: 'Fresh product cards worth a closer look today.',
//         icon: PackagePlus,
//         cta: 'Browse new arrivals',
//         href: `/?q=${encodeURIComponent(collectionSearches.arrivals)}`,
//         products: rotated(10),
//       },
//       {
//         title: 'Top rated products',
//         subtitle: 'Highly rated options with trust and delivery signals.',
//         icon: Trophy,
//         cta: 'View top rated',
//         href: `/?q=${encodeURIComponent(collectionSearches.topRated)}`,
//         products: rotated(14),
//       },
//     ]
//   }, [products, searchQuery])

//   return (
//     <section className="mb-8">
//       <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
//         <div>
//           <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-[#c45500] shadow-sm dark:bg-slate-900 dark:text-[#febd69]">
//             <BadgePercent size={14} />
//             Discovery dashboard
//           </p>
//           <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
//             Shop smarter with curated collections
//           </h1>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
//         {collections.map((collection) => (
//           <CollectionCard
//             key={collection.title}
//             title={collection.title}
//             subtitle={collection.subtitle}
//             products={collection.products}
//             icon={collection.icon}
//             cta={collection.cta}
//             href={collection.href}
//             onProductOpen={onProductOpen}
//           />
//         ))}
//       </div>
//     </section>
//   )
// }
function CategoryCollections({ products, searchQuery, onProductOpen }: CategoryCollectionsProps) {
  const collections = useMemo(() => {
    // We keep 'rotated' to provide varied fallback images before the real category data finishes loading
    const rotated = (start: number) => [...products.slice(start), ...products.slice(0, start)]

    return [
      {
        title: `Keep shopping for ${searchQuery}`,
        subtitle: 'Recent picks and fast-moving essentials from this search.',
        icon: Clock,
        cta: 'Continue browsing',
        href: `/?q=${encodeURIComponent(searchQuery)}`,
        products: rotated(0),
        fetchQuery: searchQuery, // Fetches exact match for user's search
      },
      {
        title: 'Pick up where you left off',
        subtitle: 'A quick restart point for items you may want to compare.',
        icon: PackagePlus,
        cta: 'Resume shopping',
        href: `/?q=${encodeURIComponent(collectionSearches.resume)}`,
        products: rotated(4),
        fetchQuery: collectionSearches.resume, // Fetches resume items
      },
      {
        title: 'Trending now',
        subtitle: 'Popular finds with strong signals and easy cart potential.',
        icon: Flame,
        cta: 'See trending',
        href: `/?q=${encodeURIComponent(collectionSearches.trending)}`,
        products: rotated(8),
        fetchQuery: collectionSearches.trending, // Fetches trending items
      },
      {
        title: 'Recommended for you',
        subtitle: 'Balanced picks for value, ratings, and everyday usefulness.',
        icon: Sparkles,
        cta: 'Explore recommendations',
        href: `/?q=${encodeURIComponent(collectionSearches.recommended)}`,
        products: rotated(12),
        fetchQuery: collectionSearches.recommended, // Fetches recommended items
      },
      {
        title: 'Electronics deals',
        subtitle: 'Smart upgrades, audio picks, and desk-friendly tech finds.',
        icon: Headphones,
        cta: 'Shop electronics',
        href: `/?q=${encodeURIComponent(collectionSearches.electronics)}`,
        products: rotated(2),
        fetchQuery: collectionSearches.electronics, // Fix: Fetches actual electronics
      },
      {
        title: 'Fitness essentials',
        subtitle: 'Gear and wellness picks for stronger daily routines.',
        icon: Dumbbell,
        cta: 'Shop fitness',
        href: `/?q=${encodeURIComponent('fitness essentials')}`,
        products: rotated(6),
        fetchQuery: 'fitness essentials', // Fix: Fetches actual fitness gear
      },
      {
        title: 'New arrivals',
        subtitle: 'Fresh product cards worth a closer look today.',
        icon: PackagePlus,
        cta: 'Browse new arrivals',
        href: `/?q=${encodeURIComponent(collectionSearches.arrivals)}`,
        products: rotated(10),
        fetchQuery: collectionSearches.arrivals, // Fetches new arrivals
      },
      {
        title: 'Top rated products',
        subtitle: 'Highly rated options with trust and delivery signals.',
        icon: Trophy,
        cta: 'View top rated',
        href: `/?q=${encodeURIComponent(collectionSearches.topRated)}`,
        products: rotated(14),
        fetchQuery: collectionSearches.topRated, // Fetches top-rated items
      },
    ]
  }, [products, searchQuery])

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-[#c45500] shadow-sm dark:bg-slate-900 dark:text-[#febd69]">
            <BadgePercent size={14} />
            Discovery dashboard
          </p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Shop smarter with curated collections
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.title}
            title={collection.title}
            subtitle={collection.subtitle}
            products={collection.products}
            fetchQuery={collection.fetchQuery} /* <-- We pass the new prop down here */
            icon={collection.icon}
            cta={collection.cta}
            href={collection.href}
            onProductOpen={onProductOpen}
          />
        ))}
      </div>
    </section>
  )
}

function DiscoverySkeleton() {
  return (
    <div className="max-w-[1500px] mx-auto p-4 min-h-screen">
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-[315px] rounded-[20px] bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)] dark:bg-slate-900">
            <div className="mb-4 h-5 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="mb-4 h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="aspect-square animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-[500px] animate-pulse rounded-[20px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] dark:bg-slate-900">
            <div className="h-[300px] rounded-t-[20px] bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-3 p-4">
              <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProductGrid() {
  const [products, setProducts] = useState<SerpProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Modal State
  const [selectedProductAsin, setSelectedProductAsin] = useState<string | null>(null)
  const [detailedProduct, setDetailedProduct] = useState<any>(null)
  const [isModalLoading, setIsModalLoading] = useState(false)
  const [activeImage, setActiveImage] = useState<string>('')
  
  const { addToCart } = useCart()

  const searchParams = useSearchParams()
  const hasSearchQuery = searchParams.has('q')
  const searchQuery = searchParams.get('q') || 'deals'

  // 1. Fetch Grid Products dynamically based on the search query
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`, {
          cache: 'no-store' 
        })
        const data = await res.json()
        
        if (data?.error) {
          setErrorMessage(data.error)
          setProducts([]) 
          return
        }
        
        if (Array.isArray(data)) {
          // The Junk Filter: Keep only valid products
          const validProducts = data.filter((item: any) => item.asin || item.product_id)
          setProducts(validProducts)
        } else {
          setErrorMessage("Received unexpected data from the server.")
          setProducts([])
        }
      } catch (error) {
        setErrorMessage("Failed to connect to the server.")
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [searchQuery])

  // 2. Fetch Detailed Product Info for Modal
  useEffect(() => {
    if (!selectedProductAsin) {
      setDetailedProduct(null)
      return
    }

    const fetchDetails = async () => {
      setIsModalLoading(true)
      try {
        const res = await fetch(`/api/product-details?asin=${selectedProductAsin}`)
        
        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received HTML instead of JSON data.")
        }

        const data = await res.json()

        if (!res.ok || data.error || !data.title) {
          throw new Error(data.error || "Detailed information is not available for this specific item.")
        }

        setDetailedProduct(data)
        const firstImg = data.images?.[0]?.link || data.thumbnail || data.image || ''
        setActiveImage(firstImg)

      } catch (error: any) {
        console.warn("Modal Fetch Error:", error.message)
        // Instead of alert, show error in the modal
        setDetailedProduct({
          title: 'Product Unavailable',
          error: true,
          errorMessage: error.message || 'Unable to load product details'
        } as any)
        setActiveImage('')
      } finally {
        setIsModalLoading(false)
      }
    }

    fetchDetails()
  }, [selectedProductAsin])

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProductAsin(null)
    }
    
    if (selectedProductAsin) {
      window.addEventListener('keydown', handleKeyDown)
    }
    
    // Prevent background scrolling when modal is open
    document.body.style.overflow = selectedProductAsin ? 'hidden' : 'unset'
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedProductAsin])

  // Robust data extractors for the modal
  const getDisplayPrice = () => {
    if (!detailedProduct) return 0;
    return detailedProduct.buybox_winner?.price?.value 
        || detailedProduct.prices?.[0]?.value 
        || detailedProduct.price?.value 
        || 0;
  }

  // ==========================================
  // RENDER BLOCKS
  // ==========================================

  if (errorMessage) {
    return (
      <div className="max-w-[1500px] mx-auto p-8 min-h-[50vh] flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-[#CC0C39] mb-4" />
        <h2 className="text-xl font-bold text-slate-950 mb-2 dark:text-white">Oops! Something went wrong.</h2>
        <p className="text-slate-600 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">{errorMessage}</p>
      </div>
    )
  }

  if (isLoading) {
    return <DiscoverySkeleton />
  }

  return (
    <div className="max-w-[1500px] mx-auto p-4 min-h-screen">
      {!hasSearchQuery && (
        <CategoryCollections
          products={products}
          searchQuery={searchQuery}
          onProductOpen={setSelectedProductAsin}
        />
      )}

      <section className="rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-black uppercase tracking-wide text-white dark:bg-white dark:text-slate-950">
              <Grid3X3 size={14} />
              Product grid
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              Results for <span className="text-[#C45500] dark:text-[#febd69]">"{searchQuery}"</span>
            </h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
            Showing <span className="font-black text-slate-950 dark:text-white">1-{products.length}</span> matching products
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {products.map((product, index) => {
            const safeId = getProductId(product, index)
            const uniqueKey = `${safeId}-${index}` 
            
            return (
              <div
                key={uniqueKey}
                onClick={() => setSelectedProductAsin(safeId)}
                className="cursor-pointer animate-in fade-in slide-in-from-bottom-3 duration-500"
                style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
              >
                <ProductCard product={product} />
              </div>
            )
          })}
        </div>
      </section>

      {/* --- QUICK VIEW MODAL (AMAZON STYLE 3-COLUMN) --- */}
      {selectedProductAsin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xl transition-opacity" onClick={() => setSelectedProductAsin(null)} />
          
          <div className="relative flex max-h-[95vh] w-full max-w-[1240px] flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 dark:border-white/10 dark:bg-slate-950/95">
            <button
              onClick={() => setSelectedProductAsin(null)}
              aria-label="Close product details"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/85 p-2 text-slate-600 shadow-lg transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#008296] dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <X size={24} />
            </button>

            {isModalLoading || !detailedProduct ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
                <Loader2 className="animate-spin text-[#FFD814] mb-4" size={48} />
                <p className="text-gray-500 font-medium">Fetching product details from Amazon...</p>
              </div>
            ) : detailedProduct.error ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] p-8">
                <AlertCircle size={64} className="text-[#CC0C39] mb-4" />
                <h2 className="text-2xl font-bold text-slate-950 mb-2 dark:text-white">Product Details Unavailable</h2>
                <p className="text-slate-600 text-center max-w-md mb-6 dark:text-slate-300">
                  {detailedProduct.errorMessage || 'We were unable to load the detailed information for this product.'}
                </p>
                <button
                  onClick={() => setSelectedProductAsin(null)}
                  className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-black font-medium rounded-full transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                
                {/* 3-Column Layout */}
                <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
                  
                  {/* COLUMN 1: Image Gallery (Span 4) */}
                  <div className="flex flex-col gap-4 lg:col-span-4">
                    <div className="flex h-[340px] items-center justify-center rounded-[24px] border border-slate-200 bg-[radial-gradient(circle_at_50%_15%,rgba(14,165,233,0.12),transparent_32%),linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-inner sm:h-[430px] dark:border-white/10 dark:bg-[radial-gradient(circle_at_50%_15%,rgba(14,165,233,0.16),transparent_32%),linear-gradient(180deg,#1e293b,#0f172a)]">
                      <img 
                        src={activeImage || 'https://via.placeholder.com/400'} 
                        alt={detailedProduct.title} 
                        className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                    </div>
                    {/* Thumbnail Strip */}
                    {detailedProduct.images && detailedProduct.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {detailedProduct.images.map((img: any, idx: number) => (
                          <button 
                            key={idx}
                            onClick={() => setActiveImage(img.link)}
                            className={`h-16 w-16 shrink-0 rounded-2xl border-2 bg-white p-1 shadow-sm transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#008296] dark:bg-slate-900 ${activeImage === img.link ? 'border-[#007185] shadow-md' : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/25'}`}
                          >
                            <img src={img.link} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* COLUMN 2: Product Details (Span 5) */}
                  <div className="flex flex-col lg:col-span-5">
                    <h1 className="mb-2 text-2xl font-black leading-tight text-slate-950 dark:text-white">
                      {detailedProduct.title}
                    </h1>
                    
                    {detailedProduct.brand && (
                      <p className="mb-3 cursor-pointer text-sm font-semibold text-[#007185] hover:text-[#C45500] hover:underline dark:text-cyan-300">
                        Brand: {detailedProduct.brand}
                      </p>
                    )}

                    <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-4 dark:border-white/10">
                      <span className="text-[#FFA41C] flex items-center gap-1 text-sm font-medium">
                         {detailedProduct.rating || 'No'} <Star size={16} className={detailedProduct.rating ? "fill-current" : "fill-none"} />
                      </span>
                      <span className="cursor-pointer text-sm font-semibold text-[#007185] hover:underline dark:text-cyan-300">
                        {detailedProduct.reviews?.toLocaleString() || 0} ratings
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                          {getDisplayPrice() > 0 ? formatCurrency(getDisplayPrice()) : 'Price Unavailable'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Inclusive of all taxes</p>
                    </div>

                    {/* About This Item (Bullet Points) */}
                    {detailedProduct.about_item && detailedProduct.about_item.length > 0 && (
                      <div className="mt-4 mb-6">
                        <h3 className="mb-2 text-base font-black text-slate-950 dark:text-white">About this item</h3>
                        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {detailedProduct.about_item.map((bullet: string, idx: number) => (
                            <li key={idx} className="leading-snug">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* COLUMN 3: Buy Box (Span 3) */}
                  <div className="lg:col-span-3">
                    <div className="sticky top-0 flex flex-col rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
                      
                      <div className="mb-3 text-3xl font-black text-slate-950 dark:text-white">
                        {getDisplayPrice() > 0 ? formatCurrency(getDisplayPrice()) : ''}
                      </div>

                      <div className="mb-4 flex items-start gap-2 text-sm">
                        <span className="rounded-full bg-cyan-50 px-2 py-1 font-black italic text-[#00A8E1] dark:bg-cyan-400/10">prime</span>
                        <span className="text-slate-800 dark:text-slate-200">
                          {detailedProduct.buybox_winner?.delivery?.message || "FREE Delivery by Amazon"}
                        </span>
                      </div>

                      <div className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#007185] hover:text-[#C45500] hover:underline dark:text-cyan-300">
                        <MapPin size={16} /> Delivering to your location
                      </div>

                      <div className="mb-4 text-xl font-black text-[#007600] dark:text-emerald-300">
                        In Stock
                      </div>

                      <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                        <ShieldCheck size={16} /> Secure transaction
                      </div>

                      <button 
                        onClick={() => {
                          addToCart({
                            // FIX: Ensure ID strictly falls back to an empty string to satisfy TypeScript
                            id: detailedProduct.asin || selectedProductAsin || '',
                            name: detailedProduct.title,
                            price: getDisplayPrice(),
                            image: activeImage,
                            qty: 1
                          })
                          setSelectedProductAsin(null)
                        }}
                        disabled={getDisplayPrice() === 0}
                        className="mb-3 w-full rounded-full border border-[#FCD200]/70 bg-gradient-to-r from-[#FFD814] via-[#ffb84d] to-[#ff8a3d] py-3 font-black text-slate-950 shadow-[0_14px_35px_rgba(255,184,77,0.32)] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:border-gray-300 disabled:bg-gray-300 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-[#008296]"
                      >
                        Add to Cart
                      </button>

                      <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between"><span>Ships from</span> <span>Amazon</span></div>
                        <div className="flex justify-between"><span>Sold by</span> <span>{detailedProduct.buybox_winner?.fulfillment?.seller || "Amazon Seller"}</span></div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
