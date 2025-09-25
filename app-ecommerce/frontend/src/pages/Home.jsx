import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  Alert,
  Chip
} from '@mui/material'
import { ArrowForward, TrendingUp, NewReleases, LocalOffer } from '@mui/icons-material'

import { productsAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Fetch featured products
  const {
    data: featuredProducts,
    isLoading: loadingFeatured,
    error: featuredError
  } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsAPI.getProducts({ featured: true, limit: 8 }),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch categories
  const {
    data: categories,
    isLoading: loadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsAPI.getCategories(),
    select: (data) => data.data,
    staleTime: 10 * 60 * 1000,
  })

  const heroContent = {
    title: "Welcome to E-Shop",
    subtitle: "Discover amazing products at unbeatable prices",
    description: "From electronics to fashion, home & garden to sports - find everything you need in one place.",
    image: "/hero-image.jpg"
  }

  const features = [
    {
      icon: <LocalOffer />,
      title: "Best Prices",
      description: "Competitive prices and exclusive deals"
    },
    {
      icon: <TrendingUp />,
      title: "Quality Products",
      description: "Carefully curated high-quality items"
    },
    {
      icon: <NewReleases />,
      title: "Latest Trends",
      description: "Stay up-to-date with the newest products"
    }
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {heroContent.title}
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                {heroContent.subtitle}
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                {heroContent.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/products"
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'grey.100' }
                  }}
                  endIcon={<ArrowForward />}
                >
                  Shop Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  textAlign: 'center',
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 2
                  }
                }}
              >
                <img
                  src={heroContent.image}
                  alt="Hero"
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Why Choose Us?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ textAlign: 'center', height: '100%', p: 2 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Categories Section */}
        {!loadingCategories && categories && categories.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Shop by Category
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {categories.slice(0, 6).map((category) => (
                <Grid item xs={6} sm={4} md={2} key={category.id}>
                  <Chip
                    label={category.name}
                    variant={selectedCategory === category.id ? "filled" : "outlined"}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                    sx={{
                      width: '100%',
                      py: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'white'
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Featured Products Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2">
              Featured Products
            </Typography>
            <Button
              component={RouterLink}
              to="/products"
              endIcon={<ArrowForward />}
            >
              View All
            </Button>
          </Box>

          {featuredError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Failed to load featured products. Please try again later.
            </Alert>
          )}

          <Grid container spacing={3}>
            {loadingFeatured ? (
              // Loading skeletons
              Array.from(new Array(8)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card>
                    <Skeleton variant="rectangular" width="100%" height={200} />
                    <CardContent>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : featuredProducts && featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" textAlign="center" color="text.secondary">
                  No featured products available at the moment.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Newsletter Section */}
        <Box
          sx={{
            backgroundColor: 'grey.100',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            mb: 4
          }}
        >
          <Typography variant="h5" gutterBottom>
            Stay Updated
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Subscribe to our newsletter for the latest deals and new arrivals
          </Typography>
          <Button variant="contained" size="large">
            Subscribe Now
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default Home