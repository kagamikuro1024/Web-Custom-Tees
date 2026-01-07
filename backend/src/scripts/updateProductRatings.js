import mongoose from 'mongoose';
import Review from '../models/Review.model.js';
import Product from '../models/Product.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateAllProductRatings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all unique product IDs that have reviews
    const productIds = await Review.distinct('product');
    console.log(`Found ${productIds.length} products with reviews`);

    // Update rating for each product
    for (const productId of productIds) {
      await Review.updateProductRating(productId);
      console.log(`✓ Updated rating for product ${productId}`);
    }

    console.log('✅ All product ratings updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateAllProductRatings();
