# KRFDS - Kenya Re Facultative Decision Support System

## Overview
A comprehensive AI-powered Facultative Reinsurance Decision Support System for Kenya Reinsurance Company, providing automated document processing, risk assessment, pricing recommendations, and portfolio management capabilities.

## Features
- **Role-based Dashboards**: Tailored interfaces for Underwriters, Portfolio Managers, Senior Managers, Cedants/Brokers, and Regulators
- **Document Processing**: Automated email ingestion and manual upload with AI-powered data extraction
- **Risk Assessment**: Integrated catastrophe modeling, PML calculations, and ESG/climate risk analysis
- **Pricing Engine**: AI-driven premium calculations with editable assumptions and market comparisons
- **Portfolio Management**: Real-time impact simulation and concentration monitoring
- **Market Intelligence**: Competitor tracking and market trend analysis
- **Report Generation**: Automated acceptance/decline letters and templated reports
- **AI Explainability**: Transparent model outputs with audit trails and confidence scores

## Tech Stack
- **Frontend**: Next.js 13+ with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API with custom hooks
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd krfds-workspace

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file:
```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development

# Authentication (when backend is integrated)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=50MB
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm run start

# Export static build
npm run build && npm run export
```

## Project Structure
```
├── app/                    # Next.js 13 app directory
│   ├── (dashboard)/       # Dashboard layout group
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── dashboard/        # Dashboard-specific components
│   ├── documents/        # Document handling components
│   ├── risk-assessment/  # Risk analysis components
│   ├── portfolio/        # Portfolio management components
│   └── charts/           # Data visualization components
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── contexts/             # React Context providers
└── public/               # Static assets
```

## Role-Based Access
- **Facultative Underwriters**: Full submission processing and risk analysis
- **Portfolio Managers**: Portfolio monitoring and concentration analysis
- **Senior Managers**: Strategic overview and performance metrics
- **Cedants/Brokers**: Submission status and feedback access
- **Regulators**: Compliance reporting and audit trails

## Backend Integration Points
- `/api/submissions` - Document upload and processing
- `/api/risk-assessment` - AI-powered risk analysis
- `/api/pricing` - Premium calculations and recommendations
- `/api/portfolio` - Portfolio impact simulation
- `/api/market-insights` - Competitive intelligence
- `/api/reports` - Document generation and templates
- `/api/auth` - User authentication and authorization

## Development Guidelines
- Follow Next.js 13+ app directory conventions
- Use TypeScript for all components and utilities
- Implement proper error boundaries and loading states
- Maintain consistent component naming (PascalCase for components, kebab-case for files)
- Write comprehensive JSDoc comments for complex functions
- Use custom hooks for business logic and API calls

## Contributing
1. Create feature branches from `develop`
2. Follow established code style and linting rules
3. Write unit tests for new components and utilities
4. Update documentation for any API changes
5. Submit pull requests with detailed descriptions

## License
Proprietary - Kenya Reinsurance Corporation Limited