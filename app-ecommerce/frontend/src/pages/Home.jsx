import React, { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Global, css } from '@emotion/react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Chip
} from '@mui/material'
import { 
  ArrowForward,
  LocalShipping,
  Security,
  SupportAgent,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material'

import { productsAPI } from '../services/api'
import RecommendedProducts from '../components/product/RecommendedProducts'

const Home = () => {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Tech carousel images/slides
  const techSlides = [
    {
      title: 'Java Developer',
      subtitle: 'Enterprise Ready',
      color: '#ed8b00',
      icon: '☕',
      code: '<Java/>',
      description: 'Para developers enterprise'
    },
    {
      title: 'Python Engineer', 
      subtitle: 'Data & AI',
      color: '#3776ab',
      icon: '🐍',
      code: 'import style',
      description: 'Para data scientists'
    },
    {
      title: 'Docker DevOps',
      subtitle: 'Container Expert',
      color: '#2496ed',
      icon: '🐳',
      code: 'docker run',
      description: 'Para DevOps engineers'
    },
    {
      title: 'AWS Architect',
      subtitle: 'Cloud Native',
      color: '#ff9900',
      icon: '☁️',
      code: 'aws deploy',
      description: 'Para cloud architects'
    }
  ]
  
  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % techSlides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [techSlides.length])

  // Fetch categories for the home page
  const {
    data: categories,
    isLoading: loadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await productsAPI.getCategories();
      return response;
    },
    select: (response) => {
      // axios response: response.data contains the API response
      const categories = response.data?.data;
      return Array.isArray(categories) ? categories : [];
    },
    staleTime: 10 * 60 * 1000,
    retry: 3,
    onError: (error) => {
      console.error('Categories fetch error:', error);
    }
  })

  const features = [
    {
      icon: <LocalShipping />,
      title: "Entrega Git-Fast",
      description: "Velocidad de CI/CD hasta tu puerta. Envío gratis en pedidos mayores a $75. Como hacer push a main - resultados instantáneos.",
      highlight: "Envío gratis",
      color: "#22c55e"
    },
    {
      icon: <Security />,
      title: "Seguridad Enterprise",
      description: "Encriptación nivel bancario con JWT tokens y OAuth2. Tus datos de pago más seguros que tus claves de producción.",
      highlight: "OAuth2 Seguro",
      color: "#0066cc"
    },
    {
      icon: <SupportAgent />,
      title: "Soporte Developer",
      description: "Soporte nivel Stack Overflow de expertos tech que realmente conocen sus IDEs. Sin scripts de call center.",
      highlight: "Expertos Tech", 
      color: "#6366f1"
    }
  ]

  return (
    <>
      {/* CSS Animation for floating icons */}
      <Global styles={css`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-15px); 
          }
        }
      `} />
      
      <Box sx={{ flexGrow: 1 }}>
      {/* Modern Hero Section - Redesigned */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          pt: { xs: 2, md: 3 },
          pb: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.03) 0%, rgba(99, 102, 241, 0.05) 100%)',
            borderRadius: '0 0 0 100px'
          }}
        />
        
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center" minHeight="45vh">
            
            {/* Left Side - Content */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                textAlign: { xs: 'center', md: 'left' },
                pl: { md: 2 },
                pr: { md: 4 },
                zIndex: 2,
                position: 'relative'
              }}>

                {/* Main Headline */}
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: '"Poppins", "SF Pro Display", sans-serif',
                    fontWeight: 700,
                    fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4.5rem' },
                    lineHeight: { xs: 1.2, md: 1.1 },
                    mb: 1.5,
                    letterSpacing: '-0.03em',
                    color: '#1a1a1a'
                  }}
                >
                  Viste tu{' '}
                  <Box component="span" sx={{ 
                    background: 'linear-gradient(135deg, #0066cc 0%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Stack
                  </Box>
                </Typography>

                {/* Subtitle */}
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 400,
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    lineHeight: 1.6,
                    mb: 3,
                    color: '#64748b',
                    maxWidth: { md: '90%' }
                  }}
                >
                  Camisetas premium que reflejan tu pasión por la tecnología. 
                  Diseños únicos para cada framework, lenguaje y herramienta.
                </Typography>

                {/* Stats Row */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 2, md: 4 },
                  mb: 4,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  flexWrap: 'wrap'
                }}>
                  {[
                    { number: '500+', label: 'Desarrolladores' },
                    { number: '50+', label: 'Tecnologías' },
                    { number: '4.9⭐', label: 'Rating' }
                  ].map((stat, index) => (
                    <Box key={index} sx={{ textAlign: 'center' }}>
                      <Typography
                        sx={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 700,
                          fontSize: '1.6rem',
                          color: '#0066cc',
                          lineHeight: 1
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.8rem',
                          color: '#64748b',
                          fontWeight: 500
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* CTA Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  alignItems: 'center', 
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  flexWrap: 'wrap'
                }}>
                  <Button
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    to="/products"
                    endIcon={<ArrowForward />}
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      px: 5,
                      py: 2,
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                      boxShadow: '0 8px 25px rgba(0, 102, 204, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 35px rgba(0, 102, 204, 0.4)'
                      }
                    }}
                  >
                    Explorar Colección
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    component={RouterLink}
                    to="/products?featured=true"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      px: 4,
                      py: 2,
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '12px',
                      borderColor: '#0066cc',
                      color: '#0066cc',
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        backgroundColor: 'rgba(0, 102, 204, 0.05)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Ver Ofertas
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Right Side - Modern Visual */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                py: { xs: 4, md: 0 }
              }}>
                {/* Modern Floating Card Design */}
                <Box sx={{
                  position: 'relative',
                  width: { xs: 320, md: 420 },
                  height: { xs: 380, md: 460 }
                }}>
                  
                  {/* Main Featured Product Card */}
                  <Box sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '15%',
                    width: '70%',
                    height: '75%',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    zIndex: 3
                  }}>
                    {/* Abstract Tech Icon */}
                    <Box sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${techSlides[currentSlide].color}15 0%, ${techSlides[currentSlide].color}30 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      transition: 'all 0.5s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Abstract SVG Pattern */}
                      <svg width="60" height="60" viewBox="0 0 60 60" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                        <defs>
                          <linearGradient id={`grad-${currentSlide}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: techSlides[currentSlide].color, stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: techSlides[currentSlide].color, stopOpacity: 0.7 }} />
                          </linearGradient>
                        </defs>
                        
                        {/* Different patterns for each tech */}
                        {currentSlide === 0 && ( // Java
                          <g fill={`url(#grad-${currentSlide})`}>
                            <circle cx="30" cy="20" r="8" />
                            <rect x="20" y="30" width="20" height="4" rx="2" />
                            <rect x="15" y="38" width="30" height="4" rx="2" />
                            <circle cx="45" cy="45" r="4" opacity="0.6" />
                          </g>
                        )}
                        
                        {currentSlide === 1 && ( // Python
                          <g fill={`url(#grad-${currentSlide})`}>
                            <path d="M15 15 Q30 5 45 15 Q30 25 15 15" />
                            <path d="M15 35 Q30 25 45 35 Q30 45 15 35" />
                            <circle cx="20" cy="20" r="3" />
                            <circle cx="40" cy="40" r="3" />
                          </g>
                        )}
                        
                        {currentSlide === 2 && ( // Docker
                          <g fill={`url(#grad-${currentSlide})`}>
                            <rect x="10" y="15" width="40" height="25" rx="4" />
                            <rect x="15" y="10" width="30" height="4" rx="2" />
                            <rect x="20" y="5" width="20" height="4" rx="2" />
                            <circle cx="50" cy="50" r="6" opacity="0.4" />
                          </g>
                        )}
                        
                        {currentSlide === 3 && ( // AWS
                          <g fill={`url(#grad-${currentSlide})`}>
                            <path d="M10 40 Q30 20 50 40 L45 45 Q30 30 15 45 Z" />
                            <circle cx="30" cy="15" r="8" opacity="0.8" />
                            <circle cx="15" cy="50" r="4" opacity="0.6" />
                            <circle cx="45" cy="50" r="4" opacity="0.6" />
                          </g>
                        )}
                      </svg>
                    </Box>
                    
                    <Typography sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      color: '#1a1a1a',
                      mb: 1,
                      textAlign: 'center'
                    }}>
                      {techSlides[currentSlide].title}
                    </Typography>
                    
                    <Typography sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.9rem',
                      color: '#64748b',
                      textAlign: 'center',
                      mb: 2
                    }}>
                      {techSlides[currentSlide].description}
                    </Typography>

                    <Box sx={{
                      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                      fontSize: '0.8rem',
                      color: techSlides[currentSlide].color,
                      backgroundColor: `${techSlides[currentSlide].color}10`,
                      px: 2,
                      py: 0.5,
                      borderRadius: '6px',
                      fontWeight: 600
                    }}>
                      {techSlides[currentSlide].code}
                    </Box>
                  </Box>

                  {/* Modern Abstract Floating Elements */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 60,
                    height: 60,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #22c55e15 0%, #22c55e25 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '0s',
                    zIndex: 2,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
                            fill="#22c55e" opacity="0.8" />
                    </svg>
                  </Box>

                  <Box sx={{
                    position: 'absolute',
                    bottom: '5%',
                    left: 0,
                    width: 50,
                    height: 50,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f59e0b15 0%, #f59e0b25 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '1s',
                    zIndex: 2,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <polygon points="10,2 15,8 8,8" fill="#f59e0b" opacity="0.8" />
                      <polygon points="2,12 8,18 8,12" fill="#f59e0b" opacity="0.6" />
                      <polygon points="12,12 18,12 15,18" fill="#f59e0b" opacity="0.7" />
                    </svg>
                  </Box>

                  <Box sx={{
                    position: 'absolute',
                    top: '30%',
                    right: '-5%',
                    width: 45,
                    height: 45,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f115 0%, #6366f125 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '2s',
                    zIndex: 2,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <circle cx="9" cy="9" r="7" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.8" />
                      <circle cx="9" cy="9" r="3" fill="#6366f1" opacity="0.6" />
                      <circle cx="5" cy="5" r="1.5" fill="#6366f1" opacity="0.7" />
                      <circle cx="13" cy="5" r="1.5" fill="#6366f1" opacity="0.7" />
                    </svg>
                  </Box>

                  {/* Slide Indicators */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1,
                    zIndex: 4
                  }}>
                    {techSlides.map((_, index) => (
                      <Box
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: index === currentSlide ? '#0066cc' : 'rgba(0, 102, 204, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: '#0066cc',
                            transform: 'scale(1.2)'
                          }
                        }}
                      />
                    ))}
                  </Box>

                  {/* Background Decorative Elements */}
                  <Box sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '-10%',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.05) 0%, rgba(99, 102, 241, 0.08) 100%)',
                    filter: 'blur(20px)',
                    zIndex: 1
                  }} />
                  
                  <Box sx={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '-15%',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(0, 102, 204, 0.08) 100%)',
                    filter: 'blur(25px)',
                    zIndex: 1
                  }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Tech Categories Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        <Typography 
          variant="h3" 
          sx={{ 
            textAlign: 'center', 
            mb: 3,
            fontWeight: 600,
            color: '#0d1117',
            fontSize: { xs: '1.8rem', md: '2.2rem' }
          }}
        >
          Compra por Tecnología
        </Typography>

        {loadingCategories ? (
          <Grid container spacing={3}>
            {Array.from(new Array(4)).map((_, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : categoriesError ? (
          <Alert severity="error">Error cargando categorías</Alert>
        ) : (
          <Grid container spacing={3}>
            {Array.isArray(categories) && categories.map((category) => (
              <Grid item xs={6} sm={3} key={category.id}>
                <Card
                  component={RouterLink}
                  to={`/products?category=${category.id}`}
                  sx={{
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: category.color || '#0066cc',
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${category.color || '#0066cc'}20`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: category.color || '#0066cc',
                        mb: 1,
                        fontSize: '1.5rem'
                      }}
                    >
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ropa tech profesional
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Trending Products Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        <RecommendedProducts type="popular" limit={8} />
      </Container>

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 600,
              color: '#0d1117',
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Por Qué Nos Eligen los Developers
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      borderColor: feature.color,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: `${feature.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        color: feature.color
                      }}
                    >
                      {React.cloneElement(feature.icon, { sx: { fontSize: 40 } })}
                    </Box>
                    
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#0d1117' }}>
                      {feature.title}
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {feature.description}
                    </Typography>
                    
                    <Chip 
                      label={feature.highlight}
                      sx={{ 
                        backgroundColor: feature.color,
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      </Box>
    </>
  )
}

export default Home