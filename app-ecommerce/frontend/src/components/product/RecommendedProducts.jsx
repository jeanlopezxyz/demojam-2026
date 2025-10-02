import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Skeleton,
  Alert,
  Rating
} from '@mui/material';
import { recommendationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RecommendedProducts = ({ userId, productId, type = 'user', limit = 6 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        switch (type) {
          case 'user':
            if (!isAuthenticated || !user?.sub) {
              setError('User not authenticated');
              return;
            }
            response = await recommendationsAPI.getUserRecommendations(user.sub, limit);
            setRecommendations(response.data.recommendations || []);
            break;
            
          case 'similar':
            if (!productId) {
              setError('Product ID required for similar products');
              return;
            }
            response = await recommendationsAPI.getSimilarProducts(productId, limit);
            setRecommendations(response.data.similarProducts || []);
            break;
            
          case 'popular':
            response = await recommendationsAPI.getPopularProducts(limit);
            setRecommendations(response.data.products || []);
            break;
            
          default:
            setError('Invalid recommendation type');
            return;
        }
        
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, userId, productId, limit, isAuthenticated, user]);

  const trackBehavior = async (productId, behaviorType) => {
    if (!isAuthenticated) return;
    
    try {
      await recommendationsAPI.trackBehavior({
        productId,
        behaviorType,
        sessionId: sessionStorage.getItem('sessionId') || 'anonymous'
      });
    } catch (err) {
      console.error('Error tracking behavior:', err);
    }
  };

  const handleProductClick = (productId) => {
    trackBehavior(productId, 'CLICK');
    navigate(`/products/${productId}`);
  };

  const getTitle = () => {
    switch (type) {
      case 'user':
        return 'Recomendado para Ti';
      case 'similar':
        return 'Productos Similares';
      case 'popular':
        return 'Tendencias';
      default:
        return 'Productos Recomendados';
    }
  };

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#0f172a' }}>
          {getTitle()}
        </Typography>
        <Grid container spacing={2}>
          {Array.from(new Array(4)).map((_, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card sx={{ borderRadius: 2 }}>
                <Skeleton variant="rectangular" height={100} />
                <CardContent sx={{ p: 1 }}>
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={16} width="60%" />
                  <Skeleton variant="text" height={16} width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#0f172a', mb: 3 }}>
        {getTitle()}
      </Typography>
      
      <Grid container spacing={2}>
        {recommendations.map((item, index) => (
          <Grid item xs={6} sm={4} md={3} key={item.productId || index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                overflow: 'hidden',
                height: 'auto',
                '&:hover': { 
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 24px rgba(37, 99, 235, 0.15)',
                  borderColor: '#2563eb'
                }
              }}
              onClick={() => handleProductClick(item.productId)}
            >
              {/* Fixed aspect ratio image - NO distortion */}
              <Box sx={{ 
                width: '100%', 
                paddingTop: '65%', // Fixed 3:2 ratio
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#f8fafc'
              }}>
                <CardMedia
                  component="img"
                  image={item.images && item.images[0] ? item.images[0] : `https://via.placeholder.com/200x130/e2e8f0/64748b?text=Product`}
                  alt={item.name || `Product ${item.productId}`}
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              
              {/* Ultra compact content - exactly 3 lines */}
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, minHeight: '80px' }}>
                {/* Line 1: Product Name (single line, ellipsis) */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#0f172a',
                    fontSize: '0.8rem',
                    lineHeight: 1.2,
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    height: '1.2em'
                  }}
                >
                  {item.name || `Product ${item.productId}`}
                </Typography>
                
                {/* Line 2: Rating (compact, fixed height) */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  height: '18px'
                }}>
                  {item.rating ? (
                    <>
                      <Rating
                        value={item.rating}
                        precision={0.1}
                        size="small"
                        readOnly
                        sx={{ fontSize: '0.75rem' }}
                      />
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ ml: 0.5, fontSize: '0.65rem', fontWeight: 500 }}
                      >
                        ({item.reviewCount || 0})
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      No reviews yet
                    </Typography>
                  )}
                </Box>
                
                {/* Line 3: Price (prominent, fixed height) */}
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    lineHeight: 1,
                    height: '1em'
                  }}
                >
                  {item.price ? `$${item.price}` : 'Price not available'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default RecommendedProducts