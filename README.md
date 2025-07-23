# Launch Week AI

Turn your AI documentation into a comprehensive launch strategy with our AI-powered playbook generator.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Stripe account (for payments)
- OpenAI API key (for AI generation)

### Installation

1. Clone the repository:
```bash
git clone git@github.com:Bobers/LaunchWeekAI.git
cd LaunchWeekAI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your `.env.local` file:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_PRICE_ID=price_YOUR_PRICE_ID_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# AI API Configuration
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE

# App Configuration
NEXT_PUBLIC_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Testing Stripe Webhooks Locally

1. Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

4. Create a test price in Stripe Dashboard or via CLI:
```bash
stripe prices create \
  --currency=usd \
  --unit-amount=4900 \
  --product-data[name]="Launch Week Playbook"
```

## 🏗️ Architecture

- **Frontend:** Next.js 15 with TypeScript and TailwindCSS
- **Backend:** Next.js API Routes
- **Payments:** Stripe Checkout
- **AI:** OpenAI GPT-4
- **Security:** DOMPurify for XSS protection
- **Deployment:** Optimized for Vercel

## 📁 Project Structure

```
app/
├── src/
│   └── app/
│       ├── page.tsx              # Landing page with markdown input
│       ├── playbook/
│       │   └── [id]/
│       │       └── page.tsx      # Playbook display page
│       └── api/
│           ├── checkout/
│           │   └── route.ts      # Stripe checkout session
│           └── webhook/
│               └── route.ts      # Stripe webhook & AI generation
├── public/                       # Static assets
├── .env.local.example           # Environment template
└── package.json                 # Dependencies
```

## 🔒 Security

- **XSS Protection:** All markdown content is sanitized with DOMPurify before rendering
- **Input Validation:** 50,000 character limit on markdown input
- **Payment Security:** All payment processing handled by Stripe
- **No Data Storage:** No persistent storage of user data

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Import project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. Set up production webhook:
   - Get your webhook endpoint: `https://your-domain.vercel.app/api/webhook`
   - Add webhook in Stripe Dashboard
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel

## 📝 License

MIT

## 🤝 Contributing

This is an MVP project focused on validating the business model. Please focus contributions on bug fixes and security improvements rather than new features.

## 📧 Support

For issues or questions, please contact: support@launchweek.ai