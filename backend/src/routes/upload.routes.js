import express from 'express';
import uploadController from '../controllers/upload.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { uploadDesign, uploadProduct } from '../config/cloudinary.js';

const router = express.Router();

// Upload custom design (authenticated users)
router.post('/design', protect, uploadDesign.single('design'), uploadController.uploadDesign);

// Upload product image (admin only)
router.post('/product', protect, adminOnly, uploadProduct.single('image'), uploadController.uploadProductImage);

// Delete file
router.delete('/delete', protect, uploadController.deleteFile);

export default router;
