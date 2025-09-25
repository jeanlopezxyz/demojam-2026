import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Rating
} from '@mui/material'
import {
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  Visibility
} from '@mui/icons-material'

import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart, isInCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      // Could redirect to login or show message
      return
    }
    setIsFavorite(!isFavorite)
  }

  const handleQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickView) {
      onQuickView(product)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const isProductInCart = isInCart(product.id)

  return (
    <Card
      component={RouterLink}
      to={`/products/${product.id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          '& .product-actions': {
            opacity: 1,
          }
        }
      }}
    >
      {/* Product Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Sale Badge */}
        {product.salePrice && (
          <Chip
            label={`-${Math.round(((product.price - product.salePrice) / product.price) * 100)}%`}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 'bold'
            }}
          />
        )}

        {/* Stock Status */}
        {product.stock === 0 && (
          <Chip
            label="Out of Stock"
            color="default"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white'
            }}
          />
        )}

        {/* Hover Actions */}
        <Box
          className="product-actions"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
            display: 'flex',
            gap: 1
          }}
        >
          <IconButton
            onClick={handleQuickView}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { backgroundColor: 'white' }
            }}
            size="small"
          >
            <Visibility />
          </IconButton>
          
          <IconButton
            onClick={handleToggleFavorite}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { backgroundColor: 'white' }
            }}
            size="small"
          >
            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
        </Box>
      </Box>

      {/* Product Info */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontSize: '1rem',
            fontWeight: 'medium',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.2
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {product.description}
        </Typography>

        {/* Rating */}
        {product.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating
              value={product.rating}
              precision={0.5}
              size="small"
              readOnly
            />
            <Typography variant="caption" sx={{ ml: 1 }}>
              ({product.reviewCount || 0})
            </Typography>
          </Box>
        )}

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="h6"
            component="span"
            color="primary"
            sx={{ fontWeight: 'bold' }}
          >
            {formatPrice(product.salePrice || product.price)}
          </Typography>
          {product.salePrice && (
            <Typography
              variant="body2"
              component="span"
              sx={{
                textDecoration: 'line-through',
                color: 'text.secondary'
              }}
            >
              {formatPrice(product.price)}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ pt: 0 }}>
        <Button
          fullWidth
          variant={isProductInCart ? "outlined" : "contained"}
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          size="small"
        >
          {isProductInCart ? 'In Cart' : 'Add to Cart'}
        </Button>
      </CardActions>
    </Card>
  )
}

export default ProductCard