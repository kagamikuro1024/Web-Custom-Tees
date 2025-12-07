import Product from '../models/Product.model.js';

class ProductService {
  // Get all products with filters
  async getAllProducts(filters = {}) {
    const {
      category,
      isCustomizable,
      minPrice,
      maxPrice,
      search,
      sortBy = '-createdAt',
      page = 1,
      limit = 12
    } = filters;

    const query = { status: 'active' };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by customizable
    if (isCustomizable !== undefined) {
      query.isCustomizable = isCustomizable === 'true';
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    return {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get product by slug or ID
  async getProductBySlug(slug) {
    const product = await Product.findOne({ slug, status: 'active' })
      .populate('category', 'name slug');

    if (!product) {
      throw new Error('Product not found');
    }

    // Increment view count
    product.views += 1;
    await product.save();

    return product;
  }

  // Get product by ID (for cart/order)
  async getProductById(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  // Create product (Admin)
  async createProduct(productData) {
    const product = await Product.create(productData);
    return product;
  }

  // Update product (Admin)
  async updateProduct(productId, updateData) {
    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  // Delete product (Admin)
  async deleteProduct(productId) {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return { message: 'Product deleted successfully' };
  }

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    const products = await Product.find({ status: 'active', isFeatured: true })
      .populate('category', 'name slug')
      .limit(limit)
      .sort('-createdAt')
      .lean();

    return products;
  }

  // Get customizable products
  async getCustomizableProducts(limit = 12) {
    const products = await Product.find({ status: 'active', isCustomizable: true })
      .populate('category', 'name slug')
      .limit(limit)
      .sort('-sold')
      .lean();

    return products;
  }

  // Check stock availability
  async checkStockAvailability(productId, size, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const sizeItem = product.sizes.find(s => s.name === size);
    if (!sizeItem) {
      throw new Error(`Size ${size} not available`);
    }

    if (sizeItem.stock < quantity) {
      throw new Error(`Insufficient stock. Only ${sizeItem.stock} items available`);
    }

    return true;
  }

  // Update stock after order
  async updateStock(productId, size, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const sizeItem = product.sizes.find(s => s.name === size);
    if (sizeItem) {
      sizeItem.stock -= quantity;
      product.sold += quantity;
      await product.save();
    }

    return product;
  }
}

export default new ProductService();
