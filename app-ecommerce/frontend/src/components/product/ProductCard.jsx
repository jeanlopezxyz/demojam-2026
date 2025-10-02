import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Rating
} from '@mui/material'
import {
  AddShoppingCart,
  FavoriteBorder,
  Favorite
} from '@mui/icons-material'

import { useCart } from '../../context/CartContext'

const ProductCard = ({ product, onQuickView, layout = 'grid' }) => {
  const { addToCart } = useCart()
  const [isFavorite, setIsFavorite] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const discountPercentage = product.salePrice && product.price ? 
    Math.round(((product.price - product.salePrice) / product.price) * 100) : 0

  const isListView = layout === 'list'

  return (
    <Card
      component={RouterLink}
      to={`/products/${product.id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: isListView ? 'row' : 'column',
        textDecoration: 'none',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          borderColor: '#1976d2'
        }
      }}
    >
      {/* Image Container */}
      <Box sx={{ 
        position: 'relative', 
        overflow: 'hidden',
        width: isListView ? 200 : '100%',
        flexShrink: 0
      }}>
        <CardMedia
          component="img"
          height={isListView ? 150 : 280}
          image={product.images && product.images[0] ? product.images[0] : `https://via.placeholder.com/400x280/6B7280/FFFFFF?text=${encodeURIComponent(product.name || 'Product')}`}
          alt={product.name}
          sx={{
            objectFit: 'cover'
          }}
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <Chip
            label={`${discountPercentage}% OFF`}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: '#ef4444',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        )}

        {/* Favorite Button */}
        <IconButton
          onClick={handleToggleFavorite}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: isFavorite ? '#ef4444' : '#6b7280',
            '&:hover': {
              backgroundColor: 'white',
              color: isFavorite ? '#dc2626' : '#374151'
            }
          }}
        >
          {isFavorite ? <Favorite /> : <FavoriteBorder />}
        </IconButton>

        {/* Stock Status */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <Chip
            label={`Only ${product.stock} left`}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              backgroundColor: '#f59e0b',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            fontSize: '1.1rem',
            lineHeight: 1.4,
            mb: 2,
            color: '#1f2937',
            height: '2.8rem',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {product.name}
        </Typography>

        {/* Rating and Popularity Score */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating
            value={product.rating || 4.5}
            precision={0.5}
            size="small"
            readOnly
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="#6b7280">
            ({product.reviewCount || 0})
          </Typography>
        </Box>
        
        {/* Popularity Score hidden - used internally for algorithms */}

        {/* Price */}
        <Box sx={{ mb: 3 }}>
          {product.salePrice ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: '1.25rem'
                }}
              >
                ${product.salePrice}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  textDecoration: 'line-through',
                  color: '#9ca3af'
                }}
              >
                ${product.price}
              </Typography>
            </Box>
          ) : (
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1f2937', 
                fontWeight: 700,
                fontSize: '1.25rem'
              }}
            >
              ${product.price}
            </Typography>
          )}
        </Box>

        {/* Add to Cart Button */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          sx={{
            borderRadius: '8px',
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            backgroundColor: product.stock === 0 ? '#9ca3af' : '#1f2937',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: product.stock === 0 ? '#9ca3af' : '#111827',
              boxShadow: product.stock === 0 ? 'none' : '0 4px 20px rgba(31, 41, 55, 0.3)'
            },
            '&:disabled': {
              color: 'white'
            }
          }}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default ProductCard