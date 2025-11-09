# 🧠 PONS — Personal Operating Neural System

Limitless AI OS for elite operators. An intelligent assistant built with Next.js, designed for high-performance entrepreneurs.

**Think: Apple × Iron Man × Notion**

## 🎨 Design Philosophy

### Color Palette
- **Shiftly Blue**: `#0ea5e9` - Primary brand color, accent, interactive elements
- **Charcoal**: `#1e293b` - Dark backgrounds, primary text (light mode)
- **Snow White**: `#f1f5f9` - Light backgrounds, primary text (dark mode)
- **Steel Grey**: `#94a3b8` - Muted text, borders, secondary elements

### Typography
- **Font**: Inter (primary), SF Pro Display (fallback)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Design Tokens
- **Card Radius**: `rounded-2xl` (1rem)
- **Glow Effect**: `shadow-glow` → `0 0 30px rgba(14,165,233,0.4)`
- **Spacing**: 4px/8px grid system

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete component specs.

### Visual Design Direction
- **Apple-level cleanliness**: White space, soft gradients, crisp text
- **Iron Man-style glow elements**: Subtle neon blues, pulsing UI indicators
- **Rounded cards** (2xl+), soft shadows, minimal borders
- **UI feels futuristic** but never chaotic
- **Think**: macOS Control Center + Jarvis HUD fusion

### Layout Structure
**Top Navbar:**
- Logo ("PONS")
- Clock / Date
- Profile picture with dropdown
- Voice input button (mic icon, floating or fixed right)

**Left Sidebar:**
- PONS logo / icon
- Navigation: Dashboard, Copilot, Projects, Tasks, CRM, Vault, Financials, Settings
- Active state: glowing icon with blue hover ring

**Main Content Area:**
- "Welcome back, [user]"
- KPIs or metrics (Sales today, Deals in pipeline, Open tasks)
- AI suggestions: "You should follow up with Ethan", "You missed your 4AM lift"
- Quick action cards: "Create Post", "Schedule Task", "Open Copilot"
- Copilot status card: "Standing by. Waiting for your command."

**Background:**
- Optional faint grid or circuit texture (low opacity)
- Soft blues, silvers, dark charcoals in dark mode

### UI Effects
- Hover glow on buttons
- Framer Motion page transitions (fade-in, slide-up, bounce on load)
- Gradient glow ring on profile picture or active tabs
- Animated pulse on notifications or AI status

### Mobile Breakpoints
- Collapse sidebar into hamburger menu
- Sticky navbar on top
- Tap-to-open command center cards

## ✨ Features

- **🤖 AI Copilot** - Chat interface with memory and context awareness powered by GPT-4
- **🎤 Voice Commands** - Hands-free operation with voice input and output (perfect for mobile & AR glasses)
- **🌐 Personal Integrations** - Connect social media, bank accounts, and productivity tools for deep personalization
- **🔗 CRM Integration** - Connect to HubSpot, Salesforce, or any CRM platform
- **🤖 AI Copilot** - Chat interface with memory and context awareness powered by GPT-4
- **🎤 Voice Commands** - Hands-free operation with voice input and output (perfect for mobile & AR glasses)
- **🧠 RAG System** - Upload documents for AI-powered search and question answering
- **🌐 Personal Integrations** - Connect social media, bank accounts, and productivity tools for deep personalization
- **🔗 CRM Integration** - Connect to HubSpot, Salesforce, or any CRM platform
- **📊 Dashboard** - Central command center with tasks, metrics, and AI status
- **👥 CRM** - Manage contacts, leads, and relationships from any connected CRM
- **📝 Projects** - Track ongoing initiatives with progress monitoring
- **✅ Tasks** - Daily task management and priorities
- **📄 Content** - AI-powered content creation and management
- **🔒 Vault** - Document upload, vector search, and AI Q&A
- **💰 Financials** - Revenue, expenses, and financial metrics
- **🧠 AI Insights** - Personal analytics and recommendations based on your connected data
- **⚙️ Settings** - Configure your PONS experience and integrations
- **📱 Mobile Responsive** - Works seamlessly on all devices
- **👥 CRM** - Manage contacts, leads, and relationships from any connected CRM
- **📝 Projects** - Track ongoing initiatives with progress monitoring
- **✅ Tasks** - Daily task management and priorities
- **📄 Content** - AI-powered content creation and management
- **🔒 Vault** - Secure storage for documents and data
- **💰 Financials** - Revenue, expenses, and financial metrics
- **🧠 AI Insights** - Personal analytics and recommendations based on your connected data
- **⚙️ Settings** - Configure your PONS experience and integrations
- **📱 Mobile Responsive** - Works seamlessly on all devices

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS
- **AI**: OpenAI GPT-4
- **Database**: Supabase
- **Icons**: Heroicons, Tabler Icons, Lucide
- **Animations**: Framer Motion (planned)

