import cartService from '../services/cart.service.js';

class CartController {
  // Get user's cart
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.user.id);

      res.json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  // Add item to cart
  async addToCart(req, res, next) {
    try {
      const cart = await cartService.addToCart(req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  // Update cart item quantity
  async updateCartItem(req, res, next) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      const cart = await cartService.updateCartItem(req.user.id, itemId, quantity);

      res.json({
        success: true,
        message: 'Cart updated',
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove item from cart
  async removeCartItem(req, res, next) {
    try {
      const { itemId } = req.params;
      const cart = await cartService.removeCartItem(req.user.id, itemId);

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  // Clear cart
  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.user.id);

      res.json({
        success: true,
        message: 'Cart cleared',
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CartController();
