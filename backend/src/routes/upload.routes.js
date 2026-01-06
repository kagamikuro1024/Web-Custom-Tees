import express from 'express';
import uploadController from '../controllers/upload.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { uploadDesign, uploadProduct } from '../config/cloudinary.js';

const router = express.Router();

// Upload custom design (authenticated users) - TEMPORARILY DISABLE AUTH FOR TESTING
router.post('/design', (req, res, next) => {
  console.log('Route hit: /api/upload/design');
  console.log('Headers:', req.headers);
  next();
}, uploadDesign.single('design'), (err, req, res, next) => {
  // Multer error handler
  if (err) {
    console.error('Multer error:', err);
    console.error('Multer error code:', err.code);
    console.error('Multer error message:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      error: err.toString()
    });
  }
  next(err);
}, uploadController.uploadDesign);

// Upload product image (admin only)
router.post('/product', protect, adminOnly, uploadProduct.single('image'), uploadController.uploadProductImage);

// Delete file
router.delete('/delete', protect, uploadController.deleteFile);

export default router;
