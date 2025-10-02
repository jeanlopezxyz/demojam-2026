import { useState } from 'react'
import React from 'react'
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Skeleton,
  Paper,
  Badge,
  Tooltip,
  IconButton,
  Divider,
  alpha
} from '@mui/material'
import {
  ExpandLess,
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  Category,
  LocalOffer,
  Devices,
  Code,
  Cloud,
  DataObject,
  Security,
  BugReport,
  Speed,
  Storage,
  Api,
  Terminal,
  Web,
  DeveloperMode,
  Memory,
  ViewInAr,
  Widgets,
  FilterListOff,
  TrendingUp
} from '@mui/icons-material'

// Mapeo de iconos para categorías tech
const categoryIcons = {
  'frameworks': <Code />,
  'cloud': <Cloud />,
  'databases': <Storage />,
  'devops': <Devices />,
  'security': <Security />,
  'testing': <BugReport />,
  'performance': <Speed />,
  'api': <Api />,
  'frontend': <Web />,
  'backend': <DataObject />,
  'mobile': <DeveloperMode />,
  'ml': <Memory />,
  'blockchain': <ViewInAr />,
  'microservices': <Widgets />,
  'terminal': <Terminal />,
  'default': <Category />
}

const CategorySidebar = ({ 
  categories = [], 
  selectedCategory, 
  onCategorySelect, 
  isLoading,
  productCounts = {},
  onClearFilters 
}) => {
  const [expandedCategories, setExpandedCategories] = useState({})
  const [hoveredCategory, setHoveredCategory] = useState(null)

  // Obtener icono para categoría
  const getCategoryIcon = (categoryName) => {
    const lowerName = categoryName?.toLowerCase() || ''
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (lowerName.includes(key)) return icon
    }
    return categoryIcons.default
  }

  // Manejar expansión de categorías con subcategorías
  const handleExpandClick = (categoryId, event) => {
    event.stopPropagation()
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  // Renderizar categoría individual
  const renderCategory = (category, level = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0
    const isSelected = selectedCategory === category.id
    const isExpanded = expandedCategories[category.id]
    const isHovered = hoveredCategory === category.id

    return (
      <Box key={category.id}>
        <ListItemButton
          onClick={() => onCategorySelect(category.id)}
          onMouseEnter={() => setHoveredCategory(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}
          selected={isSelected}
          sx={{
            pl: 2.5 + level * 2.5,
            pr: 2.5,
            py: 1.8,
            borderRadius: 3,
            mb: 1.2,
            transition: 'all 0.25s ease-in-out',
            backgroundColor: isSelected ? alpha('#1976d2', 0.1) : 'transparent',
            border: isSelected ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid transparent',
            '&:hover': {
              backgroundColor: alpha('#1976d2', 0.06),
              transform: 'translateX(3px)',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.12)'
            },
            '&.Mui-selected': {
              backgroundColor: alpha('#1976d2', 0.12),
              borderLeft: '4px solid #1976d2',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
              '&:hover': {
                backgroundColor: alpha('#1976d2', 0.16),
                transform: 'translateX(2px)'
              }
            }
          }}
        >
          <ListItemIcon 
            sx={{ 
              minWidth: 48,
              color: isSelected ? '#1976d2' : isHovered ? '#1565c0' : '#64748b',
              transition: 'all 0.25s ease-in-out',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            {isSelected ? (
              <CheckCircle sx={{ fontSize: 24 }} />
            ) : (
              React.cloneElement(getCategoryIcon(category.name), { 
                sx: { fontSize: 24 } 
              })
            )}
          </ListItemIcon>
          
          <ListItemText 
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography
                  sx={{
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? '#1976d2' : '#1a202c',
                    fontSize: level === 0 ? '1.1rem' : '1.0rem',
                    letterSpacing: '0.02em',
                    lineHeight: 1.3
                  }}
                >
                  {category.name}
                </Typography>
                {category.isNew && (
                  <Chip 
                    label="New" 
                    size="small" 
                    color="success"
                    sx={{ 
                      height: 22, 
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: '"Inter", sans-serif'
                    }} 
                  />
                )}
                {category.trending && (
                  <TrendingUp 
                    sx={{ 
                      fontSize: 20, 
                      color: '#ef4444',
                      animation: 'pulse 2s infinite'
                    }} 
                  />
                )}
              </Box>
            }
            secondary={category.description && level === 0 && isHovered && (
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  mt: 0.8,
                  fontSize: '0.85rem',
                  fontFamily: '"Inter", sans-serif',
                  fontStyle: 'italic',
                  lineHeight: 1.3
                }}
              >
                {category.description}
              </Typography>
            )}
          />
          
          {hasSubcategories && (
            <IconButton
              size="small"
              onClick={(e) => handleExpandClick(category.id, e)}
              sx={{ 
                ml: 1,
                color: isSelected ? '#1976d2' : '#64748b',
                '&:hover': {
                  backgroundColor: alpha('#1976d2', 0.08),
                  color: '#1976d2',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isExpanded ? <ExpandLess sx={{ fontSize: 22 }} /> : <ExpandMore sx={{ fontSize: 22 }} />}
            </IconButton>
          )}
        </ListItemButton>

        {hasSubcategories && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 1.5, pr: 1 }}>
              {category.subcategories.map(subcategory => 
                renderCategory(subcategory, level + 1)
              )}
            </List>
          </Collapse>
        )}
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        {[...Array(6)].map((_, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="rectangular" width={28} height={20} sx={{ ml: 'auto', borderRadius: 1 }} />
          </Box>
        ))}
      </Paper>
    )
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        border: '1px solid #e2e8f0', 
        borderRadius: 2,
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #ffffff, #fafbfc)'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 3, 
          backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Category sx={{ color: '#1976d2', fontSize: 28 }} />
            <Typography 
              sx={{ 
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 800,
                color: '#1a202c',
                fontSize: '1.25rem',
                letterSpacing: '0.02em'
              }}
            >
              Categorías
            </Typography>
          </Box>
          {selectedCategory && (
            <Tooltip title="Limpiar filtros">
              <IconButton 
                size="small" 
                onClick={() => {
                  onCategorySelect('')
                  onClearFilters && onClearFilters()
                }}
                sx={{ 
                  color: '#64748b',
                  '&:hover': { 
                    color: '#ef4444',
                    backgroundColor: alpha('#ef4444', 0.08),
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <FilterListOff sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Categories List */}
      <List sx={{ py: 2, px: 2 }}>
        {/* All Categories Option */}
        <ListItemButton
          onClick={() => onCategorySelect('')}
          selected={!selectedCategory}
          sx={{
            pl: 2.5,
            pr: 2.5,
            py: 1.8,
            borderRadius: 3,
            mb: 1.5,
            transition: 'all 0.25s ease-in-out',
            backgroundColor: !selectedCategory ? alpha('#1976d2', 0.1) : 'transparent',
            border: !selectedCategory ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid transparent',
            '&:hover': {
              backgroundColor: alpha('#1976d2', 0.06),
              transform: 'translateX(3px)',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.12)'
            },
            '&.Mui-selected': {
              backgroundColor: alpha('#1976d2', 0.12),
              borderLeft: '4px solid #1976d2',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
              '&:hover': {
                backgroundColor: alpha('#1976d2', 0.16),
                transform: 'translateX(2px)'
              }
            }
          }}
        >
          <ListItemIcon 
            sx={{ 
              minWidth: 48, 
              color: !selectedCategory ? '#1976d2' : '#64748b',
              transition: 'all 0.25s ease-in-out',
              transform: !selectedCategory ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            {!selectedCategory ? <CheckCircle sx={{ fontSize: 24 }} /> : <RadioButtonUnchecked sx={{ fontSize: 24 }} />}
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography
                sx={{
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontWeight: !selectedCategory ? 700 : 600,
                  color: !selectedCategory ? '#1976d2' : '#1a202c',
                  fontSize: '1.1rem',
                  letterSpacing: '0.02em',
                  lineHeight: 1.3
                }}
              >
                Todas las Categorías
              </Typography>
            }
          />
        </ListItemButton>

        <Divider sx={{ my: 2, mx: 1, backgroundColor: '#e2e8f0' }} />

        {/* Category Items */}
        {categories.map(category => renderCategory(category))}
      </List>

      {/* Footer with tags */}
      <Box 
        sx={{ 
          p: 3, 
          backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderTop: '1px solid #e2e8f0'
        }}
      >
        <Typography 
          sx={{ 
            color: '#64748b', 
            fontWeight: 700,
            fontSize: '0.8rem',
            fontFamily: '"Inter", sans-serif',
            letterSpacing: '0.1em',
            mb: 1.5
          }}
        >
          TAGS POPULARES
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
          {['React', 'Node.js', 'Docker', 'K8s', 'AWS'].map(tag => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              onClick={() => {/* Handle tag click */}}
              sx={{
                fontSize: '0.75rem',
                height: 28,
                borderColor: '#cbd5e1',
                color: '#475569',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: alpha('#1976d2', 0.06),
                  color: '#1976d2',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 4px rgba(25, 118, 210, 0.15)'
                },
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  )
}

export default CategorySidebar