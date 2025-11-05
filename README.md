# 🎯 Explore Sensei - Pavement Performance Suite

[![Build Status](https://github.com/explore-sensei/pavement-performance-suite/workflows/Deploy%20to%20Production/badge.svg)](https://github.com/explore-sensei/pavement-performance-suite/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

> **AI-assisted development for pavement analysis and performance tracking, specifically optimized for asphalt paving and sealing, with a strategic focus on church parking lot repair, sealcoating, and line-striping. Supporting both Virginia and North Carolina contractor licensing.**

## 🚀 **Project Status: Production Ready**

### ✅ **Completed Features:**

- 🏢 **Jobs Management** - Complete CRUD with church-specific templates
- ⏰ **Time Tracking & Payroll** - GPS verification, approval workflows
- 🚛 **Fleet Management** - Real-time GPS tracking, maintenance scheduling
- 💰 **Invoicing & Finance** - PDF generation, payment tracking
- 🗺️ **Route Optimization** - Traffic-aware routing, crew scheduling
- 🌤️ **Weather Integration** - Real-time alerts, scheduling recommendations
- 🤖 **AI Features** - Asphalt detection, assistant, estimate generation
- ⛪ **Church Features** - 3D parking layout designer, church-friendly scheduling
- 🛡️ **Veteran Business** - Compliance management, certification tracking
- 🏛️ **Dual-state Support** - Virginia and North Carolina contractor licensing

## 🎯 **Business Focus**

### **Church Parking Lot Specialization**

- **3D Parking Layout Designer** - Interactive layout optimization
- **Church-friendly Scheduling** - Minimize disruption to worship services
- **Visual Quoting** - Layout mockups and estimates
- **Communication Protocols** - Direct church leadership contact

### **Veteran-owned Business Support**

- **Compliance Management** - VOSB/SDVOSB/SWaM/HUB certification tracking
- **Performance Reporting** - Automated compliance reporting
- **Business Metrics** - Track growth and performance
- **Government Contracting** - Set-aside opportunities and preferences

### **Dual-state Operations**

- **Virginia** - Class C Specialty Trades (Paving) licensing
- **North Carolina** - Limited/Intermediate contractor licensing
- **Compliance Tracking** - State-specific requirements and reporting

## 🛠️ **Technology Stack**

### **Frontend**

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Three.js** for 3D layouts
- **Framer Motion** for animations
- **PWA** with offline capabilities

### **Backend**

- **Supabase** (PostgreSQL)
- **Row Level Security (RLS)**
- **Real-time subscriptions**
- **Edge functions**

### **Development**

- **Vite** for build tooling
- **ESLint** + **Prettier** for code quality
- **Jest** + **Testing Library** for testing
- **Playwright** for E2E testing
- **Docker** for containerization

## 📦 **Installation**

### **Prerequisites**

- Node.js 18+
- npm 9+
- Git

### **Quick Start**

```bash
# Clone the repository
git clone https://github.com/explore-sensei/pavement-performance-suite.git
cd pavement-performance-suite

# Install dependencies (PowerShell preferred)
pwsh -ExecutionPolicy Bypass -File scripts/install_dependencies.ps1
# or use the POSIX helper
./scripts/install_dependencies.sh

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### 🧭 Onboarding Quickstart

- Run `pwsh -ExecutionPolicy Bypass -File scripts/install_dependencies.ps1` to install Node, Python, Playwright, and Husky tooling in one pass.
- Duplicate `.env.example` into `.env.local` and adjust Supabase, maps, weather, and AI keys for your workspace or staging tenant.
- Export `DATABASE_URL=postgres://supabase:supabase@localhost:54322/postgres` (or update `.env.local`) so the migration tooling can connect.
- Execute `npm run db:migrate` and `npm run db:seed` against your local Supabase instance to populate baseline data (seed assigns `super_admin` to `n8ter8@gmail.com` if that auth user exists).
- Validate the stack with `npm run lint`, `npm run test:all`, and `npm run type-check` before beginning feature work.
- Launch the client with `npm run dev` (or refresh your running dev server) and verify authentication + map providers resolve correctly.

### 🔐 Supabase Admin Account

- Follow the dedicated **[Supabase Admin Bootstrap guide](docs/SUPABASE_ADMIN_BOOTSTRAP.md)** for secure, repeatable instructions.
- In short: create `n8ter8@gmail.com` via the Supabase dashboard, then run `npm run db:migrate && npm run db:seed` to assign the `super_admin` role, HUD preferences, and mission alert subscriptions.
- The seed command is idempotent—re-run it any time you need to refresh baseline data or confirm role assignments.

### 🔑 Secrets Management

- Review `config/secrets-manager.example.json` for the canonical production vault shape. The template is AWS Secrets Manager–centric, but the `provider` and `bootstrap.command` fields can be swapped for Doppler or HashiCorp Vault CLI usage.
- Map each secret entry to runtime environment variables (e.g., `SUPABASE_SERVICE_ROLE_KEY`, `VITE_GOOGLE_MAPS_API_KEY`) and configure your CI/CD pipeline or Docker entrypoint to hydrate the `.env` file at container start—never commit live credentials.
- Establish rotation policies (the template defaults to 30 days) and document ownership before moving to staging or production.

### 🔀 Branching Strategy

- Follow trunk-based flow: keep `main` production-ready and branch from it for all work.
- Use descriptive feature branches such as `feature/ui-shell-grid` or `fix/maps-parcels-toggle`; keep changes atomic and focused.
- Rebase feature branches onto the latest `main` before opening a pull request; resolve conflicts locally.
- Require green checks on linting, tests, and type checks before merging; squash commits to maintain a clear history.
- Tag releases with semantic versions (`vX.Y.Z`) and document them in `CHANGELOG.md` alongside deployment notes.

### 🐳 Containerized Stack

- Build and start the full suite (web, Supabase cluster, ML API, mailhog) with `docker compose up --build`.
- Override cloud credentials by exporting the variables listed in `.env.example`; the compose file injects Supabase keys, JWT secret, and SMTP settings automatically.
- Supabase Studio is exposed on `http://localhost:54323`, REST gateway on `http://localhost:8000`, Postgres on `localhost:54322`, and MailHog UI on `http://localhost:8025`.
- To apply migrations inside the cluster, run `docker compose exec db psql -U supabase -d supabase -f /docker-entrypoint-initdb.d/migrations/<file>.sql` or `npm run db:migrate`.
- Tear down the stack with `docker compose down` (add `-v` to clear persisted volumes when resetting data).

### **Environment Variables**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vodglzbgqsafghlihivy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGdsemJncXNhZmdobGloaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDcwMDQsImV4cCI6MjA2NDkyMzAwNH0.uLAZ_zY3zY-QmDDXwkAuspCUW9NpotsTV5fVCiHf5mM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzQ5MzQ3MDA0LCJleHAiOjIwNjQ5MjMwMDR9.vJ9UpAFeu9S0VuRZPVzM4j3aVx8XHsYpH2fIO4cKk3o
SUPABASE_JWT_SECRET=super-secret-jwt-local

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBaUoISC-zfsvfJumBuZnstJv9uf4BgWJM
VITE_GOOGLE_MAPS_API_KEY_ALT=AIzaSyDcVJ1Za5tw7LS_OJh8t3RtDjdOoTz8-6I

# Mapbox Fallback
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZXhwbG9yZS1zZW5zZWkiLCJhIjoiY2xpbnRhYXA0MGtyaDNrbnE3cDZtYTIxZyJ9.SAMPLEKEY1234567890abcdef

# Weather API
VITE_OPENWEATHER_API_KEY=fcd180ffa1ffafd662a60892c7a2bb97

# Parcels Overlay (raster tiles template)
# e.g., https://your-arcgis-server/arcgis/rest/services/Parcels/MapServer/tile/{z}/{y}/{x}
VITE_PARCELS_TILES_TEMPLATE=https://tiles.patrickcountyva.gov/arcgis/rest/services/Parcels/MapServer/tile/{z}/{y}/{x}

# AI Services
VITE_AI_SERVICE_URL=https://api.exploresensei.com/ai
VITE_AI_SERVICE_KEY=sk-local-ai-service-key
VITE_VALID_API_KEYS=sk-local-ai-service-key,sk-field-scanner-key
```

### Maps billing and keys

- Google Maps requires an API key with billing enabled for advanced tiles and Static Maps. Without billing, Google may watermark or throttle tiles. The app will gracefully fall back to Mapbox/MapLibre when Google fails, but some tools are disabled without Google.
- You can override keys per-device in Settings → API Keys; overrides are stored locally in `localStorage`.

### PWA install and updates

- The web app is a Progressive Web App (PWA). A service worker caches an offline shell and key APIs.
- You can install the app from your browser (Add to Home Screen). When a new version is available, you’ll receive an in-app toast to update.

You can also set the parcels template at runtime via the Settings UI; it saves under `aos_settings.providers.parcelsTilesTemplate` in `localStorage`.

## 🚀 **Development**

### **Available Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests
npm run test:all         # Run all tests

# Database
npm run db:generate      # Generate TypeScript types
npm run db:reset         # Reset database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database

# Security & Performance
npm run security:audit        # Security audit
npm run security:audit:ci     # JSON audit report for CI
npm run performance:lighthouse  # Lighthouse audit
npm run build:analyze    # Bundle analysis
npm run performance:budget # Size budget check

# Documentation
npm run docs:generate    # Generate API docs
npm run docs:serve       # Serve documentation
```

### **Project Structure**

```
src/
├── components/           # React components
│   ├── church/         # Church-specific features
│   ├── veteran/        # Veteran business features
│   ├── fleet/          # Fleet management
│   ├── finance/        # Invoicing & finance
│   ├── ai/             # AI features
│   ├── weather/        # Weather integration
│   └── route/          # Route optimization
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── accessibility.ts # A11y utilities
│   ├── security.ts     # Security utilities
│   ├── performance.ts  # Performance optimization
│   ├── monitoring.ts    # Observability system
│   ├── api-docs.ts     # API documentation
│   └── constants.ts     # Business constants
├── types/              # TypeScript type definitions
└── __tests__/          # Test suites
```

## 🧭 How to Use and Get the Most Out of It

- Jobs: Create jobs with accurate geolocation to unlock map, weather, and routing.
- Scheduling: Use weather radar and alerts to pick optimal work windows for churches.
- Fleet: Keep `maintenance_records` current; maintenance status badges derive from `next_maintenance`.
- Photos: Use photo documentation for visual quotes and completion proofs.
- AI Assistant: Trigger asphalt detection from the map; export measurements to estimates.
- Finance: Generate invoices from completed jobs; export PDFs from the Finance module.
- Themes: Switch themes in Settings; upload wallpaper images and tune opacity for readability.
- PWA: Install on mobile/desktop; updates prompt via toast. Offline mode supports key screens.
- Accessibility: Keyboard nav and a11y checks are enforced; use semantic labels where prompted.

Tips

- Keep `aos_settings` small; large images as wallpaper may impact performance.
- Use the Mapbox fallback only when Google Maps API is unavailable; some advanced tools are disabled.
- Run `npm run security:audit` regularly and keep dependencies up to date.
- Use `npm run build:analyze` to monitor bundle sizes; consider code splitting heavy modals.

## 🧪 **Testing**

### **Test Coverage**

- **Unit Tests** - Jest + Testing Library (85%+ coverage)
- **Integration Tests** - Supabase queries and API integrations
- **E2E Tests** - Playwright for critical user flows
- **Accessibility Tests** - Automated a11y testing
- **Performance Tests** - Lighthouse audits

### **Running Tests**

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:coverage    # Coverage report
```

### **Performance & Load**

- Run the included k6 script to smoke test critical flows:

```bash
npx k6 run scripts/loadtest.k6.js
```

Configure base URLs via environment variables in the script as needed.

## 🔒 **Security**

### **Security Features**

- **XSS Protection** - DOMPurify sanitization
- **CSRF Protection** - Token-based validation
- **Rate Limiting** - API request throttling
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Parameterized queries
- **File Upload Security** - Type and size validation
- **Secrets Management Template** - `config/secrets-manager.example.json` documents the production vault layout and rotation cadence.

### **Security Audit**

```bash
npm run security:audit              # Check for vulnerabilities
npm run security:audit -- --json > audit-report.json   # Produce CI-friendly JSON output
npm run security:fix                # Attempt automatic remediation
```

- Run the audit scripts in CI at least weekly and monitor the generated report for regressions.
- Automate credential rotation using the secrets manager template and refresh environment variables via your vault CLI before each deploy.

## 📊 **Performance**

### **Performance Optimizations**

- **Code Splitting** - Dynamic imports
- **Lazy Loading** - Component and route lazy loading
- **Image Optimization** - WebP format, responsive images
- **Caching** - Service worker, API caching
- **Bundle Analysis** - Size monitoring

### **Performance Monitoring**

```bash
npm run performance:lighthouse  # Lighthouse audit
npm run build:analyze          # Bundle analysis
npm run performance:budget     # Size budget check
```

## 🌐 **Deployment**

### **Production Deployment**

```bash
# Build for production
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### **Docker Deployment**

```bash
# Build Docker image
docker build -t explore-sensei .

# Run container
docker run -p 3000:3000 explore-sensei
```

## 📚 **Documentation**

### **API Documentation**

- **OpenAPI/Swagger** - Complete API specification
- **Interactive Docs** - Try API endpoints
- **Code Examples** - Integration examples

### **User Documentation**

- **User Guides** - Step-by-step instructions
- **Video Tutorials** - Visual learning
- **FAQ** - Common questions and answers

### **Developer Documentation**

- **Architecture Guide** - System design
- **Component Library** - UI component documentation
- **Contributing Guide** - How to contribute

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### **Code Standards**

- **TypeScript** - Strict type checking
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Testing** - 85%+ coverage required

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Getting Help**

- **Documentation** - [docs.exploresensei.com](https://docs.exploresensei.com)
- **Issues** - [GitHub Issues](https://github.com/explore-sensei/pavement-performance-suite/issues)
- **Discussions** - [GitHub Discussions](https://github.com/explore-sensei/pavement-performance-suite/discussions)
- **Email** - support@exploresensei.com

### **Business Support**

- **Church Clients** - Specialized church onboarding
- **Veteran Business** - Compliance assistance
- **State Licensing** - Virginia and North Carolina support
- **Performance Optimization** - Continuous improvement

## 🎉 **Acknowledgments**

- **Church Community** - For feedback and requirements
- **Veteran Business Community** - For compliance guidance
- **Open Source Community** - For amazing tools and libraries
- **Contributors** - For making this project possible

---

**Built with ❤️ for the pavement industry**

_Supporting church parking lot repair, veteran-owned businesses, and contractor licensing in Virginia and North Carolina._
