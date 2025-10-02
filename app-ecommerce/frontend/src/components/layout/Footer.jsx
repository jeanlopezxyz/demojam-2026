import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  IconButton,
  Stack,
  alpha
} from '@mui/material'
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Store
} from '@mui/icons-material'

const Footer = () => {
  const socialLinks = [
    { icon: <Facebook />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <Twitter />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <Instagram />, url: 'https://instagram.com', label: 'Instagram' },
    { icon: <LinkedIn />, url: 'https://linkedin.com', label: 'LinkedIn' }
  ]

  const footerLinks = [
    { label: 'Productos', path: '/products' },
    { label: 'Categorías', path: '/categories' },
    { label: 'Acerca de', path: '/about' },
    { label: 'Contacto', path: '/contact' },
    { label: 'Política de Privacidad', path: '/privacy' },
    { label: 'Términos de Servicio', path: '/terms' }
  ]

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1f2937',
        color: 'white',
        mt: 'auto',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3
        }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Store sx={{ 
              fontSize: '1.5rem', 
              color: '#0066cc', 
              mr: 1
            }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                fontSize: '1.1rem',
                fontFamily: '"Inter", sans-serif',
                letterSpacing: '-0.5px'
              }}
            >
              <span style={{ color: '#0066cc' }}>Tech</span>
              <span style={{ color: '#6366f1' }}>Shop</span>
              <span style={{ color: '#ffffff', marginLeft: '3px' }}>Hub</span>
            </Typography>
          </Box>

          {/* Description */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#9ca3af',
              fontSize: '0.85rem',
              maxWidth: 500,
              lineHeight: 1.6
            }}
          >
            Camisetas tech premium para desarrolladores, arquitectos, DevOps y profesionales IT.
            Muestra tu stack con orgullo.
          </Typography>

          {/* Footer Links */}
          <Stack 
            direction="row" 
            spacing={{ xs: 2, md: 4 }}
            sx={{ 
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: { xs: 1, md: 2 }
            }}
          >
            {footerLinks.map((link, index) => (
              <Typography
                key={index}
                component={RouterLink}
                to={link.path}
                sx={{
                  color: '#9ca3af',
                  fontSize: '0.8rem',
                  fontWeight: 400,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: '#0066cc'
                  }
                }}
              >
                {link.label}
              </Typography>
            ))}
          </Stack>

          {/* Social Icons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {socialLinks.map((social, index) => (
              <IconButton
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#6b7280',
                  fontSize: '0.9rem',
                  '&:hover': {
                    color: '#0066cc',
                    backgroundColor: alpha('#0066cc', 0.1)
                  }
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>

          {/* Copyright */}
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#6b7280',
              fontSize: '0.75rem',
              mt: 2,
              pt: 2,
              borderTop: '1px solid #374151',
              width: '100%',
              textAlign: 'center'
            }}
          >
            © 2024 TechShopHub. Todos los derechos reservados. Hecho con ❤️ para la comunidad tech.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer