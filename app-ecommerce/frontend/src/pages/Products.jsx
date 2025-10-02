import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Skeleton,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Chip,
  Pagination,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Paper,
  Stack,
  Divider,
  Fab
} from '@mui/material'
import { 
  FilterList, 
  Clear, 
  ViewModule, 
  ViewList,
  Sort,
  Close,
  TuneOutlined
} from '@mui/icons-material'
import debounce from 'lodash.debounce'

import { productsAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import RecommendedProducts from '../components/product/RecommendedProducts'
import CategorySidebar from '../components/filters/CategorySidebar'
import { mockCategories, calculateProductCounts } from '../data/mockCategories'

const Products = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Enhanced filters state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sortBy') || 'name',
    sortOrder: searchParams.get('sortOrder') || 'asc',
    minPrice: parseInt(searchParams.get('minPrice')) || 0,
    maxPrice: parseInt(searchParams.get('maxPrice')) || 1000,
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  })
  
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // grid or list

  // Fetch products with enhanced error handling
  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      console.log('Fetching products with filters:', filters);
      const response = await productsAPI.getProducts(filters);
      console.log('Products response:', response);
      return response;
    },
    select: (response) => {
      console.log('Products response received:', response);
      console.log('Products response.data:', response.data);
      const result = response.data;
      console.log('Extracted products result:', result);
      return result;
    },
    staleTime: 2 * 60 * 1000,
    retry: 3,
    onError: (error) => {
      console.error('Products fetch error:', error);
    }
  })

  // Fetch categories with improved handling - fallback to mock data
  const {
    data: categories,
    isLoading: loadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        console.log('Fetching categories...');
        const response = await productsAPI.getCategories();
        console.log('Categories response:', response);
        return response;
      } catch (error) {
        console.log('Using mock categories due to API error');
        return { data: { data: mockCategories } };
      }
    },
    select: (response) => {
      console.log('Categories response received:', response);
      const categoriesData = response.data?.data;
      // Use mock categories if API returns empty or invalid data
      const finalCategories = (Array.isArray(categoriesData) && categoriesData.length > 0) 
        ? categoriesData 
        : mockCategories;
      console.log('Using categories:', finalCategories);
      return finalCategories;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    onError: (error) => {
      console.error('Categories fetch error, using mock data:', error);
    }
  })

  // Debounced search function
  const debouncedSearch = debounce((searchTerm) => {
    updateFilters({ search: searchTerm, page: 1 })
  }, 500)

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        params.set(key, value.toString())
      }
    })
    setSearchParams(params)
  }

  const handlePageChange = (event, value) => {
    updateFilters({ page: value })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue)
  }

  const handlePriceCommit = (event, newValue) => {
    updateFilters({
      minPrice: newValue[0],
      maxPrice: newValue[1],
      page: 1
    })
  }

  const clearFilters = () => {
    setPriceRange([0, 1000])
    updateFilters({
      search: '',
      category: '',
      sortBy: 'name',
      sortOrder: 'asc',
      minPrice: 0,
      maxPrice: 1000,
      page: 1
    })
  }

  // Calculate product counts per category - use mock counts if no real data
  const productCounts = {}
  if (Array.isArray(categories)) {
    // Use mock product counts if available
    const mockCounts = calculateProductCounts(categories)
    
    if (productsData?.data) {
      // Try to use real product counts
      categories.forEach(category => {
        const count = productsData.data.filter(
          product => product.categoryId === category.id
        ).length
        productCounts[category.id] = count || mockCounts[category.id] || 0
        
        // Count subcategories if they exist
        if (category.subcategories) {
          category.subcategories.forEach(sub => {
            const subCount = productsData.data.filter(
              product => product.categoryId === sub.id
            ).length
            productCounts[sub.id] = subCount || sub.productCount || 0
          })
        }
      })
    } else {
      // Use mock counts if no product data
      Object.assign(productCounts, mockCounts)
    }
  }

  // Enhanced filters component for price and sorting
  const FiltersContent = () => (
    <Stack spacing={3}>
      {/* Price Range */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c', fontSize: '1rem' }}>
            Precio
          </Typography>
          {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
            <Button
              size="small"
              onClick={() => {
                setPriceRange([0, 1000])
                updateFilters({ minPrice: 0, maxPrice: 1000, page: 1 })
              }}
              sx={{ 
                color: '#64748b',
                fontSize: '0.75rem',
                '&:hover': { color: '#1976d2' }
              }}
            >
              Restablecer
            </Button>
          )}
        </Box>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          onChangeCommitted={handlePriceCommit}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          valueLabelFormat={(value) => `$${value}`}
          sx={{ 
            color: '#1976d2',
            '& .MuiSlider-thumb': {
              boxShadow: '0 2px 6px rgba(25, 118, 210, 0.3)'
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">$0</Typography>
          <Typography variant="caption" color="text.secondary">$1000</Typography>
        </Box>
      </Paper>

      {/* Sort Options */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a202c', fontSize: '1rem', mb: 2 }}>
          Ordenamiento
        </Typography>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Ordenar Por</InputLabel>
            <Select
              value={filters.sortBy}
              label="Ordenar Por"
              onChange={(e) => updateFilters({ sortBy: e.target.value, page: 1 })}
            >
              <MenuItem value="name">Nombre</MenuItem>
              <MenuItem value="price">Precio</MenuItem>
              <MenuItem value="rating">Calificación</MenuItem>
              <MenuItem value="popularity">Popularidad</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Orden</InputLabel>
            <Select
              value={filters.sortOrder}
              label="Orden"
              onChange={(e) => updateFilters({ sortOrder: e.target.value, page: 1 })}
            >
              <MenuItem value="asc">Ascendente</MenuItem>
              <MenuItem value="desc">Descendente</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>
    </Stack>
  )

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Error loading products: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#1a202c',
              mb: 2,
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            Colección de Camisetas Tech
          </Typography>
          
          {/* Breadcrumb and Results */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              {productsData && (
                <Typography variant="body1" color="text.secondary">
                  Mostrando {productsData.data?.length || 0} de {productsData.pagination?.total || 0} productos
                </Typography>
              )}
            </Box>
            
            {/* View Toggle and Mobile Filter */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <Box sx={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('grid')}
                    sx={{ 
                      borderRadius: 0,
                      color: viewMode === 'grid' ? '#1976d2' : '#64748b',
                      backgroundColor: viewMode === 'grid' ? '#f1f5f9' : 'transparent'
                    }}
                  >
                    <ViewModule />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('list')}
                    sx={{ 
                      borderRadius: 0,
                      color: viewMode === 'list' ? '#1976d2' : '#64748b',
                      backgroundColor: viewMode === 'list' ? '#f1f5f9' : 'transparent'
                    }}
                  >
                    <ViewList />
                  </IconButton>
                </Box>
              )}
              
              {isMobile && (
                <Fab
                  size="small"
                  onClick={() => setMobileFiltersOpen(true)}
                  sx={{ 
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '&:hover': { backgroundColor: '#1565c0' }
                  }}
                >
                  <TuneOutlined />
                </Fab>
              )}
            </Box>
          </Box>

          {/* Active Filters */}
          {(filters.search || filters.category || filters.minPrice > 0 || filters.maxPrice < 1000) && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Filtros activos:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {filters.search && (
                  <Chip
                    label={`Búsqueda: "${filters.search}"`}
                    onDelete={() => updateFilters({ search: '', page: 1 })}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filters.category && (
                  <Chip
                    label={`Categoría: ${Array.isArray(categories) ? categories.find(c => c.id === filters.category)?.name || filters.category : filters.category}`}
                    onDelete={() => updateFilters({ category: '', page: 1 })}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
                  <Chip
                    label={`Precio: $${filters.minPrice} - $${filters.maxPrice}`}
                    onDelete={() => updateFilters({ minPrice: 0, maxPrice: 1000, page: 1 })}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>

        <Grid container spacing={4}>
          {/* Sidebar Filters - Desktop */}
          {!isMobile && (
            <Grid item xs={12} md={3}>
              <Box sx={{ position: 'sticky', top: 24 }}>
                <Stack spacing={3}>
                  {/* Category Sidebar */}
                  <CategorySidebar
                    categories={categories || []}
                    selectedCategory={filters.category}
                    onCategorySelect={(categoryId) => updateFilters({ category: categoryId, page: 1 })}
                    isLoading={loadingCategories}
                    productCounts={productCounts}
                    onClearFilters={clearFilters}
                  />
                  
                  {/* Price and Sort Filters */}
                  <FiltersContent />
                </Stack>
              </Box>
            </Grid>
          )}

          {/* Products Grid */}
          <Grid item xs={12} md={isMobile ? 12 : 9}>
            {/* Recommendations Section */}
            <Box sx={{ mb: 4 }}>
              <RecommendedProducts type="popular" limit={4} />
            </Box>

            {/* Products */}
            {isLoading ? (
              <Grid container spacing={3}>
                {Array.from(new Array(8)).map((_, index) => (
                  <Grid item xs={12} sm={6} lg={viewMode === 'grid' ? 4 : 12} key={index}>
                    <Card sx={{ height: viewMode === 'grid' ? 400 : 200 }}>
                      <Skeleton variant="rectangular" height={viewMode === 'grid' ? 250 : 120} />
                      <CardContent>
                        <Skeleton variant="text" height={24} />
                        <Skeleton variant="text" height={20} width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : productsData?.data && productsData.data.length > 0 ? (
              <>
                <Grid container spacing={viewMode === 'grid' ? 3 : 2}>
                  {productsData.data.map((product) => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={viewMode === 'grid' ? 6 : 12} 
                      lg={viewMode === 'grid' ? 4 : 12} 
                      key={product.id}
                    >
                      <ProductCard 
                        product={product} 
                        layout={viewMode}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {productsData?.pagination && Math.ceil(productsData.pagination.total / productsData.pagination.limit) > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <Pagination
                      count={Math.ceil(productsData.pagination.total / productsData.pagination.limit)}
                      page={filters.page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontWeight: 500
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Paper sx={{ p: 6, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#64748b' }}>
                  No se encontraron productos
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Intenta ajustar tus filtros o términos de búsqueda
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={clearFilters}
                  startIcon={<Clear />}
                >
                  Limpiar Filtros
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="right"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{
          sx: { 
            width: 360,
            backgroundColor: '#f8fafc',
            overflowY: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1, pb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a202c' }}>
              Filtros y Categorías
            </Typography>
            <IconButton 
              onClick={() => setMobileFiltersOpen(false)}
              sx={{ 
                color: '#64748b',
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
          
          <Stack spacing={3}>
            {/* Category Sidebar for Mobile */}
            <CategorySidebar
              categories={categories || []}
              selectedCategory={filters.category}
              onCategorySelect={(categoryId) => {
                updateFilters({ category: categoryId, page: 1 })
                setMobileFiltersOpen(false)
              }}
              isLoading={loadingCategories}
              productCounts={productCounts}
              onClearFilters={clearFilters}
            />
            
            {/* Price and Sort Filters for Mobile */}
            <FiltersContent />
            
            {/* Apply Filters Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={() => setMobileFiltersOpen(false)}
              sx={{ 
                mt: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Aplicar Filtros
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  )
}

export default Products