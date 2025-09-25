import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  IconButton,
  Rating,
  Chip,
  Divider,
  Card,
  CardContent,
  Skeleton,
  Alert,
  ButtonGroup,
  Tabs,
  Tab,
  Breadcrumbs,
  Link
} from '@mui/material'
import {
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  Add,
  Remove,
  ArrowBack,
  LocalShipping,
  Security,
  Assignment
} from '@mui/icons-material'

import { productsAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/product/ProductCard'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, isInCart } = useCart()
  const { isAuthenticated } = useAuth()
  
  const [quantity, setQuantity] = useState(1)
  const [selectedTab, setSelectedTab] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  // Fetch product details
  const {
    data: product,
    isLoading,
    error
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getProduct(id),
    select: (data) => data.data,
    enabled: !!id,
  })

  // Fetch related products
  const {
    data: relatedProducts,
    isLoading: loadingRelated
  } = useQuery({
    queryKey: ['products', 'related', product?.category],
    queryFn: () => productsAPI.getProductsByCategory(product?.category),
    select: (data) => data.data?.products?.filter(p => p.id !== id).slice(0, 4) || [],
    enabled: !!product?.category,
  })

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
    }
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity)
    }
  }

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setIsFavorite(!isFavorite)
  }

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Product not found or failed to load. Please try again later.
        </Alert>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="100%" height={100} />
            <Skeleton variant="rectangular" width="100%" height={60} />
          </Grid>
        </Grid>
      </Container>
    )
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Product not found.</Alert>
      </Container>
    )
  }

  const images = product.images || [product.image || '/placeholder-product.jpg']
  const isProductInCart = isInCart(product.id)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button and breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        
        <Breadcrumbs>
          <Link href="/" underline="hover">Home</Link>
          <Link href="/products" underline="hover">Products</Link>
          {product.categoryName && (
            <Link href={`/products?category=${product.category}`} underline="hover">
              {product.categoryName}
            </Link>
          )}
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            {/* Main Image */}
            <Box
              sx={{
                width: '100%',
                height: 400,
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                border: 1,
                borderColor: 'grey.300'
              }}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg'
                }}
              />
            </Box>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
                {images.map((image, index) => (
                  <Box
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: selectedImage === index ? 2 : 1,
                      borderColor: selectedImage === index ? 'primary.main' : 'grey.300',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Title and Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                {product.name}
              </Typography>
              <Box>
                <IconButton onClick={handleToggleFavorite} color={isFavorite ? 'error' : 'default'}>
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Box>
            </Box>

            {/* Rating and Reviews */}
            {product.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={product.rating} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({product.reviewCount || 0} reviews)
                </Typography>
              </Box>
            )}

            {/* Price */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {formatPrice(product.salePrice || product.price)}
                </Typography>
                {product.salePrice && (
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration: 'line-through',
                      color: 'text.secondary'
                    }}
                  >
                    {formatPrice(product.price)}
                  </Typography>
                )}
                {product.salePrice && (
                  <Chip
                    label={`Save ${Math.round(((product.price - product.salePrice) / product.price) * 100)}%`}
                    color="error"
                    size="small"
                  />
                )}
              </Box>
              
              {/* Stock Status */}
              <Typography
                variant="body2"
                color={product.stock > 0 ? 'success.main' : 'error.main'}
                sx={{ fontWeight: 'medium' }}
              >
                {product.stock > 0 
                  ? `${product.stock} in stock` 
                  : 'Out of stock'
                }
              </Typography>
            </Box>

            {/* Short Description */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {product.shortDescription || product.description}
            </Typography>

            {/* Quantity and Add to Cart */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body1">Quantity:</Typography>
                <ButtonGroup size="small" variant="outlined">
                  <Button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Remove />
                  </Button>
                  <Button disabled sx={{ minWidth: 50 }}>
                    {quantity}
                  </Button>
                  <Button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock || 1)}
                  >
                    <Add />
                  </Button>
                </ButtonGroup>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<AddShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{ mb: 2 }}
              >
                {isProductInCart ? 'Add More to Cart' : 'Add to Cart'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>
            </Box>

            {/* Features */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <LocalShipping color="primary" />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Free Shipping
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Security color="primary" />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Secure Payment
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Assignment color="primary" />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Easy Returns
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Product Details Tabs */}
            <Box sx={{ mt: 4 }}>
              <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                <Tab label="Description" />
                <Tab label="Specifications" />
                <Tab label="Reviews" />
              </Tabs>

              <Box sx={{ py: 3 }}>
                {selectedTab === 0 && (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {product.description || 'No description available.'}
                  </Typography>
                )}
                
                {selectedTab === 1 && (
                  <Box>
                    {product.specifications ? (
                      Object.entries(product.specifications).map(([key, value]) => (
                        <Box key={key} sx={{ display: 'flex', py: 1, borderBottom: 1, borderColor: 'grey.200' }}>
                          <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 'medium' }}>
                            {key}:
                          </Typography>
                          <Typography variant="body2">{value}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No specifications available.
                      </Typography>
                    )}
                  </Box>
                )}
                
                {selectedTab === 2 && (
                  <Typography variant="body2" color="text.secondary">
                    Reviews feature coming soon.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" gutterBottom>
            Related Products
          </Typography>
          <Grid container spacing={3}>
            {loadingRelated ? (
              Array.from(new Array(4)).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <Skeleton variant="rectangular" width="100%" height={200} />
                    <CardContent>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              relatedProducts.map((relatedProduct) => (
                <Grid item xs={12} sm={6} md={3} key={relatedProduct.id}>
                  <ProductCard product={relatedProduct} />
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}
    </Container>
  )
}

export default ProductDetail