import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Button,
  Paper
} from '@mui/material'
import { Home, ArrowBack } from '@mui/icons-material'

const NotFound = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: '6rem',
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/"
            startIcon={<Home />}
          >
            Go Home
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => window.history.back()}
            startIcon={<ArrowBack />}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default NotFound