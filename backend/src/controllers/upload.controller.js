import cloudinary from '../config/cloudinary.js';

class UploadController {
  // Upload custom design
  async uploadDesign(req, res, next) {
    try {
      console.log('Upload request received');
      console.log('Headers:', req.headers);
      console.log('File:', req.file);
      console.log('Body:', req.body);

      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      console.log('File uploaded successfully:', req.file);

      res.json({
        success: true,
        message: 'Design uploaded successfully',
        data: {
          url: req.file.path,
          publicId: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          format: req.file.format,
          width: req.file.width,
          height: req.file.height
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error stack:', error.stack);
      next(error);
    }
  }

  // Upload product image
  async uploadProductImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: req.file.path,
          publicId: req.file.filename
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete uploaded file
  async deleteFile(req, res, next) {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID is required'
        });
      }

      await cloudinary.uploader.destroy(publicId);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
