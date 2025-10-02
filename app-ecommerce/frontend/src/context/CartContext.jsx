import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        }
      }
      
      return {
        ...state,
        items: [...state.items, action.payload]
      }
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      }
    
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      }
    
    default:
      return state
  }
}

const initialState = {
  items: []
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    console.log('Loading cart from localStorage:', savedCart)
    if (savedCart && savedCart !== 'undefined') {
      try {
        const parsedCart = JSON.parse(savedCart)
        console.log('Parsed cart from localStorage:', parsedCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: parsedCart })
          console.log('Cart loaded successfully:', parsedCart.length, 'items')
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        localStorage.removeItem('cart') // Clear corrupted data
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state.items))
      console.log('Cart saved to localStorage:', state.items.length, 'items')
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [state.items])

  const addToCart = (product, quantity = 1) => {
    console.log('Adding to cart:', product);
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images || [product.image], // Support both formats
      quantity: quantity
    };
    console.log('Cart item payload:', cartItem);
    
    dispatch({
      type: 'ADD_ITEM',
      payload: cartItem
    })
    toast.success(`${product.name} añadido al carrito`)
  }

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
    toast.success('Item removed from cart')
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: productId, quantity }
    })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Cart cleared')
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId)
  }

  const getCartItem = (productId) => {
    return state.items.find(item => item.id === productId)
  }

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getCartItem
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}