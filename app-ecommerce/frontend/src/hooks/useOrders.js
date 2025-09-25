import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersAPI } from '../services/api'
import toast from 'react-hot-toast'

// Hook for fetching user orders
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersAPI.getOrders(),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for fetching a single order
export const useOrder = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.getOrder(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

// Hook for creating an order
export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderData) => ordersAPI.createOrder(orderData),
    onSuccess: (data) => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries(['orders'])
      toast.success('Order created successfully!')
      return data.data
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create order'
      toast.error(message)
      throw error
    },
  })
}

// Hook for updating order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => ordersAPI.updateOrderStatus(id, status),
    onSuccess: (data, variables) => {
      // Update the specific order in cache
      queryClient.setQueryData(['order', variables.id], (oldData) => ({
        ...oldData,
        data: { ...oldData.data, status: variables.status }
      }))
      
      // Invalidate orders list
      queryClient.invalidateQueries(['orders'])
      
      toast.success('Order status updated!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update order status'
      toast.error(message)
    },
  })
}

// Hook for cancelling an order
export const useCancelOrder = () => {
  const updateOrderStatus = useUpdateOrderStatus()

  return {
    ...updateOrderStatus,
    mutate: (orderId) => updateOrderStatus.mutate({ id: orderId, status: 'cancelled' }),
    mutateAsync: (orderId) => updateOrderStatus.mutateAsync({ id: orderId, status: 'cancelled' }),
  }
}