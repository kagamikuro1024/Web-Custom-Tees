import productService from '../services/product.service.js';

class ProductController {
  // Get all products
  async getAllProducts(req, res, next) {
    try {
      const result = await productService.getAllProducts(req.query);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get product by slug
  async getProductBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const product = await productService.getProductBySlug(slug);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // Get featured products
  async getFeaturedProducts(req, res, next) {
    try {
      const products = await productService.getFeaturedProducts(req.query.limit);

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  // Get customizable products
  async getCustomizableProducts(req, res, next) {
    try {
      const products = await productService.getCustomizableProducts(req.query.limit);

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  // Create product (Admin)
  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // Update product (Admin)
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete product (Admin)
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
