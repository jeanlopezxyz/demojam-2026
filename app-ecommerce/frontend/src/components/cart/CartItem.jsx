import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Button,
  ButtonGroup,
  Divider
} from '@mui/material'
import { Remove, Add, Delete } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'

import { useCart } from '../../context/CartContext'

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart()

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  const handleRemove = () => {
    removeFromCart(item.id)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const subtotal = item.price * item.quantity

  return (
    <Card sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', p: 2 }}>
        {/* Product Image */}
        <CardMedia
          component={RouterLink}
          to={`/products/${item.id}`}
          sx={{
            width: 100,
            height: 100,
            borderRadius: 1,
            mr: 2,
            textDecoration: 'none'
          }}
        >
          <img
            src={item.image || '/placeholder-product.jpg'}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 4
            }}
          />
        </CardMedia>

        {/* Product Info */}
        <CardContent sx={{ flex: 1, p: 0, '&:last-child': { pb: 0 } }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to={`/products/${item.id}`}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { color: 'primary.main' },
              fontSize: '1.1rem',
              fontWeight: 'medium',
              mb: 1,
              display: 'block'
            }}
          >
            {item.name}
          </Typography>

          <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            {formatPrice(item.price)}
          </Typography>

          {/* Quantity Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Quantity:
              </Typography>
              <ButtonGroup size="small" variant="outlined">
                <Button onClick={handleDecrement} disabled={item.quantity <= 1}>
                  <Remove fontSize="small" />
                </Button>
                <Button disabled sx={{ minWidth: 50 }}>
                  {item.quantity}
                </Button>
                <Button onClick={handleIncrement}>
                  <Add fontSize="small" />
                </Button>
              </ButtonGroup>
            </Box>

            <IconButton
              onClick={handleRemove}
              color="error"
              size="small"
              sx={{ ml: 2 }}
            >
              <Delete />
            </IconButton>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Subtotal */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Subtotal:
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              {formatPrice(subtotal)}
            </Typography>
          </Box>
        </CardContent>
      </Box>
    </Card>
  )
}

export default CartItem