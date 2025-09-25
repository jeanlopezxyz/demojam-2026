import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Divider,
  Alert,
  Card,
  CardContent
} from '@mui/material'
import { 
  ShoppingCartOutlined, 
  ArrowForward, 
  ClearAll,
  LocalShipping,
  Security,
  Assignment
} from '@mui/icons-material'

import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import CartItem from '../components/cart/CartItem'

const Cart = () => {
  const { items, getCartTotal, getCartItemsCount, clearCart } = useCart()
  const { isAuthenticated } = useAuth()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const subtotal = getCartTotal()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  const itemCount = getCartItemsCount()

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <ShoppingCartOutlined sx={{ fontSize: 100, color: 'grey.400', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/products"
            endIcon={<ArrowForward />}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Shopping Cart
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Items</Typography>
            <Button
              startIcon={<ClearAll />}
              onClick={clearCart}
              color="error"
              size="small"
            >
              Clear Cart
            </Button>
          </Box>

          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}

          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/products"
              startIcon={<ArrowForward />}
            >
              Continue Shopping
            </Button>
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>

            <Box sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">{formatPrice(subtotal)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Shipping:</Typography>
                <Typography variant="body1" color={shipping === 0 ? 'success.main' : 'inherit'}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Tax:</Typography>
                <Typography variant="body1">{formatPrice(tax)}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatPrice(total)}
                </Typography>
              </Box>

              {/* Free shipping alert */}
              {shipping > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Add {formatPrice(50 - subtotal)} more for free shipping!
                </Alert>
              )}

              {/* Checkout Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                component={RouterLink}
                to={isAuthenticated ? "/checkout" : "/login"}
                sx={{ mb: 2 }}
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
              </Button>

              {!isAuthenticated && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Already have an account? <Button component={RouterLink} to="/login" size="small">Sign In</Button>
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Features */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                What you get:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalShipping sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2">
                  Free shipping on orders over $50
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Security sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2">
                  Secure payment processing
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2">
                  30-day return policy
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Accepted Payment Methods */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                We Accept
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['Visa', 'Mastercard', 'PayPal', 'Apple Pay'].map((method) => (
                  <Box
                    key={method}
                    sx={{
                      px: 2,
                      py: 1,
                      border: 1,
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}
                  >
                    {method}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Cart