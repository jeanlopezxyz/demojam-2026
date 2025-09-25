import { useState, useEffect } from 'react'

// Custom hook for managing localStorage with React state
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Set value in state and localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Remove value from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}

// Hook for managing recent searches
export const useRecentSearches = (maxItems = 5) => {
  const [searches, setSearches, removeSearches] = useLocalStorage('recentSearches', [])

  const addSearch = (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) return

    setSearches((prev) => {
      const trimmedTerm = searchTerm.trim()
      // Remove if already exists
      const filtered = prev.filter(term => term.toLowerCase() !== trimmedTerm.toLowerCase())
      // Add to beginning and limit to maxItems
      return [trimmedTerm, ...filtered].slice(0, maxItems)
    })
  }

  const clearSearches = () => {
    removeSearches()
  }

  return {
    searches,
    addSearch,
    clearSearches
  }
}

// Hook for managing recently viewed products
export const useRecentlyViewed = (maxItems = 10) => {
  const [products, setProducts, removeProducts] = useLocalStorage('recentlyViewed', [])

  const addProduct = (product) => {
    if (!product || !product.id) return

    setProducts((prev) => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== product.id)
      // Add to beginning and limit to maxItems
      return [product, ...filtered].slice(0, maxItems)
    })
  }

  const clearProducts = () => {
    removeProducts()
  }

  return {
    products,
    addProduct,
    clearProducts
  }
}

// Hook for managing user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'en',
    currency: 'USD',
    emailNotifications: true,
    pushNotifications: false,
  })

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updatePreferences = (newPreferences) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }))
  }

  return {
    preferences,
    updatePreference,
    updatePreferences
  }
}