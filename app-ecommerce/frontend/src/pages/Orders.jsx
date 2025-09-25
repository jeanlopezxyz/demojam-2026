import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Skeleton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  ExpandMore,
  ExpandLess,
  LocalShipping,
  CheckCircle,
  Cancel,
  Pending,
  Receipt,
  Refresh
} from '@mui/icons-material'
import { format } from 'date-fns'

import { ordersAPI } from '../services/api'

const Orders = () => {
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)

  // Fetch orders
  const {
    data: orders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersAPI.getOrders(),
    select: (data) => data.data,
    staleTime: 2 * 60 * 1000,
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning'
      case 'confirmed':
      case 'processing':
        return 'info'
      case 'shipped':
        return 'primary'
      case 'delivered':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Pending />
      case 'confirmed':
      case 'processing':
        return <Receipt />
      case 'shipped':
        return <LocalShipping />
      case 'delivered':
        return <CheckCircle />
      case 'cancelled':
        return <Cancel />
      default:
        return <Receipt />
    }
  }

  const handleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const handleOrderDetails = (order) => {
    setSelectedOrder(order)
    setOrderDetailsOpen(true)
  }

  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false)
    setSelectedOrder(null)
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          Failed to load orders. Please try again.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Orders
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={refetch}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {isLoading ? (
        // Loading skeletons
        Array.from(new Array(3)).map((_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Skeleton variant="rectangular" width={80} height={24} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Skeleton variant="text" width="70%" />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Skeleton variant="text" width="50%" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      ) : orders && orders.length > 0 ? (
        orders.map((order) => (
          <Card key={order.id} sx={{ mb: 2 }}>
            <CardContent>
              {/* Order Header */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                    Order #{order.id?.slice(-8)?.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatPrice(order.total)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Typography variant="body2" color="text.secondary">
                    Items: {order.items?.length || 0}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleExpandOrder(order.id)}
                    >
                      {expandedOrder === order.id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <Button
                      size="small"
                      onClick={() => handleOrderDetails(order)}
                    >
                      Details
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* Expanded Order Items */}
              <Collapse in={expandedOrder === order.id}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Order Items
                </Typography>
                <List dense>
                  {order.items?.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={item.image}
                          alt={item.name}
                          variant="square"
                          sx={{ width: 50, height: 50 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={`Quantity: ${item.quantity} × ${formatPrice(item.price)}`}
                        sx={{ ml: 1 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {formatPrice(item.quantity * item.price)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>

                {/* Order Actions */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {order.status === 'delivered' && (
                    <Button size="small" variant="outlined">
                      Leave Review
                    </Button>
                  )}
                  {(['pending', 'confirmed'].includes(order.status)) && (
                    <Button size="small" variant="outlined" color="error">
                      Cancel Order
                    </Button>
                  )}
                  {order.trackingNumber && (
                    <Button size="small" variant="outlined">
                      Track Package
                    </Button>
                  )}
                  <Button 
                    size="small" 
                    variant="outlined"
                    component={RouterLink}
                    to={`/products?reorder=${order.id}`}
                  >
                    Reorder
                  </Button>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        ))
      ) : (
        // Empty state
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Receipt sx={{ fontSize: 100, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            You haven't placed any orders. Start shopping to see your orders here.
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/products"
          >
            Start Shopping
          </Button>
        </Box>
      )}

      {/* Order Details Dialog */}
      <Dialog 
        open={orderDetailsOpen} 
        onClose={handleCloseOrderDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details - #{selectedOrder?.id?.slice(-8)?.toUpperCase()}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Order Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Order Date
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedOrder.status)}
                    label={selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}
                    color={getStatusColor(selectedOrder.status)}
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}<br />
                    {selectedOrder.shippingAddress.address}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                  </Typography>
                </Box>
              )}

              {/* Order Items */}
              <Typography variant="subtitle2" gutterBottom>
                Items Ordered
              </Typography>
              <List>
                {selectedOrder.items?.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
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
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatPrice(item.price)} each
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {formatPrice(item.quantity * item.price)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Order Summary */}
              <Box>
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <Typography variant="body2">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {formatPrice(selectedOrder.subtotal || 0)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={8}>
                    <Typography variant="body2">Shipping:</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {formatPrice(selectedOrder.shippingCost || 0)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={8}>
                    <Typography variant="body2">Tax:</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {formatPrice(selectedOrder.tax || 0)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={8}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Total:
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(selectedOrder.total)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDetails}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Orders