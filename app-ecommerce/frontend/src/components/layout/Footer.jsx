import { Box, Typography, Container, Grid, Link, IconButton } from '@mui/material'
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material'

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              E-Shop
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your one-stop destination for quality products at great prices.
              Fast shipping, easy returns, and excellent customer service.
            </Typography>
            <Box>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/products" color="inherit" underline="hover">
                All Products
              </Link>
              <Link href="/products?category=electronics" color="inherit" underline="hover">
                Electronics
              </Link>
              <Link href="/products?category=clothing" color="inherit" underline="hover">
                Clothing
              </Link>
              <Link href="/products?category=home" color="inherit" underline="hover">
                Home & Garden
              </Link>
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Customer Service
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover">
                Contact Us
              </Link>
              <Link href="#" color="inherit" underline="hover">
                Shipping Info
              </Link>
              <Link href="#" color="inherit" underline="hover">
                Returns & Exchanges
              </Link>
              <Link href="#" color="inherit" underline="hover">
                Size Guide
              </Link>
              <Link href="#" color="inherit" underline="hover">
                FAQ
              </Link>
            </Box>
          </Grid>

          {/* About */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover">
                Our Story
              </Link>
              <Link href="#" color="inherit" underline="hover">
                Careers
              </Link>
              <Link href="#" color="inherit" underline="hover">
                Privacy Policy
              </Link>
              <Link href="#" color="inherit" underline="hover">
                Terms of Service
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            mt: 4,
            pt: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} E-Shop. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer