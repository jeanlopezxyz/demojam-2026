import { useEffect } from 'react'
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Google,
  GitHub,
  Email,
  Security,
  Speed,
  VerifiedUser
} from '@mui/icons-material'

import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login, isAuthenticated, isLoading, keycloak } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const action = searchParams.get('action')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleKeycloakLogin = (provider = null) => {
    if (keycloak) {
      const loginOptions = {
        redirectUri: window.location.origin
      }
      
      if (provider) {
        loginOptions.idpHint = provider
      }
      
      keycloak.login(loginOptions)
    } else {
      login()
    }
  }

  const socialProviders = [
    {
      name: 'Google',
      icon: <Google sx={{ fontSize: 24 }} />,
      color: '#ea4335',
      provider: 'google',
      description: 'Continue with your Google account'
    },
    {
      name: 'GitLab',
      icon: <GitHub sx={{ fontSize: 24 }} />,
      color: '#fc6d26',
      provider: 'gitlab',
      description: 'Continue with your GitLab account'
    },
    {
      name: 'Email',
      icon: <Email sx={{ fontSize: 24 }} />,
      color: '#6b7280',
      provider: null,
      description: 'Continue with email and password'
    }
  ]

  const benefits = [
    {
      icon: <Security sx={{ fontSize: 32, color: '#10b981' }} />,
      title: 'Secure Authentication',
      description: 'Enterprise-grade security with Keycloak'
    },
    {
      icon: <Speed sx={{ fontSize: 32, color: '#3b82f6' }} />,
      title: 'Quick Access',
      description: 'One-click login with your preferred provider'
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 32, color: '#8b5cf6' }} />,
      title: 'Trusted Platform',
      description: 'Your data is protected and never shared'
    }
  ]

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center" minHeight="80vh">
          {/* Left Side - Benefits */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ pr: { lg: 4 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: '#1f2937',
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3rem' }
                }}
              >
                Welcome to{' '}
                <Box component="span" sx={{ color: '#3b82f6' }}>
                  ShopHub
                </Box>
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: '#6b7280',
                  mb: 6,
                  lineHeight: 1.6,
                  fontSize: '1.1rem'
                }}
              >
                {action === 'register' 
                  ? 'Join thousands of satisfied customers and start your premium shopping experience today.'
                  : 'Sign in to access your account, track orders, and enjoy personalized recommendations.'
                }
              </Typography>

              {/* Benefits */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {benefits.map((benefit, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '16px',
                        backgroundColor: `${benefit.icon.props.style.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {benefit.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body1" color="#6b7280" lineHeight={1.6}>
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} lg={6}>
            <Paper
              sx={{
                p: 6,
                borderRadius: '24px',
                boxShadow: '0 20px 80px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white'
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#1f2937',
                    mb: 2
                  }}
                >
                  {action === 'register' ? 'Create Account' : 'Sign In'}
                </Typography>
                <Typography variant="body1" color="#6b7280">
                  {action === 'register' 
                    ? 'Choose your preferred method to create your account'
                    : 'Choose your preferred method to sign in'
                  }
                </Typography>
              </Box>

              {/* Social Login Options */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                {socialProviders.map((provider, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="large"
                    onClick={() => handleKeycloakLogin(provider.provider)}
                    startIcon={provider.icon}
                    sx={{
                      py: 2,
                      borderRadius: '12px',
                      borderColor: '#e5e7eb',
                      color: '#1f2937',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: provider.color,
                        backgroundColor: `${provider.color}08`,
                        color: provider.color,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 8px 25px ${provider.color}20`
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 4,
                        height: '100%',
                        backgroundColor: provider.color,
                        transform: 'scaleY(0)',
                        transformOrigin: 'bottom',
                        transition: 'transform 0.3s ease'
                      },
                      '&:hover::before': {
                        transform: 'scaleY(1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 2 }}>
                      <Typography variant="body1" fontWeight="600">
                        Continue with {provider.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {provider.description}
                      </Typography>
                    </Box>
                  </Button>
                ))}
              </Box>

              {/* Security Notice */}
              <Alert
                severity="info"
                sx={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  '& .MuiAlert-icon': {
                    color: '#3b82f6'
                  }
                }}
              >
                <Typography variant="body2">
                  <strong>Secure Login:</strong> All authentication is handled securely through Keycloak. 
                  Your credentials are never stored on our servers.
                </Typography>
              </Alert>

              {/* Alternative Actions */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="#6b7280">
                  {action === 'register' ? 'Already have an account?' : "Don't have an account?"}
                  {' '}
                  <Button
                    component={RouterLink}
                    to={action === 'register' ? '/login' : '/login?action=register'}
                    sx={{
                      color: '#3b82f6',
                      textTransform: 'none',
                      fontWeight: 600,
                      p: 0,
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {action === 'register' ? 'Sign in here' : 'Create account'}
                  </Button>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Login