## 📦 Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create `.env.local` and add your OpenAI API key:
   ```bash
   NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## 🎯 Status

**Phase 1 Complete:**
- ✅ Elite dashboard with metrics and AI status
- ✅ Sidebar navigation
- ✅ AI Copilot chat with memory
- ✅ All module pages (CRM, Tasks, Projects, Content, Vault, Financials, Settings)
- ✅ OpenAI GPT-4 integration
- ✅ Dark mode ready
- ✅ Mobile responsive with hamburger menu
- ✅ **Voice commands (input & output)**
- ✅ **Hands-free operation for AR glasses**
- ✅ **CRM Integration (HubSpot, Salesforce)**
- ✅ **Personal Data Integrations (Social Media, Banking)**
- ✅ **AI Insights Engine**
- ✅ **Shiftly Blue Design System**

**Coming Soon:**
- Background data sync scheduler
- OAuth flows for social platforms
- Additional integrations (TikTok, YouTube, Google Calendar, Notion)
- Predictive insights and goal tracking
- Theme toggle
- Advanced Whisper integration

## 🔗 Integrations

### CRM Platforms
PONS can connect to any major CRM platform:
- **HubSpot** ✅
- **Salesforce** ✅  
- **Pipedrive** (Coming Soon)
- **Custom REST APIs** (Extensible)

Your AI Copilot can search contacts, view deals, and manage your CRM using natural language!

See [CRM_INTEGRATION.md](./CRM_INTEGRATION.md) for setup instructions.

### Personal Data Integrations
Connect your social media, banking, and productivity tools so PONS can learn about you:

**Social Media:**
- **Twitter (𝕏)** ✅ - Posts, engagement, analytics
- **Instagram** ✅ - Business/Creator account data
- **LinkedIn** ✅ - Professional profile and activity
- **Facebook** ✅ - Posts, friends, engagement
- **TikTok, YouTube** (Coming Soon)

**Financial:**
- **Plaid** ✅ - Aggregate all bank accounts
- **Stripe, PayPal** (Coming Soon)

**Productivity:**
- **Google Calendar, Notion, GitHub** (Coming Soon)

See [INTEGRATIONS.md](./INTEGRATIONS.md) for detailed setup guide.

### AI Insights
Once connected, PONS analyzes your data to provide:
- 📊 Social media performance and engagement trends
- 💰 Financial health and spending patterns
- ⚡ Productivity metrics and behavioral patterns
- 🎯 Personalized recommendations and actionable insights

Ask PONS: "Give me insights" or "Analyze my spending"

## 🎤 Voice Commands

PONS supports hands-free voice operation! Perfect for:
- 📱 Mobile devices
- 🕶️ Meta Ray-Ban AR glasses
- 🚗 In-car usage
- 🏃 On-the-go operation

See [VOICE_COMMANDS.md](./VOICE_COMMANDS.md) for detailed instructions.

## 🏗️ Architecture & Components

### Core Components
- `<Sidebar />` - Navigation with glowing active states
- `<TopNavbar />` - Logo, clock, profile, voice button
- `<DashboardCard />` - Reusable card with glow effects
- `<KPIWidget />` - Metric display cards
- `<QuickActions />` - Action button grid
- `<CopilotStatus />` - AI status indicator
- `<VoiceMicButton />` - Voice command trigger

### Project Structure
```
pons/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with sidebar
│   ├── page.tsx           # Dashboard
│   ├── copilot/          # AI chat interface
│   ├── crm/              # CRM integration
│   └── [other modules]/
├── components/            # Reusable UI components
├── core/
│   ├── agents/           # AI agent logic & insights engine
│   └── prompts/          # System prompts
├── lib/
│   ├── crm/             # CRM adapters (HubSpot, Salesforce)
│   ├── integrations/    # Social media & financial adapters
│   ├── api.ts           # API handlers
│   └── openai.ts        # OpenAI integration
└── types/               # TypeScript interfaces
```

## 🎯 Implementation Checklist

### Phase 1: Foundation ✅
- [x] Scaffold page structure with Tailwind Grid/Flex
- [x] Build sidebar + top navbar
- [x] Style dashboard with glowing KPI cards
- [x] Add responsive behavior + dark mode support
- [x] Implement voice commands
- [x] CRM integration architecture

### Phase 2: Enhancement (In Progress)
- [ ] Add Framer Motion animations
- [ ] Implement theme toggle
- [ ] Add faint grid/circuit background
- [ ] Profile dropdown menu
- [ ] Real-time clock in navbar
- [ ] AI suggestion cards with pulse animation
- [ ] Enhanced mobile experience

### Phase 3: Advanced Features
- [ ] Supabase data persistence
- [ ] AI feedback loops & ratings
- [ ] Advanced Whisper integration
- [ ] Vision API for image understanding
- [ ] RAG for knowledge base
- [ ] Webhook integrations


