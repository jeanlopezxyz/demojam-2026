import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  InputBase,
  alpha,
  styled,
  Modal,
  TextField,
  Link,
  Popover,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material'
import {
  ShoppingCart,
  Person,
  Search as SearchIcon,
  AccountCircle,
  Logout,
  Store,
  Google,
  GitHub,
  Close,
  Add,
  Remove,
  Delete,
  TrendingUp,
  NewReleases,
  Star,
  LocalOffer,
  AttachMoney,
  Code,
  Cloud,
  Build,
  Business,
  Memory,
  Security,
  DataObject,
  PhoneAndroid,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'

import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { productsAPI } from '../../services/api'

// Full-width Amazon-style search
const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#ffffff',
  border: '2px solid #e2e8f0',
  borderRadius: '8px',
  width: '100%',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s ease',
  '&:focus-within': {
    borderColor: '#0066cc',
    boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.1)'
  }
}));

const SearchButton = styled('button')(({ theme }) => ({
  backgroundColor: '#0066cc',
  border: 'none',
  borderRadius: '0 6px 6px 0',
  height: '40px',
  width: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#004499'
  }
}));

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, login, logout } = useAuth()
  const { getCartItemsCount, items: cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart()
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [loginAnchorEl, setLoginAnchorEl] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSuggestions(false)
    }
  }

  const handleLogout = () => {
    logout()
    handleProfileMenuClose()
  }

  const handleLoginClick = (event) => {
    setLoginAnchorEl(event.currentTarget)
  }

  const handleLoginClose = () => {
    setLoginAnchorEl(null)
    setEmail('')
    setPassword('')
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    // Use Keycloak login
    login()
    handleLoginClose()
  }

  const handleSocialLogin = (provider) => {
    // Handle social login (Google/GitLab) - integrate with Keycloak
    login()
    handleLoginClose()
  }

  const handleForgotPassword = () => {
    alert('Funcionalidad de recuperación de contraseña - integrar con Keycloak')
  }

  // Search suggestions
  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }
    
    try {
      const response = await productsAPI.getProducts({ search: query, limit: 3 })
      const suggestions = response.data?.data || []
      setSearchSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } catch (error) {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.trim().length >= 2) {
      setTimeout(() => fetchSuggestions(value), 300)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (product) => {
    setSearchQuery('')
    setShowSuggestions(false)
    navigate(`/products/${product.id}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSearchQuery('')
    }
  }

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb'
      }}
    >
      {/* Full Width Toolbar - No Container Limitation */}
      <Toolbar 
        sx={{ 
          minHeight: { xs: 56, md: 64 },
          px: { xs: 2, md: 3 },
          display: 'grid',
          gridTemplateColumns: { 
            xs: 'auto 1fr auto auto',
            md: 'auto 1fr auto auto'
          },
          gap: { xs: 2, md: 4 },
          alignItems: 'center',
          width: '100%'
        }}
      >
        {/* 1. Logo */}
        <Box 
          component={RouterLink}
          to="/"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            '&:hover': { transform: 'scale(1.02)' },
            transition: 'transform 0.2s ease'
          }}
        >
          <Store sx={{ 
            fontSize: { xs: '1.6rem', md: '1.8rem' }, 
            color: '#0066cc', 
            mr: 1
          }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontFamily: '"Poppins", "Segoe UI", sans-serif',
              letterSpacing: '-0.02em'
            }}
          >
            <span style={{ color: '#0066cc' }}>Tech</span>
            <span style={{ color: '#6366f1' }}>Shop</span>
            <span style={{ color: '#24292f', marginLeft: '3px' }}>Hub</span>
          </Typography>
        </Box>
        
        {/* 2. Full-Width Search Bar (Amazon Style) */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ 
            position: 'relative',
            width: '100%'
          }}
        >
          <SearchContainer>
            <InputBase
              placeholder="Busca camisetas tech: Java, Python, Docker, AWS, React..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              sx={{
                flex: 1,
                px: 2.5,
                fontSize: '1rem',
                fontFamily: '"Poppins", "Segoe UI", "Roboto", "-apple-system", sans-serif',
                '& input': {
                  color: '#0d1117',
                  fontWeight: 400,
                  fontSize: '0.95rem',
                  fontFamily: '"Poppins", "Segoe UI", "Roboto", "-apple-system", sans-serif',
                  letterSpacing: '0.01em',
                  '&::placeholder': {
                    color: '#6b7280',
                    opacity: 1,
                    fontWeight: 400,
                    fontSize: '0.95rem',
                    fontFamily: '"Poppins", sans-serif'
                  }
                }
              }}
            />
            <SearchButton type="submit">
              <SearchIcon sx={{ fontSize: '1.3rem', color: 'white' }} />
            </SearchButton>
          </SearchContainer>
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                zIndex: 1000,
                mt: 1
              }}
            >
              {searchSuggestions.map((product, index) => (
                <Box
                  key={product.id}
                  onClick={() => handleSuggestionClick(product)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    cursor: 'pointer',
                    borderBottom: index < searchSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                    '&:hover': { backgroundColor: '#f8fafc' }
                  }}
                >
                  <Box
                    component="img"
                    src={product.images?.[0]}
                    alt={product.name}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '6px',
                      objectFit: 'cover',
                      mr: 2
                    }}
                  />
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: '"Poppins", "Segoe UI", sans-serif',
                        fontWeight: 500, 
                        color: '#1f2937',
                        fontSize: '0.9rem'
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: '"Poppins", sans-serif',
                        color: '#6b7280',
                        fontSize: '0.8rem',
                        fontWeight: 400
                      }}
                    >
                      ${product.price}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* 3. User Block (Login/Profile) */}
        {isAuthenticated ? (
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
            title="Perfil de Usuario"
          >
            <AccountCircle sx={{ fontSize: '1.5rem', color: '#475569' }} />
            <Typography
              sx={{
                color: '#0d1117',
                fontWeight: 500,
                fontSize: '0.85rem',
                fontFamily: '"Inter", sans-serif',
                display: { xs: 'none', sm: 'block' },
                ml: 0.5
              }}
            >
              {user?.given_name || user?.name?.split(' ')[0] || 'Usuario'}
            </Typography>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid #e5e7eb'
                }
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <Person sx={{ mr: 1 }} />
                Perfil
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                <Logout sx={{ mr: 1 }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <IconButton
            onClick={handleLoginClick}
            sx={{
              color: '#475569',
              '&:hover': {
                color: '#0066cc',
                backgroundColor: alpha('#0066cc', 0.08)
              }
            }}
            title="Iniciar Sesión"
          >
            <Person sx={{ fontSize: '1.5rem' }} />
          </IconButton>
        )}

        {/* 4. Shopping Cart (Always at the end) */}
        <IconButton
          onClick={() => setCartOpen(true)}
          sx={{
            color: '#475569',
            '&:hover': {
              color: '#0066cc',
              backgroundColor: alpha('#0066cc', 0.08)
            }
          }}
          title="Carrito de Compras"
        >
          <Badge 
            badgeContent={getCartItemsCount()} 
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#0066cc',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem'
              }
            }}
          >
            <ShoppingCart sx={{ fontSize: '1.5rem' }} />
          </Badge>
        </IconButton>
      </Toolbar>

      {/* Compact Login Popup */}
      <Popover
        open={Boolean(loginAnchorEl)}
        anchorEl={loginAnchorEl}
        onClose={handleLoginClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
            mt: 1
          }
        }}
      >
        <Box
          sx={{
            p: 3,
            width: 320,
            maxWidth: '90vw'
          }}
        >
          {/* Compact Header */}
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: '#0d1117',
              textAlign: 'center',
              fontFamily: '"Inter", sans-serif'
            }}
          >
            Iniciar Sesión
          </Typography>


          {/* Compact Login Form */}
          <Box component="form" onSubmit={handleLoginSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
              InputProps={{
                sx: { fontFamily: '"Inter", sans-serif', fontSize: '0.9rem' }
              }}
            />
            
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
              InputProps={{
                sx: { fontFamily: '"Inter", sans-serif', fontSize: '0.9rem' }
              }}
            />

            <Box sx={{ mb: 3, textAlign: 'right' }}>
              <Link
                component="button"
                type="button"
                onClick={handleForgotPassword}
                sx={{
                  color: '#0066cc',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                py: 1.2,
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                fontFamily: '"Inter", sans-serif',
                mb: 2
              }}
            >
              Ingresar
            </Button>
          </Box>

          {/* Social Login Icons - Below main form */}
          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: '#6b7280', px: 2, fontSize: '0.75rem' }}>
              o también puedes
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {/* Google Login */}
            <IconButton
              onClick={() => handleSocialLogin('google')}
              sx={{
                width: 48,
                height: 48,
                border: '2px solid #db4437',
                borderRadius: '8px',
                color: '#db4437',
                '&:hover': {
                  backgroundColor: alpha('#db4437', 0.08),
                  borderColor: '#c23321'
                }
              }}
              title="Continuar con Google"
            >
              <Google sx={{ fontSize: '1.3rem' }} />
            </IconButton>

            {/* GitLab Login */}
            <IconButton
              onClick={() => handleSocialLogin('gitlab')}
              sx={{
                width: 48,
                height: 48,
                border: '2px solid #fc6d26',
                borderRadius: '8px',
                color: '#fc6d26',
                '&:hover': {
                  backgroundColor: alpha('#fc6d26', 0.08),
                  borderColor: '#e24329'
                }
              }}
              title="Continuar con GitLab"
            >
              <GitHub sx={{ fontSize: '1.3rem' }} />
            </IconButton>

            {/* Keycloak Login */}
            <IconButton
              onClick={() => handleSocialLogin('keycloak')}
              sx={{
                width: 48,
                height: 48,
                border: '2px solid #6366f1',
                borderRadius: '8px',
                color: '#6366f1',
                '&:hover': {
                  backgroundColor: alpha('#6366f1', 0.08),
                  borderColor: '#5b21b6'
                }
              }}
              title="Ingresar con Keycloak"
            >
              <AccountCircle sx={{ fontSize: '1.3rem' }} />
            </IconButton>
          </Box>
        </Box>
      </Popover>

      {/* Shopping Cart Sidebar */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            backgroundColor: '#f8fafc'
          }
        }}
        ModalProps={{
          sx: {
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Cart Header */}
          <Box sx={{ 
            p: 3, 
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0d1117' }}>
              Carrito de Compras ({getCartItemsCount()})
            </Typography>
            <IconButton 
              onClick={() => setCartOpen(false)}
              sx={{ color: '#6b7280' }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Cart Items */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {(() => {
              console.log('Cart items in sidebar:', cartItems);
              console.log('Cart items count:', getCartItemsCount());
              return null;
            })()}
            {cartItems && cartItems.length > 0 ? (
              <List sx={{ p: 0 }}>
                {cartItems.map((item, index) => (
                  <ListItem 
                    key={`${item.id}-${index}`}
                    sx={{ 
                      backgroundColor: 'white',
                      mb: 1,
                      mx: 2,
                      mt: index === 0 ? 2 : 0,
                      borderRadius: 2,
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={item.images?.[0]} 
                        alt={item.name}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                    </ListItemAvatar>
                    <Box sx={{ flex: 1, ml: 2 }}>
                      {/* Product Name */}
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500, 
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {item.name}
                      </Typography>
                      
                      {/* Price and Controls in Same Row */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mt: 1
                      }}>
                        {/* Price */}
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                          ${item.price}
                        </Typography>
                        
                        {/* Quantity Controls + Delete */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            sx={{ 
                              width: 28, 
                              height: 28,
                              border: '1px solid #e5e7eb',
                              '&:hover': { borderColor: '#0066cc', color: '#0066cc' }
                            }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              minWidth: 32, 
                              textAlign: 'center',
                              fontWeight: 500,
                              fontSize: '0.9rem'
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          
                          <IconButton 
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            sx={{ 
                              width: 28, 
                              height: 28,
                              border: '1px solid #e5e7eb',
                              '&:hover': { borderColor: '#0066cc', color: '#0066cc' }
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                          
                          <IconButton 
                            size="small" 
                            onClick={() => removeFromCart(item.id)}
                            sx={{ 
                              ml: 1, 
                              width: 28,
                              height: 28,
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              '&:hover': { 
                                backgroundColor: alpha('#ef4444', 0.08),
                                borderColor: '#ef4444'
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                height: '50%',
                textAlign: 'center',
                p: 4
              }}>
                <ShoppingCart sx={{ fontSize: '4rem', color: '#d1d5db', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                  Tu carrito está vacío
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Agrega algunas camisetas tech para comenzar
                </Typography>
              </Box>
            )}
          </Box>

          {/* Cart Footer */}
          {cartItems && cartItems.length > 0 && (
            <Box sx={{ 
              p: 3, 
              backgroundColor: 'white',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0066cc' }}>
                  ${getCartTotal ? getCartTotal().toFixed(2) : '0.00'}
                </Typography>
              </Box>
              
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={RouterLink}
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  sx={{
                    py: 1.5,
                    borderColor: '#0066cc',
                    color: '#0066cc',
                    '&:hover': {
                      backgroundColor: alpha('#0066cc', 0.08)
                    }
                  }}
                >
                  Ver Carrito Completo
                </Button>
                
                <Button
                  variant="contained"
                  fullWidth
                  component={RouterLink}
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #004499 0%, #003366 100%)'
                    }
                  }}
                >
                  Proceder al Pago
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Drawer>

    </AppBar>
  )
}

// Tech Categories with Subcategories (Spanish + Compact)
const techCategories = [
  {
    title: 'Lenguajes de Programación',
    icon: <Code />,
    color: '#ed8b00',
    subcategories: [
      'Java & JVM',
      'Python & Data Science', 
      'JavaScript & TypeScript',
      'C# & .NET',
      'Go & Rust'
    ]
  },
  {
    title: 'Plataformas Cloud',
    icon: <Cloud />,
    color: '#ff9900',
    subcategories: [
      'Amazon AWS',
      'Google Cloud',
      'Microsoft Azure',
      'Red Hat OpenShift',
      'Digital Ocean'
    ]
  },
  {
    title: 'Herramientas DevOps',
    icon: <Build />,
    color: '#2496ed',
    subcategories: [
      'Docker & Kubernetes',
      'Jenkins & CI/CD',
      'Terraform & Infraestructura',
      'Ansible & Configuración',
      'Monitoreo & Observabilidad'
    ]
  },
  {
    title: 'Cloud Native',
    icon: <Memory />,
    color: '#22c55e',
    subcategories: [
      'Microservicios',
      'Serverless & Functions',
      'API Gateway',
      'Arquitectura Dirigida por Eventos',
      'Orquestación de Contenedores'
    ]
  },
  {
    title: 'Seguridad & Compliance',
    icon: <Security />,
    color: '#ef4444',
    subcategories: [
      'Ciberseguridad & InfoSec',
      'DevSecOps',
      'OAuth & Gestión de Identidad',
      'Encriptación & PKI',
      'Compliance & Gobernanza'
    ]
  },
  {
    title: 'Datos & Analytics',
    icon: <DataObject />,
    color: '#8b5cf6',
    subcategories: [
      'Big Data & Hadoop',
      'Machine Learning & IA',
      'Ingeniería de Datos',
      'Business Intelligence',
      'Apache Spark & Kafka'
    ]
  },
  {
    title: 'Mobile & Frontend',
    icon: <PhoneAndroid />,
    color: '#06b6d4',
    subcategories: [
      'React & Vue.js',
      'React Native & Flutter',
      'iOS & Swift',
      'Android & Kotlin',
      'Progressive Web Apps'
    ]
  },
  {
    title: 'Enterprise & Arquitectura',
    icon: <Business />,
    color: '#6366f1',
    subcategories: [
      'Arquitectura de Soluciones',
      'Integración Enterprise',
      'Diseño de Sistemas',
      'Liderazgo Técnico',
      'Gestión de Proyectos'
    ]
  }
]

// Modern & Attractive Category Component
const CategoryItem = ({ category, onNavigate }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {/* Category Header - Modern & Eye-catching */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{ 
          py: 1.8,
          px: 3,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&:hover': {
            backgroundColor: '#f8fafc',
            '& .category-icon': {
              transform: 'scale(1.1)',
              filter: 'brightness(1.1)'
            },
            '& .category-title': {
              color: category.color
            },
            '&::before': {
              opacity: 1,
              transform: 'scaleX(1)'
            }
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            backgroundColor: category.color,
            opacity: 0,
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Professional Icon with Background */}
          <Box 
            className="category-icon"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}25 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {React.cloneElement(category.icon, { 
              sx: { 
                fontSize: '1.3rem', 
                color: category.color,
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              } 
            })}
          </Box>
          
          {/* Modern Typography */}
          <Typography 
            className="category-title"
            sx={{ 
              fontFamily: '"Poppins", "Segoe UI", "Roboto", "-apple-system", sans-serif',
              fontWeight: 500, 
              color: '#1a1a1a',
              fontSize: '0.95rem',
              letterSpacing: '0.01em',
              flex: 1,
              transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {category.title}
          </Typography>
          
          {/* Sleek expand indicator */}
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: `${category.color}20`
              }
            }}
          >
            {expanded ? 
              <ExpandLess sx={{ color: '#64748b', fontSize: '1.1rem' }} /> : 
              <ExpandMore sx={{ color: '#64748b', fontSize: '1.1rem' }} />
            }
          </Box>
        </Box>
      </Box>

      {/* Subcategories - Modern List */}
      {expanded && (
        <Box sx={{ 
          backgroundColor: '#fafbfc',
          borderLeft: `2px solid ${category.color}10`,
          ml: 1,
          mr: 1,
          borderRadius: '0 0 8px 8px'
        }}>
          {category.subcategories.map((sub, index) => (
            <Box
              key={index}
              onClick={() => onNavigate(`/products?search=${encodeURIComponent(sub)}`)}
              sx={{ 
                py: 1.2,
                px: 3,
                pl: 5,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  '& .subcategory-text': {
                    color: category.color,
                    transform: 'translateX(4px)'
                  },
                  '&::before': {
                    opacity: 1
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: category.color,
                  opacity: 0,
                  transition: 'opacity 0.15s ease'
                }
              }}
            >
              <Typography 
                className="subcategory-text"
                sx={{ 
                  fontFamily: '"Poppins", "Segoe UI", "Roboto", "-apple-system", sans-serif',
                  fontWeight: 400, 
                  color: '#525252',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  letterSpacing: '0.01em',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {sub}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </>
  )
}

// Secondary Navigation Bar Component
export const SecondaryNav = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await productsAPI.getCategories()
      return response
    },
    select: (response) => {
      const categories = response.data?.data
      return Array.isArray(categories) ? categories : []
    },
    staleTime: 10 * 60 * 1000
  })

  const navItems = [
    {
      label: 'Todas las Categorías',
      icon: <Store />,
      action: () => {
        console.log('Opening categories sidebar...')
        setCategoriesOpen(true)
      }, // Open sidebar instead of navigate
      color: '#0066cc'
    },
    {
      label: 'Lo Más Nuevo',
      icon: <NewReleases />,
      path: '/products?sortBy=createdAt&sortOrder=desc',
      color: '#22c55e'
    },
    {
      label: 'Más Vendidos',
      icon: <TrendingUp />,
      path: '/products?sortBy=popularity&sortOrder=desc',
      color: '#f59e0b'
    },
    {
      label: 'Ofertas',
      icon: <LocalOffer />,
      path: '/products?featured=true',
      color: '#ef4444'
    }
  ]

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        py: 1,
        position: 'sticky',
        top: { xs: 56, md: 64 },
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <Box sx={{ 
        px: { xs: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 1, md: 2 },
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: 4
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#d1d5db',
          borderRadius: 2
        }
      }}>
        {navItems.map((item, index) => (
          <Button
            key={index}
            startIcon={React.cloneElement(item.icon, { sx: { fontSize: '1.1rem' } })}
            onClick={() => item.action ? item.action() : navigate(item.path)}
            sx={{
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 500,
              textTransform: 'none',
              px: { xs: 1.5, md: 2 },
              py: 1,
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: alpha(item.color, 0.08),
                color: item.color,
                '& .MuiSvgIcon-root': {
                  color: item.color
                }
              },
              transition: 'all 0.2s ease'
            }}
          >
            {item.label}
          </Button>
        ))}

        {/* Dynamic Categories */}
        {categories && categories.length > 0 && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 20, alignSelf: 'center' }} />
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => navigate(`/products?category=${category.id}`)}
                sx={{
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: { xs: 1.5, md: 2 },
                  py: 1,
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: alpha(category.color || '#0066cc', 0.08),
                    color: category.color || '#0066cc'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {category.name}
              </Button>
            ))}
          </>
        )}
      </Box>

      {/* Categories Sidebar - Modern & Attractive */}
      <Drawer
        anchor="left"
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '85%', sm: 360 },
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            borderRadius: { xs: 0, sm: '0 16px 16px 0' }
          }
        }}
        ModalProps={{
          sx: {
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)'
            }
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Amazon-style Header with User Greeting */}
          <Box sx={{ 
            py: 2.5,
            px: 3,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography 
                sx={{ 
                  fontFamily: '"Poppins", "Segoe UI", "Roboto", "-apple-system", sans-serif',
                  fontWeight: 300, 
                  color: '#64748b',
                  fontSize: '0.85rem',
                  mb: 0.2,
                  letterSpacing: '0.02em'
                }}
              >
                {isAuthenticated ? 'Buen día,' : 'Hola,'}
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: '"Poppins", "Segoe UI", "Roboto", "-apple-system", sans-serif',
                  fontWeight: 500, 
                  color: '#1a1a1a',
                  fontSize: '1.05rem',
                  letterSpacing: '-0.005em'
                }}
              >
                {isAuthenticated 
                  ? (user?.given_name || user?.name?.split(' ')[0] || 'Usuario')
                  : 'Identifícate'
                }
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setCategoriesOpen(false)}
              sx={{ 
                color: '#64748b',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  color: '#374151'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Close sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Box>

          {/* Categories List - Modern Flow */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: '#ffffff',
            py: 1
          }}>
            {techCategories.map((category, index) => (
              <CategoryItem 
                key={index} 
                category={category} 
                onNavigate={(path) => {
                  navigate(path)
                  setCategoriesOpen(false)
                }}
              />
            ))}
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}

export default Header