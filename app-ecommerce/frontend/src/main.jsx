import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Toaster } from 'react-hot-toast'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

// Developer-focused tech theme (inspired by VS Code, GitHub, terminals)
const theme = createTheme({
  palette: {
    primary: {
      main: '#0066cc', // GitHub blue
      light: '#1f8cef',
      dark: '#004499',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6366f1', // VS Code purple
      light: '#8b5cf6',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    success: {
      main: '#22c55e', // Terminal green
      light: '#4ade80',
      dark: '#16a34a',
    },
    warning: {
      main: '#f59e0b', // JavaScript yellow
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // Git red
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#06b6d4', // React cyan
      light: '#22d3ee',
      dark: '#0891b2',
    },
    background: {
      default: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#0d1117', // GitHub dark
      secondary: '#656d76', // GitHub secondary
    },
    grey: {
      50: '#f6f8fa',
      100: '#eaeef2',
      200: '#d0d7de',
      300: '#afb8c1',
      400: '#8c959f',
      500: '#6e7781',
      600: '#57606a',
      700: '#424a53',
      800: '#32383f',
      900: '#24292f',
    },
    // Tech-specific colors
    tech: {
      javascript: '#f7df1e',
      typescript: '#3178c6',
      python: '#3776ab',
      java: '#ed8b00',
      rust: '#ce422b',
      docker: '#2496ed',
      kubernetes: '#326ce5',
      aws: '#ff9900',
      github: '#24292f',
      vscode: '#007acc',
    }
  },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", "Roboto", "-apple-system", "BlinkMacSystemFont", sans-serif',
    htmlFontSize: 16,
    h1: {
      fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #0066cc 0%, #6366f1 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.015em',
      color: '#0d1117',
    },
    h3: {
      fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
      color: '#656d76',
    },
    body2: {
      fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
      color: '#656d76',
    },
    button: {
      fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
    caption: {
      fontFamily: '"Poppins", "Segoe UI", sans-serif',
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.02em',
      color: '#6b7280',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          padding: '12px 24px',
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0, 102, 204, 0.2)',
            transform: 'translateY(-2px)',
          }
        },
        contained: {
          background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
          border: '1px solid rgba(0, 102, 204, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #004499 0%, #003366 100%)',
            border: '1px solid #0066cc',
          }
        },
        outlined: {
          borderColor: '#0066cc',
          borderWidth: '2px',
          color: '#0066cc',
          '&:hover': {
            borderColor: '#004499',
            backgroundColor: 'rgba(0, 102, 204, 0.04)',
            borderWidth: '2px',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          borderRadius: 12,
          border: '1px solid rgba(208, 215, 222, 0.6)',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
            borderColor: 'rgba(0, 102, 204, 0.3)',
            transform: 'translateY(-2px)',
          }
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.025em',
          '&.MuiChip-outlined': {
            borderColor: '#d0d7de',
            backgroundColor: 'rgba(246, 248, 250, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(0, 102, 204, 0.08)',
              borderColor: '#0066cc',
            }
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(208, 215, 222, 0.4)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(208, 215, 222, 0.6)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(246, 248, 250, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(246, 248, 250, 1)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.1)',
            }
          }
        }
      },
    },
  },
})

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)