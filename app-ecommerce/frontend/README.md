# E-Commerce Frontend

A modern React frontend application for the e-commerce platform built with Vite, Material-UI, and React Query.

## Features

- **Modern React 18** with functional components and hooks
- **Material-UI (MUI)** for consistent and beautiful UI components
- **React Router** for client-side routing and navigation
- **React Query** for efficient data fetching and caching
- **React Hook Form** with Yup validation for form handling
- **Context API** for global state management (Auth & Cart)
- **Axios** for API communication with the backend
- **Responsive design** that works on all devices
- **TypeScript-ready** with proper JSX structure
- **Hot toast notifications** for user feedback
- **Intersection Observer** for performance optimizations

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication-related components
│   ├── cart/           # Shopping cart components
│   ├── layout/         # Layout components (Header, Footer)
│   └── product/        # Product-related components
├── context/            # React Context providers
│   ├── AuthContext.jsx # Authentication state management
│   └── CartContext.jsx # Shopping cart state management
├── hooks/              # Custom React hooks
│   ├── useDebounce.js  # Debouncing utilities
│   ├── useLocalStorage.js # Local storage management
│   ├── useOrders.js    # Order-related hooks
│   └── useProducts.js  # Product-related hooks
├── pages/              # Main page components
│   ├── Cart.jsx        # Shopping cart page
│   ├── Checkout.jsx    # Checkout process
│   ├── Home.jsx        # Homepage
│   ├── Login.jsx       # Login page
│   ├── Orders.jsx      # Order history
│   ├── ProductDetail.jsx # Product details
│   ├── Products.jsx    # Product listing
│   ├── Profile.jsx     # User profile
│   └── Register.jsx    # Registration page
├── services/           # API service layer
│   └── api.js          # Axios configuration and API calls
├── styles/             # Global styles and CSS
│   └── globals.css     # Global CSS styles
└── utils/              # Utility functions
    ├── formatters.js   # Data formatting utilities
    └── validators.js   # Validation functions
```

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Backend API running on http://localhost:8080

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Components

### Authentication
- Login and registration forms with validation
- JWT token management
- Protected routes for authenticated users
- User profile management

### Product Catalog
- Product listing with filtering and sorting
- Product search functionality
- Product detail pages with image galleries
- Category browsing

### Shopping Cart
- Add/remove items from cart
- Quantity management
- Cart persistence in localStorage
- Cart summary with pricing calculations

### Checkout Process
- Multi-step checkout form
- Shipping address collection
- Payment method selection
- Order confirmation

### User Account
- User profile management
- Order history and tracking
- Account settings

## State Management

### Authentication Context
- User authentication state
- Login/logout functionality
- User profile data

### Cart Context
- Shopping cart items
- Cart operations (add, remove, update)
- Cart persistence

## API Integration

The application connects to the backend API Gateway at `http://localhost:8080/api` and includes:

- User authentication and management
- Product catalog operations
- Shopping cart synchronization
- Order processing
- Payment handling

## Responsive Design

The application is fully responsive and includes:

- Mobile-first design approach
- Responsive grid layouts using Material-UI
- Mobile navigation patterns
- Touch-friendly interfaces

## Performance Optimizations

- React Query for efficient data caching
- Lazy loading of images
- Debounced search inputs
- Code splitting opportunities
- Optimized bundle size

## Accessibility

- Semantic HTML structure
- ARIA labels and attributes
- Keyboard navigation support
- High contrast mode support
- Screen reader compatibility

## Environment Configuration

The application uses environment variables for configuration:

- `VITE_API_URL` - Backend API URL (defaults to http://localhost:8080)
- `VITE_APP_NAME` - Application name
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key for payments

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Integration with Backend

This frontend is designed to work with the microservices backend:

- **API Gateway**: Main entry point at http://localhost:8080
- **User Service**: Authentication and user management
- **Product Service**: Product catalog and categories
- **Cart Service**: Shopping cart operations
- **Order Service**: Order processing and history
- **Payment Service**: Payment processing
- **Inventory Service**: Stock management
- **Notification Service**: Email and SMS notifications

## Contributing

1. Follow the existing code structure and patterns
2. Use Material-UI components consistently
3. Implement proper error handling
4. Add loading states for async operations
5. Ensure responsive design
6. Test on multiple browsers and devices

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari
- Chrome for Android