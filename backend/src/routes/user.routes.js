import express from 'express';
import User from '../models/User.model.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, avatar },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Add address
router.post('/addresses', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // If this is set as default, unset other defaults
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    user.addresses.push(req.body);
    await user.save();

    res.json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

// Update address
router.put('/addresses/:addressId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);
    
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If this is set as default, unset other defaults
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(address, req.body);
    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

// Delete address
router.delete('/addresses/:addressId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

// ===== SEARCH HISTORY ROUTES =====

// Get search history
router.get('/search-history', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('searchHistory');
    
    // Sort by timestamp desc and limit to 20
    const history = user.searchHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
});

// Add search query to history
router.post('/search-history', async (req, res, next) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Remove duplicate if exists
    user.searchHistory = user.searchHistory.filter(
      item => item.query.toLowerCase() !== query.toLowerCase()
    );
    
    // Add new search to beginning
    user.searchHistory.unshift({ query: query.trim() });
    
    // Keep only last 50 searches
    if (user.searchHistory.length > 50) {
      user.searchHistory = user.searchHistory.slice(0, 50);
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Search history updated',
      data: user.searchHistory.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
});

// Clear search history
router.delete('/search-history', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.searchHistory = [];
    await user.save();

    res.json({
      success: true,
      message: 'Search history cleared'
    });
  } catch (error) {
    next(error);
  }
});

// Delete single search history item
router.delete('/search-history/:index', async (req, res, next) => {
  try {
    const index = parseInt(req.params.index);
    const user = await User.findById(req.user.id);
    
    if (index < 0 || index >= user.searchHistory.length) {
      return res.status(404).json({
        success: false,
        message: 'Search history item not found'
      });
    }
    
    user.searchHistory.splice(index, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Search history item deleted',
      data: user.searchHistory.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
