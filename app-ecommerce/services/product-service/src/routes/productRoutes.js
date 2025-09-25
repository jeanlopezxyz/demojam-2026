const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/categories', productController.getCategories);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProduct);
router.get('/', productController.getProducts);

router.post('/', productController.createProduct);
router.post('/:id/reviews', productController.addReview);

router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;