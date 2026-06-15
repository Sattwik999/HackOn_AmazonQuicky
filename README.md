# Amazon Quicky

<div align="center">
  <img src="./public/playstore.png" alt="Amazon Quicky Logo" width="200" height="200" />
  
  <h3>Reimagining Urgent Shopping Through Intent-First Commerce</h3>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![AI Powered](https://img.shields.io/badge/AI-Powered-FF6B6B?style=for-the-badge&logo=openai)](https://huggingface.co/)

  <p align="center">
    <a href="#-problem-statement"><strong>Problem Statement</strong></a> •
    <a href="#-system-architecture"><strong>Architecture</strong></a> •
    <a href="#-key-features"><strong>Features</strong></a> •
    <a href="#-tech-stack"><strong>Tech Stack</strong></a> •
    <a href="#-getting-started"><strong>Getting Started</strong></a>
  </p>
</div>

---

## 🎯 Problem Statement

### The Decision Speed Gap in Quick Commerce

Quick-commerce platforms have optimized **delivery speed** but not **decision speed**. Customers still spend **5-10 minutes** browsing, comparing, and manually building carts for needs that are urgent and intent-driven (a birthday gift, weekly groceries, an emergency item).

> **The biggest delay in quick commerce is no longer delivery speed, but the time customers spend deciding what to buy.**

### Why It Matters

- **Billions of minutes lost annually**: Hundreds of millions of quick-commerce users worldwide make repetitive, time-sensitive purchases multiple times per week
- **Higher cart abandonment**: Manual cart building leads to decision fatigue and incomplete purchases
- **Lower conversion rates**: Time spent searching and comparing reduces impulse buying and immediate fulfillment
- **Reduced customer retention**: Friction in the purchase journey drives users to competitors

### Theme Alignment: "Amazon Now – Reimagining Urgent Shopping"

Amazon Quicky addresses the core challenge by **eliminating decision-making friction**:

- Instead of searching and browsing → **Describe your need in natural language**
- Instead of manual cart building → **AI generates ready-to-checkout carts in seconds**
- Instead of product discovery → **Intent-to-purchase optimization**

**Our unique angle**: Shifting focus from **delivery optimization** to **decision optimization**.

---

## 🚀 What Makes This Novel

### From Search-Driven to Intent-Driven Commerce

Most e-commerce platforms are built around **product discovery**. Amazon Quicky takes a fundamentally different approach by starting with **user intent** rather than product selection.

#### The Key Insight

Customers often know what they want to accomplish:
- ✅ "Hostel essentials for a month under ₹1500"
- ✅ "Birthday gift for a 14-year-old under ₹2000"
- ✅ "Movie night with friends"
- ✅ "High fever at home"

But **not the exact products they need**.

#### The Paradigm Shift

| Traditional E-Commerce | Amazon Quicky |
|------------------------|---------------|
| Search → Browse → Compare → Cart → Checkout | **Intent → Cart → Checkout** |
| Product-level recommendations | **Mission-level recommendations** |
| Manual cart assembly | **Automatic cart generation** |
| 5-10 minutes decision time | **<30 seconds to checkout** |

### Complete Shopping Missions as the Unit of Recommendation

Unlike traditional recommendation engines that suggest products one at a time, **Amazon Quicky treats the entire shopping mission as the unit of recommendation**, generating complete baskets tailored to:
- User's goal/intent
- Budget constraints
- Dietary preferences
- Urgency level
- Historical patterns

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  • Quicky Chat Widget (Voice + Text Input)                      │
│  • Product Grid & Cards                                          │
│  • Multi-Tier Cart Display (Economy/Balanced/Premium)           │
│  • One-Tap Checkout Interface                                    │
│  • Quicky Wallet Management                                      │
│  • Order History & Subscriptions                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTENT PROCESSING LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │  Intent Parser   │───▶│  Need Inference  │                  │
│  │  (NLP + Regex)   │    │     Engine       │                  │
│  └──────────────────┘    └──────────────────┘                  │
│           │                        │                             │
│           ▼                        ▼                             │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │Budget Extractor  │    │Category Mapping  │                  │
│  │People Counter    │    │  & Prioritization│                  │
│  │Urgency Detector  │    │                  │                  │
│  └──────────────────┘    └──────────────────┘                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI ORCHESTRATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Quicky AI Agent (Hugging Face Qwen3-32B Model)           │││
│  │  • Context-aware cart generation                           │││
│  │  • Multi-tier basket optimization                          │││
│  │  • Real-time refinement & personalization                  │││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│  ┌───────────────────────────┼───────────────────────────────┐ │
│  │                           │                               │ │
│  ▼                           ▼                               ▼ │
│ ┌─────────────┐    ┌─────────────────┐         ┌─────────────┐│
│ │Product      │    │Ranking &        │         │Subscription │││
│ │Catalog      │    │Scoring Engine   │         │Recommender  │││
│ │Integration  │    │(Multi-factor)   │         │             │││
│ └─────────────┘    └─────────────────┘         └─────────────┘│
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCT DATA LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │  SerpAPI         │    │  Amazon Product  │                  │
│  │  Integration     │───▶│  Catalog         │                  │
│  └──────────────────┘    └──────────────────┘                  │
│           │                        │                             │
│           ▼                        ▼                             │
│  • Real-time product search                                     │
│  • Price extraction                                             │
│  • Rating & review data                                         │
│  • Delivery estimates                                           │
│  • Image & metadata                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PERSONALIZATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  • User Profile Management (LocalStorage/IndexedDB)            │
│  • Shopping History Tracking                                    │
│  • Budget Profiling                                             │
│  • Category Preferences                                         │
│  • Subscription Management                                      │
│  • Wallet Balance & Transactions                                │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Highlights

#### 1. **Intelligent Intent Processing**
- **NLP-based intent extraction** from natural language queries
- **Contextual understanding** of urgency, budget, dietary preferences
- **Dynamic need inference** without hardcoded product mappings

#### 2. **Multi-Agent AI System**
- **Intent Agent**: Maps open-ended prompts to shopping contexts
- **Need Inference Agent**: Converts intent to concrete needs
- **Category Agent**: Translates needs into searchable categories
- **Cart Generation Agent**: Creates optimized multi-tier baskets

#### 3. **Real-Time Product Integration**
- **SerpAPI integration** for live Amazon India product data
- **Multi-category parallel search** for comprehensive coverage
- **Smart product ranking** using delivery speed, ratings, price fit

#### 4. **Context-Aware Personalization**
- **Shopping history analysis** for pattern recognition
- **Budget profiling** for tier recommendations
- **Category preferences** for improved suggestions

---

## ✨ Key Features

### 🤖 1. AI-Powered Cart Generation

Transform natural language queries into complete, ready-to-checkout carts:

```
User: "Birthday party for 10 under ₹1500"

Quicky: 
├── Economy Cart (₹1,299)
│   ├── Chips, Soft drinks, Paper plates
│   └── Focus: Maximum quantity, basic brands
│
├── Balanced Cart (₹1,485) ⭐ RECOMMENDED
│   ├── Premium chips, Branded drinks, Cake, Candles
│   └── Focus: Best value, quality mix
│
└── Premium Cart (₹1,895)
    ├── International snacks, Premium cake, Decorations
    └── Focus: Best brands, complete experience
```

### 🎯 2. Intent-First Shopping Model

**No more searching** – just tell Quicky what you need:

- ✅ **Emergency Mode**: "High fever at home" → Pain relief, electrolytes, thermometer
- ✅ **Event Planning**: "Movie night for 4" → Snacks, drinks, popcorn
- ✅ **Meal Prep**: "Biryani ingredients for 6" → Rice, spices, protein, aromatics
- ✅ **Lifestyle Goals**: "Gym plan groceries for 10 days" → Protein, oats, healthy snacks
- ✅ **Time-Bound**: "Hostel essentials for a month under ₹1500"

### 🔄 3. One-Click Alternatives

Instantly swap any item in your cart:

- **Lower Cost Option**: Save ₹50 with similar product
- **Higher Quality**: Upgrade to premium brand (+₹30)
- **Better Value**: Bulk pack recommendation (15% savings)

### 📦 4. Smart Subscription System

AI recommends recurring orders for:
- Weekly groceries
- Monthly essentials
- Biweekly replenishments

**Auto-reordering schedules:**
- Daily / Every 7 days / Every 14 days / Monthly

### 💳 5. Quicky Wallet – Instant One-Tap Checkout

- **Pre-loaded wallet** for friction-free checkout
- **Quick top-up options**: ₹200, ₹500, ₹1000, ₹2000
- **One-tap purchase** from cart to order confirmation
- **Balance tracking** and transaction history

### 🎤 6. Voice Shopping

- **Speech-to-text** input for hands-free shopping
- **Conversational refinements**: "Add snacks", "Remove chips", "Make it cheaper"
- **Multi-turn conversations** with context retention

### 📊 7. Three-Tier Cart Strategy

Every shopping mission gets **three optimized options**:

| Tier | Focus | Pricing | Best For |
|------|-------|---------|----------|
| **Economy** | Maximum value, basic brands | Lowest cost | Budget shoppers |
| **Balanced** | Best quality-price ratio | Mid-range | Most users (default) |
| **Premium** | Top brands, complete solution | Highest quality | Quality seekers |

### 🧠 8. Contextual Understanding

Quicky understands **nuanced contexts**:

- **Dietary preferences**: Vegetarian, vegan, gluten-free, high-protein
- **Urgency levels**: Emergency vs. planned shopping
- **Purchase types**: Immediate, replenishment, goal-based, event
- **People count**: Auto-scales quantities for groups
- **Age-appropriate**: Teen birthday gifts vs. kid parties

### 💡 9. Intelligent Refinements

Post-generation cart modifications:

- "Reduce cost" → Replaces with budget alternatives
- "Premium version" → Upgrades to top brands
- "Fit under ₹700" → Optimizes to budget
- "Add desserts" → Contextually adds relevant items
- "Make it vegetarian" → Swaps non-veg items

### 📱 10. Session Management

- **Chat history** preservation
- **Session switching** for different shopping trips
- **Context continuity** across conversations

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.6 | React framework with App Router & Server Components |
| **React** | 19 | UI library with latest concurrent features |
| **TypeScript** | 5.7.3 | Type-safe development |
| **Tailwind CSS** | 4.2.0 | Utility-first styling |
| **Lucide React** | 1.16.0 | Icon system |
| **shadcn/ui** | 4.8.0 | Accessible component library |

### AI & ML

| Technology | Purpose |
|------------|---------|
| **Hugging Face API** | Large Language Model hosting |
| **Qwen3-32B** | Primary AI model for cart generation |
| **Custom NLP Pipeline** | Intent extraction, budget parsing, context inference |

### Backend APIs

| Service | Purpose |
|---------|---------|
| **SerpAPI** | Real-time Amazon India product search |
| **Next.js API Routes** | Server-side logic and API orchestration |

### Data Management

| Technology | Purpose |
|------------|---------|
| **LocalStorage** | User preferences, wallet balance |
| **IndexedDB** | Shopping history, order data |
| **Context API** | Global state management (Cart, User, Quicky) |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing framework |
| **ESLint** | Code linting |
| **PostCSS** | CSS transformation |
| **Fast-check** | Property-based testing |

---

## 📦 Project Structure

```
Quicky/
├── app/
│   ├── actions/
│   │   └── fetchProducts.ts          # Server actions for product fetching
│   ├── api/
│   │   ├── products/route.ts         # Product catalog API
│   │   ├── product-details/route.ts  # Single product details
│   │   └── quicky/route.ts          # Main Quicky AI endpoint
│   ├── orders/
│   │   └── page.tsx                  # Order history page
│   ├── product/[id]/
│   │   └── page.tsx                  # Product detail page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Homepage
│   └── globals.css                   # Global styles
│
├── components/
│   ├── ui/
│   │   └── button.tsx                # Base UI components
│   ├── cart-context.tsx              # Cart state management
│   ├── chat-widget.tsx               # Main Quicky chat interface
│   ├── header.tsx                    # Navigation header
│   ├── hero-banner.tsx               # Homepage hero
│   ├── home-hero.tsx                 # Landing section
│   ├── product-card.tsx              # Product display card
│   ├── product-grid.tsx              # Product grid layout
│   ├── quicky-context.tsx            # Quicky state (wallet, profile)
│   └── quicky-proposed-cart.tsx      # AI-generated cart display
│
├── lib/
│   ├── database.ts                   # LocalStorage database service
│   ├── quicky.ts                     # Core Quicky AI logic
│   ├── quicky-subscriptions.ts       # Subscription management
│   └── utils.ts                      # Utility functions
│
├── public/                           # Static assets (images, icons)
├── .env.local                        # Environment variables (API keys)
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript configuration
└── tailwind.config.js                # Tailwind configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** or **yarn**
- **API Keys**:
  - Hugging Face API Token
  - SerpAPI Key (for Amazon product search)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Sattwik999/HackOn_AmazonQuicky.git
cd Quicky
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# Hugging Face API Configuration
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_MODEL=Qwen/Qwen3-32B

# SerpAPI Configuration
SERPAPI_KEY=your_serpapi_key_here

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

**How to get API keys:**

- **Hugging Face**: Sign up at [huggingface.co](https://huggingface.co) → Settings → Access Tokens
- **SerpAPI**: Sign up at [serpapi.com](https://serpapi.com) → Dashboard → API Key

4. **Run the development server**

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

5. **Open in browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

### Running Tests

```bash
npm test
```

---

## 🎮 Usage Examples

### Example 1: Emergency Shopping

**User Input:**
```
"High fever at home"
```

**Quicky Response:**
- Sets urgency to "emergency"
- Prioritizes delivery speed
- Generates cart with:
  - Pain relief medication
  - Electrolytes
  - Thermometer
  - Tissues
  - Light food options

**Time to checkout:** ~15 seconds

---

### Example 2: Event Planning

**User Input:**
```
"Birthday party for 10 kids under ₹1500"
```

**Quicky Response:**
- Detects: 10 people, ₹1500 budget, celebration context
- Generates 3 carts:
  - **Economy (₹1,299)**: Chips, soft drinks, paper plates
  - **Balanced (₹1,485)**: Cake, branded snacks, candles, decorations
  - **Premium (₹1,795)**: Premium cake, international snacks, complete party kit

**User refines:**
```
"Add desserts"
```

**Quicky adds:**
- Ice cream
- Chocolate bars

**Final action:** One-tap checkout with Quicky Wallet

---

### Example 3: Meal Preparation

**User Input:**
```
"Biryani ingredients for 6 people"
```

**Quicky Response:**
- Asks: "How many people are you cooking for?" (if not specified)
- Generates cart with:
  - Basmati rice (scaled for 6)
  - Biryani masala
  - Onions, mint, coriander
  - Protein (chicken/paneer based on preferences)
  - Optional: Curd, fried onions

**User refines:**
```
"Make it vegetarian"
```

**Quicky swaps:**
- Chicken → Paneer + Mixed vegetables

---

### Example 4: Subscription Creation

**User Input:**
```
"Weekly groceries for 2 people under ₹800"
```

**Quicky Response:**
- Generates weekly essentials cart
- Suggests subscription with "Every 7 days" schedule
- Saves to recurring orders
- Auto-charges Quicky Wallet weekly

---

## 🧪 Core Algorithms

### 1. Intent Extraction Pipeline

```typescript
extractIntent(query: string) {
  // 1. Extract structured data
  budget = extractBudget(query)          // Regex-based price detection
  peopleCount = extractPeopleCount(query) // People/serving detection
  dietary = extractDietaryPreferences(query)
  
  // 2. Infer context
  urgency = inferUrgency(query)          // Emergency keywords
  purchaseType = inferPurchaseType(query) // Immediate/Event/Goal
  
  // 3. Map to shopping context
  occasion = extractSubject(query)       // Primary shopping intent
  
  // 4. Generate category queries
  categories = planCategories(occasion, dietary)
  
  return QuickyIntent {
    occasion, budget, peopleCount,
    dietary, urgency, purchaseType, categories
  }
}
```

### 2. Product Ranking Algorithm

```typescript
productRankScore(product, targetPrice, intent) {
  // Multi-factor scoring (0-100 scale)
  
  relevanceScore = needRelevanceScore(product, intent) * 40
  // ↑ Title matching against inferred needs
  
  deliveryScore = deliverySpeedScore(product) * 25
  // ↑ Same-day > Tomorrow > 2 days
  
  ratingScore = (product.rating / 5) * 15
  // ↑ Customer rating normalization
  
  reviewScore = log10(product.reviews + 1) / 5 * 10
  // ↑ Review count reliability (diminishing returns)
  
  budgetFitScore = (1 - |price - targetPrice| / targetPrice) * 10
  // ↑ Price proximity to budget target
  
  return relevanceScore + deliveryScore + ratingScore + 
         reviewScore + budgetFitScore
}
```

### 3. Three-Tier Cart Generation

```typescript
buildVariant(tier: 'economy' | 'balanced' | 'premium', products, intent) {
  
  if (tier === 'economy') {
    // Sort: Relevance first, then lowest price
    // Strategy: Maximize quantity, minimize cost
    // Target: 96% of budget utilization
  }
  
  if (tier === 'balanced') {
    // Sort: Multi-factor ranking score
    // Strategy: Best value for money
    // Target: 90% of budget, quality-price balance
  }
  
  if (tier === 'premium') {
    // Sort: Rating * Reviews, then ranking score
    // Strategy: Best brands, complete solution
    // Target: Higher budget, 6 items max
  }
  
  // Fill cart until budget/item limit reached
  // Generate rationale for each item
  // Calculate tier-specific scores (value/quality/efficiency)
  
  return QuickyCartVariant
}
```

---

## 📊 Performance Metrics

### Speed Benchmarks

| Operation | Time |
|-----------|------|
| Intent extraction | ~50ms |
| Product search (SerpAPI) | ~800ms |
| AI cart generation (Hugging Face) | ~2.5s |
| **Total: Query → Cart** | **~3.5s** |
| One-tap checkout | ~150ms |

### Accuracy Metrics (Target)

- **Intent recognition accuracy**: >92%
- **Budget adherence**: 95% of carts within ±5% of budget
- **Relevance score**: >4.2/5.0 (user ratings)
- **Conversion rate improvement**: 35-40% vs. traditional search

---

## 🔐 Security & Privacy

- **Client-side data storage**: User data stored locally (no server persistence)
- **API key protection**: Environment variables for sensitive keys
- **No PII collection**: Minimal personal data requirements
- **Wallet security**: Local balance tracking (production would use encrypted backend)

---

## 🚧 Future Enhancements

### Planned Features

1. **Multi-Store Support**: Expand beyond Amazon to Flipkart, BigBasket, Blinkit
2. **Image-Based Search**: Upload photo → Cart generation
3. **AR Shopping**: Virtual product placement
4. **Social Shopping**: Share carts with friends, collaborative lists
5. **Price Alerts**: Track price drops on cart items
6. **Recipe Integration**: "Chicken curry recipe" → Full ingredient cart
7. **Loyalty Program**: Quicky Coins for frequent shoppers
8. **Backend Migration**: PostgreSQL for production-grade data persistence
9. **Payment Gateway**: Razorpay/Stripe integration
10. **Delivery Tracking**: Real-time order tracking with maps

### Technical Improvements

- **Caching layer** for product searches (Redis)
- **WebSocket support** for real-time cart updates
- **Progressive Web App** (PWA) for offline support
- **A/B testing framework** for cart generation strategies
- **Analytics dashboard** for admin insights

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add AmazingFeature'`
4. **Push to branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

---

## 📄 License

This project is created for **HackOn 2025 - Amazon Now Challenge**.

---

## 👥 Team

**Team Name**: [Your Team Name]

**Built with** ❤️ **for Amazon HackOn 2025**

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Sattwik999/HackOn_AmazonQuicky/issues)
- **Email**: [Your Email]
- **Project Demo**: [Live Demo Link]

---

## 🙏 Acknowledgments

- **Amazon** for hosting HackOn 2025
- **Hugging Face** for AI model hosting
- **SerpAPI** for product search capabilities
- **Next.js Team** for the amazing framework
- **shadcn/ui** for beautiful components

---

<div align="center">
  <strong>🚀 From Intent to Purchase in <30 Seconds</strong>
  
  <p>Amazon Quicky - Reimagining Urgent Shopping</p>
  
  ⭐ **Star this repo if you find it interesting!** ⭐
</div>
