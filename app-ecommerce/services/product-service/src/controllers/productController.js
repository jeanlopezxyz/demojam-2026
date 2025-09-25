const productService = require('../services/productService');
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  shortDescription: Joi.string().required(),
  price: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0).optional(),
  sku: Joi.string().required(),
  category: Joi.string().required(),
  brand: Joi.string().required(),
  images: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    alt: Joi.string().optional(),
    isPrimary: Joi.boolean().optional()
  })).optional(),
  specifications: Joi.object().optional(),
  dimensions: Joi.object({
    length: Joi.number().optional(),
    width: Joi.number().optional(),
    height: Joi.number().optional(),
    weight: Joi.number().optional(),
    unit: Joi.string().optional()
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  stock: Joi.number().min(0).required(),
  lowStockThreshold: Joi.number().min(0).optional(),
  isFeatured: Joi.boolean().optional()
});

const reviewSchema = Joi.object({
  userId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required()
});

class ProductController {
  async createProduct(req, res) {
    try {
      const { error, value } = productSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const product = await productService.createProduct(value);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        brand,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filters = {};
      if (category) filters.category = category;
      if (brand) filters.brand = new RegExp(brand, 'i');
      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = parseFloat(minPrice);
        if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const result = await productService.getProducts(
        filters,
        parseInt(page),
        parseInt(limit),
        sort
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProductBySlug(req, res) {
    try {
      const { slug } = req.params;
      const product = await productService.getProductBySlug(slug);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.deleteProduct(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async searchProducts(req, res) {
    try {
      const { q, page = 1, limit = 20, category, brand } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const filters = {};
      if (category) filters.category = category;
      if (brand) filters.brand = new RegExp(brand, 'i');

      const result = await productService.searchProducts(
        q,
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async addReview(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = reviewSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const product = await productService.addReview(id, value);
      res.json({
        success: true,
        message: 'Review added successfully',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getFeaturedProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const products = await productService.getFeaturedProducts(parseInt(limit));
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await productService.getCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const result = await productService.getProductsByCategory(
        categoryId,
        parseInt(page),
        parseInt(limit),
        sort
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ProductController();