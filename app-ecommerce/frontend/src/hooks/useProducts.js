import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { productsAPI } from '../services/api'

// Hook for fetching products with filters
export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsAPI.getProducts(filters),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  })
}

// Hook for fetching a single product
export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getProduct(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for infinite scroll products
export const useInfiniteProducts = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => 
      productsAPI.getProducts({ ...filters, page: pageParam }),
    select: (data) => ({
      pages: data.pages.map(page => page.data),
      pageParams: data.pageParams,
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data.currentPage < lastPage.data.totalPages) {
        return lastPage.data.currentPage + 1
      }
      return undefined
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook for product search
export const useProductSearch = (query) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => productsAPI.searchProducts(query),
    select: (data) => data.data,
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook for fetching categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsAPI.getCategories(),
    select: (data) => data.data,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for products by category
export const useProductsByCategory = (categoryId) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => productsAPI.getProductsByCategory(categoryId),
    select: (data) => data.data,
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000,
  })
}

// Hook for featured products
export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => productsAPI.getProducts({ featured: true, limit }),
    select: (data) => data.data,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}