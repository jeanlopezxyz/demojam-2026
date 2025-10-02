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
                    {/* Featured Product */}
                    <Box sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${techSlides[currentSlide].color}20 0%, ${techSlides[currentSlide].color}40 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      transition: 'all 0.5s ease'
                    }}>
                      <Typography sx={{ 
                        fontSize: '3rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }}>
                        {techSlides[currentSlide].icon}
                      </Typography>
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
                      fontFamily: 'monospace',
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

                  {/* Floating Elements */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 60,
                    height: 60,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #22c55e20 0%, #22c55e40 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '0s',
                    zIndex: 2
                  }}>
                    <Typography sx={{ fontSize: '1.5rem' }}>🚀</Typography>
                  </Box>

                  <Box sx={{
                    position: 'absolute',
                    bottom: '5%',
                    left: 0,
                    width: 50,
                    height: 50,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b40 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '1s',
                    zIndex: 2
                  }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>⚡</Typography>
                  </Box>

                  <Box sx={{
                    position: 'absolute',
                    top: '30%',
                    right: '-5%',
                    width: 45,
                    height: 45,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f120 0%, #6366f140 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '2s',
                    zIndex: 2
                  }}>
                    <Typography sx={{ fontSize: '1rem' }}>💻</Typography>
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