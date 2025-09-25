const Product = require('../models/Product');
const Category = require('../models/Category');

class ProductService {
  async createProduct(productData) {
    try {
      const product = new Product(productData);
      await product.save();
      return await product.populate('category');
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  async getProducts(filters = {}, page = 1, limit = 20, sort = { createdAt: -1 }) {
    try {
      const skip = (page - 1) * limit;
      const query = { isActive: true, ...filters };

      const products = await Product.find(query)
        .populate('category')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        products,
        pagination: {
          page,
          pages,
          limit,
          total
        }
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  async getProductById(id) {
    try {
      const product = await Product.findById(id).populate('category');
      return product;
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  async getProductBySlug(slug) {
    try {
      const product = await Product.findOne({ slug, isActive: true }).populate('category');
      return product;
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  async updateProduct(id, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('category');
      return product;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  async deleteProduct(id) {
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      return product;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  async searchProducts(searchTerm, filters = {}, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const query = {
        $text: { $search: searchTerm },
        isActive: true,
        ...filters
      };

      const products = await Product.find(query)
        .populate('category')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        products,
        pagination: {
          page,
          pages,
          limit,
          total
        }
      };
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  async addReview(productId, reviewData) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      product.reviews.push(reviewData);
      await product.save();
      return product;
    } catch (error) {
      throw new Error(`Error adding review: ${error.message}`);
    }
  }

  async getCategories() {
    try {
      const categories = await Category.find({ isActive: true })
        .populate('children')
        .sort({ sortOrder: 1, name: 1 });
      return categories;
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }

  async createCategory(categoryData) {
    try {
      const category = new Category(categoryData);
      await category.save();
      return category;
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  async getFeaturedProducts(limit = 10) {
    try {
      const products = await Product.find({ 
        isFeatured: true, 
        isActive: true 
      })
      .populate('category')
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(limit);
      
      return products;
    } catch (error) {
      throw new Error(`Error fetching featured products: ${error.message}`);
    }
  }

  async getProductsByCategory(categoryId, page = 1, limit = 20, sort = { createdAt: -1 }) {
    try {
      const skip = (page - 1) * limit;
      const query = { category: categoryId, isActive: true };

      const products = await Product.find(query)
        .populate('category')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        products,
        pagination: {
          page,
          pages,
          limit,
          total
        }
      };
    } catch (error) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
  }
}

module.exports = new ProductService();