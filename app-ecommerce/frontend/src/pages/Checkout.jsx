import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material'
import { 
  ArrowBack, 
  ArrowForward, 
  CreditCard, 
  LocalShipping,
  Security,
  CheckCircle
} from '@mui/icons-material'

import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersAPI, paymentsAPI } from '../services/api'

const steps = ['Shipping', 'Payment', 'Review', 'Confirmation']

// Validation schemas
const shippingSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string().required('ZIP code is required'),
  country: yup.string().required('Country is required'),
})

const paymentSchema = yup.object().shape({
  cardNumber: yup.string()
    .matches(/^\d{16}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  expiryDate: yup.string()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date (MM/YY)')
    .required('Expiry date is required'),
  cvv: yup.string()
    .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
    .required('CVV is required'),
  cardholderName: yup.string().required('Cardholder name is required'),
})

const Checkout = () => {
  const navigate = useNavigate()
  const { items, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  
  const [activeStep, setActiveStep] = useState(0)
  const [shippingData, setShippingData] = useState({})
  const [paymentData, setPaymentData] = useState({})
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState(null)

  const subtotal = getCartTotal()
  const shippingCost = shippingMethod === 'express' ? 15.99 : subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  // Shipping form
  const shippingForm = useForm({
    resolver: yupResolver(shippingSchema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    }
  })

  // Payment form
  const paymentForm = useForm({
    resolver: yupResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    }
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const handleNext = async () => {
    setError('')

    if (activeStep === 0) {
      // Validate shipping form
      const isValid = await shippingForm.trigger()
      if (isValid) {
        setShippingData(shippingForm.getValues())
        setActiveStep(1)
      }
    } else if (activeStep === 1) {
      // Validate payment form
      const isValid = await paymentForm.trigger()
      if (isValid) {
        setPaymentData(paymentForm.getValues())
        setActiveStep(2)
      }
    } else if (activeStep === 2) {
      // Process order
      await processOrder()
    }
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  const processOrder = async () => {
    setLoading(true)
    try {
      // Create order
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: shippingData,
        shippingMethod: shippingMethod,
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        shippingCost: shippingCost,
        tax: tax,
        total: total
      }

      const orderResponse = await ordersAPI.createOrder(orderData)
      const order = orderResponse.data

      // Process payment
      if (paymentMethod === 'card') {
        await paymentsAPI.createPaymentIntent(total)
        // In a real app, you'd use Stripe or another payment processor here
      }

      setOrderId(order.id)
      clearCart()
      setActiveStep(3)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process order')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* Shipping Form */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Shipping Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    error={!!shippingForm.formState.errors.firstName}
                    helperText={shippingForm.formState.errors.firstName?.message}
                    {...shippingForm.register('firstName')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    error={!!shippingForm.formState.errors.lastName}
                    helperText={shippingForm.formState.errors.lastName?.message}
                    {...shippingForm.register('lastName')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!shippingForm.formState.errors.email}
                    helperText={shippingForm.formState.errors.email?.message}
                    {...shippingForm.register('email')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    error={!!shippingForm.formState.errors.phone}
                    helperText={shippingForm.formState.errors.phone?.message}
                    {...shippingForm.register('phone')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    error={!!shippingForm.formState.errors.address}
                    helperText={shippingForm.formState.errors.address?.message}
                    {...shippingForm.register('address')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    error={!!shippingForm.formState.errors.city}
                    helperText={shippingForm.formState.errors.city?.message}
                    {...shippingForm.register('city')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    error={!!shippingForm.formState.errors.state}
                    helperText={shippingForm.formState.errors.state?.message}
                    {...shippingForm.register('state')}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    error={!!shippingForm.formState.errors.zipCode}
                    helperText={shippingForm.formState.errors.zipCode?.message}
                    {...shippingForm.register('zipCode')}
                  />
                </Grid>
              </Grid>

              {/* Shipping Method */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Shipping Method
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="standard"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">Standard Shipping</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {subtotal > 50 ? 'FREE' : '$9.99'} • 5-7 business days
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="express"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">Express Shipping</Typography>
                          <Typography variant="body2" color="text.secondary">
                            $15.99 • 2-3 business days
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <OrderSummary 
                subtotal={subtotal}
                shipping={shippingCost}
                tax={tax}
                total={total}
                items={items}
              />
            </Grid>
          </Grid>
        )

      case 1:
        return (
          <Grid container spacing={3}>
            {/* Payment Form */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Payment Information
              </Typography>

              {/* Payment Method Selection */}
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="card"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreditCard />
                        Credit/Debit Card
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="paypal"
                    control={<Radio />}
                    label="PayPal"
                  />
                </RadioGroup>
              </FormControl>

              {paymentMethod === 'card' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      error={!!paymentForm.formState.errors.cardNumber}
                      helperText={paymentForm.formState.errors.cardNumber?.message}
                      {...paymentForm.register('cardNumber')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      error={!!paymentForm.formState.errors.cardholderName}
                      helperText={paymentForm.formState.errors.cardholderName?.message}
                      {...paymentForm.register('cardholderName')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      placeholder="MM/YY"
                      error={!!paymentForm.formState.errors.expiryDate}
                      helperText={paymentForm.formState.errors.expiryDate?.message}
                      {...paymentForm.register('expiryDate')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      placeholder="123"
                      error={!!paymentForm.formState.errors.cvv}
                      helperText={paymentForm.formState.errors.cvv?.message}
                      {...paymentForm.register('cvv')}
                    />
                  </Grid>
                </Grid>
              )}

              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Your payment information is encrypted and secure
                </Typography>
              </Box>
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <OrderSummary 
                subtotal={subtotal}
                shipping={shippingCost}
                tax={tax}
                total={total}
                items={items}
              />
            </Grid>
          </Grid>
        )

      case 2:
        return (
          <Grid container spacing={3}>
            {/* Review Order */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Review Your Order
              </Typography>

              {/* Shipping Info Review */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Shipping Address
                </Typography>
                <Typography variant="body2">
                  {shippingData.firstName} {shippingData.lastName}<br />
                  {shippingData.address}<br />
                  {shippingData.city}, {shippingData.state} {shippingData.zipCode}<br />
                  {shippingData.phone}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Shipping Method:</strong> {shippingMethod === 'express' ? 'Express' : 'Standard'} Shipping
                </Typography>
              </Paper>

              {/* Payment Info Review */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <CreditCard sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Payment Method
                </Typography>
                <Typography variant="body2">
                  {paymentMethod === 'card' 
                    ? `Credit Card ending in ${paymentData.cardNumber?.slice(-4) || '****'}`
                    : 'PayPal'
                  }
                </Typography>
              </Paper>

              {/* Order Items */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Order Items
                </Typography>
                <List>
                  {items.map((item) => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={item.image}
                          alt={item.name}
                          variant="square"
                          sx={{ width: 60, height: 60 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={`Quantity: ${item.quantity}`}
                        sx={{ ml: 2 }}
                      />
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <OrderSummary 
                subtotal={subtotal}
                shipping={shippingCost}
                tax={tax}
                total={total}
                items={items}
              />
            </Grid>
          </Grid>
        )

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 100, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Order Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Thank you for your purchase. Your order #{orderId} has been confirmed.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              You will receive an email confirmation shortly with tracking information.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/orders')}
              >
                View Orders
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </Button>
            </Box>
          </Box>
        )

      default:
        return null
    }
  }

  if (items.length === 0 && activeStep < 3) {
    navigate('/cart')
    return null
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>
        
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mt: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {renderStepContent()}
      </Paper>

      {/* Navigation Buttons */}
      {activeStep < 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={activeStep === 0 ? () => navigate('/cart') : handleBack}
            startIcon={<ArrowBack />}
            disabled={loading}
          >
            {activeStep === 0 ? 'Back to Cart' : 'Back'}
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={loading ? <CircularProgress size={20} /> : <ArrowForward />}
            disabled={loading}
          >
            {activeStep === 2 ? 'Place Order' : 'Continue'}
          </Button>
        </Box>
      )}
    </Container>
  )
}

// Order Summary Component
const OrderSummary = ({ subtotal, shipping, tax, total, items }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>

      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">Items ({items.length}):</Typography>
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Total:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {formatPrice(total)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default Checkout