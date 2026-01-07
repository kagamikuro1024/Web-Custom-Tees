import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Order from '../models/Order.model.js';

dotenv.config();

async function updateAllUserTiers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    // Get all users with delivered orders
    const usersWithOrders = await Order.distinct('user', { orderStatus: 'delivered' });
    console.log(`Found ${usersWithOrders.length} users with delivered orders`);

    // Update tier for each user
    for (const userId of usersWithOrders) {
      try {
        const result = await User.calculateUserTier(userId);
        console.log(`Updated user ${userId}: ${result.tier} (${result.orderCount} orders)`);
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error.message);
      }
    }

    console.log('All user tiers updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAllUserTiers();
