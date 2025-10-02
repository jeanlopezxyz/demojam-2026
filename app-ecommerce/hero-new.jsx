      {/* Modern, Clean Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%)',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center',
            maxWidth: 800,
            mx: 'auto',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Premium Badge */}
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  display: 'inline-block',
                  px: 3,
                  py: 1,
                  backgroundColor: 'rgba(0, 102, 204, 0.1)',
                  borderRadius: '50px',
                  border: '1px solid rgba(0, 102, 204, 0.2)',
                  color: '#0066cc',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em'
                }}
              >
                ✨ NUEVA COLECCIÓN 2024
              </Typography>
            </Box>

            {/* Main Title */}
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                lineHeight: 1.1,
                mb: 3,
                fontFamily: '"Inter", sans-serif',
                letterSpacing: '-0.03em'
              }}
            >
              <Box component="span" sx={{ color: '#0d1117' }}>
                Camisetas Tech
              </Box>
              <br />
              <Box component="span" sx={{ 
                background: 'linear-gradient(135deg, #0066cc 0%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Profesionales
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h5"
              sx={{
                mb: 6,
                color: '#475569',
                fontWeight: 400,
                fontSize: { xs: '1.2rem', sm: '1.4rem' },
                lineHeight: 1.6,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Para desarrolladores, arquitectos, DevOps y toda la comunidad tecnológica.
              <br />
              <Box component="span" sx={{ 
                color: '#0066cc', 
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                Calidad premium para el día a día tech.
              </Box>
            </Typography>

            {/* Single Prominent CTA */}
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/products"
              endIcon={<ArrowForward />}
              sx={{
                px: 8,
                py: 3,
                fontSize: '1.2rem',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0066cc 0%, #6366f1 100%)',
                boxShadow: '0 20px 40px rgba(0, 102, 204, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minWidth: '320px',
                mb: 3,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 30px 60px rgba(0, 102, 204, 0.3)'
                }
              }}
            >
              Explorar Catálogo Tech
            </Button>

            {/* Subtle Secondary Action */}
            <Box>
              <Typography
                component={RouterLink}
                to="/products?featured=true"
                sx={{
                  color: '#6366f1',
                  fontSize: '1rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  borderBottom: '1px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderBottomColor: '#6366f1'
                  }
                }}
              >
                Ver productos destacados →
              </Typography>
            </Box>
          </Box>

          {/* Background Decorative Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              right: '5%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
              filter: 'blur(40px)',
              zIndex: 1
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '15%',
              left: '8%',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(0, 102, 204, 0.1) 100%)',
              filter: 'blur(30px)',
              zIndex: 1
            }}
          />
        </Container>
      </Box>