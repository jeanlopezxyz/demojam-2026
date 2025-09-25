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
  useTheme
} from '@mui/material'
import { FilterList, Clear } from '@mui/icons-material'
import debounce from 'lodash.debounce'

import { productsAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'

const Products = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Filter states
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

  // Fetch products
  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsAPI.getProducts(filters),
    select: (data) => data.data,
    staleTime: 2 * 60 * 1000,
  })

  // Fetch categories
  const {
    data: categories,
    isLoading: loadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsAPI.getCategories(),
    select: (data) => data.data,
    staleTime: 10 * 60 * 1000,
  })

  // Debounced search function
  const debouncedSearch = debounce((searchTerm) => {
    updateFilters({ search: searchTerm, page: 1 })
  }, 500)

  // Update filters and URL
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '' && key !== 'limit') {
        params.set(key, value.toString())
      }
    })
    setSearchParams(params)
  }

  // Handle search input
  const handleSearchChange = (event) => {
    const value = event.target.value
    setFilters(prev => ({ ...prev, search: value }))
    debouncedSearch(value)
  }

  // Handle price range change
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue)
  }

  const handlePriceChangeCommitted = (event, newValue) => {
    updateFilters({
      minPrice: newValue[0],
      maxPrice: newValue[1],
      page: 1
    })
  }

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      sortBy: 'name',
      sortOrder: 'asc',
      minPrice: 0,
      maxPrice: 1000,
      page: 1,
      limit: 12
    }
    setFilters(clearedFilters)
    setPriceRange([0, 1000])
    setSearchParams({})
  }

  // Handle pagination
  const handlePageChange = (event, page) => {
    updateFilters({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sortOptions = [
    { value: 'name:asc', label: 'Name (A-Z)' },
    { value: 'name:desc', label: 'Name (Z-A)' },
    { value: 'price:asc', label: 'Price (Low to High)' },
    { value: 'price:desc', label: 'Price (High to Low)' },
    { value: 'createdAt:desc', label: 'Newest First' },
    { value: 'rating:desc', label: 'Highest Rated' }
  ]

  const handleSortChange = (event) => {
    const [sortBy, sortOrder] = event.target.value.split(':')
    updateFilters({ sortBy, sortOrder, page: 1 })
  }

  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.minPrice > 0 || filters.maxPrice < 1000
  ].filter(Boolean).length

  // Filters component
  const FiltersContent = () => (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Filters</Typography>
        {activeFilterCount > 0 && (
          <Button
            size="small"
            onClick={clearFilters}
            startIcon={<Clear />}
            color="error"
          >
            Clear ({activeFilterCount})
          </Button>
        )}
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        label="Search products"
        value={filters.search}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
      />

      {/* Category Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={filters.category}
          label="Category"
          onChange={(e) => updateFilters({ category: e.target.value, page: 1 })}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories?.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Price Range */}
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Price Range</Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          onChangeCommitted={handlePriceChangeCommitted}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          step={10}
          marks={[
            { value: 0, label: '$0' },
            { value: 500, label: '$500' },
            { value: 1000, label: '$1000+' }
          ]}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">${priceRange[0]}</Typography>
          <Typography variant="body2">${priceRange[1]}</Typography>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Products
            </Typography>
            {productsData && (
              <Typography variant="body2" color="text.secondary">
                Showing {productsData.products?.length || 0} of {productsData.total || 0} products
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Sort dropdown */}
            <FormControl size="small" sx={{ minWidth: 200, display: { xs: 'none', sm: 'block' } }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={`${filters.sortBy}:${filters.sortOrder}`}
                label="Sort by"
                onChange={handleSortChange}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Mobile filter button */}
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setMobileFiltersOpen(true)}
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            )}
          </Box>
        </Box>

        {/* Active filters chips */}
        {activeFilterCount > 0 && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filters.search && (
              <Chip
                label={`Search: "${filters.search}"`}
                onDelete={() => updateFilters({ search: '', page: 1 })}
                size="small"
              />
            )}
            {filters.category && (
              <Chip
                label={`Category: ${categories?.find(c => c.id === filters.category)?.name || filters.category}`}
                onDelete={() => updateFilters({ category: '', page: 1 })}
                size="small"
              />
            )}
            {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
              <Chip
                label={`Price: $${filters.minPrice}-$${filters.maxPrice}`}
                onDelete={() => updateFilters({ minPrice: 0, maxPrice: 1000, page: 1 })}
                size="small"
              />
            )}
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Desktop Filters */}
          {!isMobile && (
            <Grid item md={3}>
              <Card sx={{ position: 'sticky', top: 24 }}>
                <FiltersContent />
              </Card>
            </Grid>
          )}

          {/* Products Grid */}
          <Grid item xs={12} md={isMobile ? 12 : 9}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Failed to load products. Please try again later.
              </Alert>
            )}

            <Grid container spacing={3}>
              {isLoading ? (
                // Loading skeletons
                Array.from(new Array(12)).map((_, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Card>
                      <Skeleton variant="rectangular" width="100%" height={200} />
                      <CardContent>
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : productsData?.products && productsData.products.length > 0 ? (
                productsData.products.map((product) => (
                  <Grid item xs={12} sm={6} lg={4} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" gutterBottom>
                      No products found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Try adjusting your filters or search terms
                    </Typography>
                    <Button variant="outlined" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Pagination */}
            {productsData?.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={productsData.totalPages}
                  page={filters.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Mobile Filters Drawer */}
        <Drawer
          anchor="right"
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          PaperProps={{ sx: { width: 300 } }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setMobileFiltersOpen(false)}>
              <Clear />
            </IconButton>
          </Box>
          <FiltersContent />
        </Drawer>
      </Box>
    </Container>
  )
}

export default Products