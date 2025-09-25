import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
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
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  ShoppingCart,
  Person,
  Search,
  Menu as MenuIcon,
  Logout,
  AccountCircle
} from '@mui/icons-material'

import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const Header = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { getCartItemsCount } = useCart()
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleProfileMenuClose()
    navigate('/')
  }

  const handleSearch = (event) => {
    event.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const cartItemCount = getCartItemsCount()

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            mr: 4
          }}
        >
          E-Shop
        </Typography>

        {/* Navigation Links */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2, mr: 4 }}>
            <Button color="inherit" component={RouterLink} to="/">
              Home
            </Button>
            <Button color="inherit" component={RouterLink} to="/products">
              Products
            </Button>
          </Box>
        )}

        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ flexGrow: 1, maxWidth: 400, mr: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid rgba(255, 255, 255, 0.5)'
                },
                '& input': {
                  color: 'white'
                },
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            }}
          />
        </Box>

        {/* Mobile Menu */}
        {isMobile && (
          <IconButton color="inherit">
            <MenuIcon />
          </IconButton>
        )}

        {/* Cart Icon */}
        <IconButton
          color="inherit"
          component={RouterLink}
          to="/cart"
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={cartItemCount} color="error">
            <ShoppingCart />
          </Badge>
        </IconButton>

        {/* User Menu */}
        {isAuthenticated ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
            >
              <Person />
            </IconButton>
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {user?.name || user?.email}
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleProfileMenuClose()
                  navigate('/profile')
                }}
              >
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleProfileMenuClose()
                  navigate('/orders')
                }}
              >
                <ShoppingCart sx={{ mr: 1 }} />
                Orders
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              size="small"
            >
              Login
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white'
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header