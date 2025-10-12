# 🎯 Explore Sensei - Pavement Performance Suite

[![Build Status](https://github.com/explore-sensei/pavement-performance-suite/workflows/Deploy%20to%20Production/badge.svg)](https://github.com/explore-sensei/pavement-performance-suite/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

> **AI-assisted development for pavement analysis and performance tracking, specifically optimized for asphalt paving and sealing, with a strategic focus on church parking lot repair, sealcoating, and line-striping. Supporting both Virginia and North Carolina contractor licensing.**

## 🚀 **Project Status: 92% Complete - Production Ready**

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

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### **Environment Variables**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Weather API
VITE_OPENWEATHER_API_KEY=your_openweather_api_key

# AI Services
VITE_AI_SERVICE_URL=your_ai_service_url
VITE_AI_SERVICE_KEY=your_ai_service_key
```

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
npm run security:audit   # Security audit
npm run performance:lighthouse  # Lighthouse audit
npm run build:analyze    # Bundle analysis

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

## 🔒 **Security**

### **Security Features**
- **XSS Protection** - DOMPurify sanitization
- **CSRF Protection** - Token-based validation
- **Rate Limiting** - API request throttling
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Parameterized queries
- **File Upload Security** - Type and size validation

### **Security Audit**
```bash
npm run security:audit    # Check for vulnerabilities
npm run security:fix     # Fix security issues
```

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

*Supporting church parking lot repair, veteran-owned businesses, and contractor licensing in Virginia and North Carolina.*