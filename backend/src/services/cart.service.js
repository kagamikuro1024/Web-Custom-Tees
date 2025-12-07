import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import productService from './product.service.js';

class CartService {
  // Get user's cart
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name slug price images isCustomizable status'
      });

    if (!cart) {
      // Create empty cart if not exists
      cart = await Cart.create({ user: userId, items: [] });
    }

    return cart;
  }

  // Add item to cart
  async addToCart(userId, cartItemData) {
    const { productId, quantity, selectedSize, selectedColor, customDesign } = cartItemData;

    // Validate product
    const product = await productService.getProductById(productId);

    // Check if product is active
    if (product.status !== 'active') {
      throw new Error('Product is not available');
    }

    // Validate stock
    await productService.checkStockAvailability(productId, selectedSize, quantity);

    // Validate customization requirements
    if (product.isCustomizable && (!customDesign || !customDesign.imageUrl)) {
      throw new Error('Custom design is required for this product');
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId &&
      item.selectedSize === selectedSize &&
      (!product.isCustomizable || 
        (item.customDesign?.imageUrl === customDesign?.imageUrl))
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem = {
        product: productId,
        quantity,
        selectedSize,
        selectedColor,
        priceAtAdd: product.price,
        customDesign: product.isCustomizable ? {
          imageUrl: customDesign.imageUrl,
          publicId: customDesign.publicId,
          placement: customDesign.placement || {},
          previewUrl: customDesign.previewUrl
        } : undefined
      };

      cart.items.push(newItem);
    }

    await cart.save();

    // Populate and return
    cart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price images isCustomizable status'
      });

    return cart;
  }

  // Update cart item quantity
  async updateCartItem(userId, itemId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new Error('Item not found in cart');
    }

    // Validate stock
    await productService.checkStockAvailability(item.product, item.selectedSize, quantity);

    item.quantity = quantity;
    await cart.save();

    // Populate and return
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price images isCustomizable status'
      });

    return updatedCart;
  }

  // Remove item from cart
  async removeCartItem(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    // Populate and return
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name slug price images isCustomizable status'
      });

    return updatedCart;
  }

  // Clear entire cart
  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = [];
    await cart.save();

    return cart;
  }

  // Validate cart before checkout
  async validateCart(userId) {
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const errors = [];

    // Validate each item
    for (const item of cart.items) {
      if (!item.product) {
        errors.push(`Product not found for item ${item._id}`);
        continue;
      }

      if (item.product.status !== 'active') {
        errors.push(`${item.product.name} is no longer available`);
        continue;
      }

      // Check stock
      const sizeItem = item.product.sizes.find(s => s.name === item.selectedSize);
      if (!sizeItem || sizeItem.stock < item.quantity) {
        errors.push(`Insufficient stock for ${item.product.name} (Size: ${item.selectedSize})`);
      }

      // Validate custom design
      if (item.product.isCustomizable && !item.customDesign?.imageUrl) {
        errors.push(`Custom design missing for ${item.product.name}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return { valid: true, cart };
  }
}

export default new CartService();
