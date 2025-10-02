// Professional Hero Section with Left-Right Layout
<Box
  sx={{
    backgroundColor: 'transparent',
    py: { xs: 6, md: 10 },
    position: 'relative'
  }}
>
  <Container maxWidth="xl">
    <Grid container spacing={8} alignItems="center" minHeight="65vh">
      {/* Left Side - Sales Message */}
      <Grid item xs={12} md={6}>
        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.15,
              mb: 3,
              fontFamily: '"Inter", sans-serif',
              letterSpacing: '-0.025em',
              color: '#0d1117'
            }}
          >
            Camisetas Tech para{' '}
            <Box component="span" sx={{ 
              background: 'linear-gradient(135deg, #0066cc 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 800
            }}>
              Desarrolladores
            </Box>
          </Typography>
              
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              color: '#475569',
              fontWeight: 400,
              fontSize: { xs: '1.15rem', sm: '1.3rem' },
              lineHeight: 1.6,
              maxWidth: { md: 500 }
            }}
          >
            Camisetas premium con tus tecnologías favoritas.{' '}
            <Box component="span" sx={{ 
              color: '#0066cc', 
              fontWeight: 600
            }}>
              Java, Python, Docker, AWS y más.
            </Box>
          </Typography>
              
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            justifyContent: { xs: 'center', md: 'flex-start' },
            alignItems: 'center', 
            flexWrap: 'wrap',
            mb: 4
          }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/products"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
                boxShadow: '0 8px 20px rgba(0, 102, 204, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px rgba(0, 102, 204, 0.4)'
                }
              }}
            >
              Comprar Camisetas Tech
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/products?featured=true"
              sx={{
                borderColor: '#6366f1',
                color: '#6366f1',
                borderWidth: '2px',
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderColor: '#5b21b6',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Ver Destacados
            </Button>
          </Box>

          {/* Tech Stack Badges */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5, 
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}>
            <Chip 
              label="☕ Java" 
              sx={{ 
                backgroundColor: '#ed8b00', 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.8rem'
              }} 
            />
            <Chip 
              label="🐍 Python" 
              sx={{ 
                backgroundColor: '#3776ab', 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.8rem'
              }} 
            />
            <Chip 
              label="🐳 Docker" 
              sx={{ 
                backgroundColor: '#2496ed', 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.8rem'
              }} 
            />
            <Chip 
              label="☁️ AWS" 
              sx={{ 
                backgroundColor: '#ff9900', 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.8rem'
              }} 
            />
          </Box>
        </Box>
      </Grid>

      {/* Right Side - Tech Visual */}
      <Grid item xs={12} md={6}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Large Tech Symbol with Animation */}
          <Box sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: { xs: 300, md: 400 },
            height: { xs: 300, md: 400 }
          }}>
            {/* Background Circle */}
            <Box sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
              border: '2px solid rgba(0, 102, 204, 0.2)',
            }} />
            
            {/* Main Code Symbol */}
            <Typography
              sx={{
                fontSize: { xs: '8rem', md: '12rem' },
                fontWeight: 900,
                background: 'linear-gradient(135deg, #0066cc 0%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Inter", sans-serif',
                lineHeight: 1,
                zIndex: 2,
                position: 'relative'
              }}
            >
              {'</>'}
            </Typography>

            {/* Floating Tech Icons */}
            <Box sx={{
              position: 'absolute',
              top: '10%',
              right: '15%',
              fontSize: '2rem',
              animation: 'float 3s ease-in-out infinite'
            }}>
              ☕
            </Box>
            
            <Box sx={{
              position: 'absolute',
              bottom: '20%',
              left: '10%',
              fontSize: '2rem',
              animation: 'float 3s ease-in-out infinite 1s'
            }}>
              🐍
            </Box>
            
            <Box sx={{
              position: 'absolute',
              top: '20%',
              left: '20%',
              fontSize: '2rem',
              animation: 'float 3s ease-in-out infinite 2s'
            }}>
              🐳
            </Box>
            
            <Box sx={{
              position: 'absolute',
              bottom: '15%',
              right: '20%',
              fontSize: '2rem',
              animation: 'float 3s ease-in-out infinite 0.5s'
            }}>
              ☁️
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Container>
</Box>

{/* CSS Animation for floating icons */}
<style jsx>{`
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`}</style>