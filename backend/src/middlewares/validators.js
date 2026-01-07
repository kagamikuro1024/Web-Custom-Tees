import { body, param, query, validationResult } from 'express-validator';

export const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('isCustomizable')
    .isBoolean().withMessage('isCustomizable must be a boolean'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
];

export const addToCartValidation = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('selectedSize')
    .notEmpty().withMessage('Size selection is required'),
  body('selectedColor')
    .optional()
    .isObject().withMessage('Selected color must be an object'),
  body('customDesign')
    .optional()
    .isObject().withMessage('Custom design must be an object'),
];

export const createOrderValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('shippingAddress')
    .notEmpty().withMessage('Shipping address is required')
    .isObject().withMessage('Shipping address must be an object'),
  body('shippingAddress.fullName')
    .notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone')
    .notEmpty().withMessage('Phone is required'),
  body('shippingAddress.addressLine1')
    .notEmpty().withMessage('Address is required'),
  body('shippingAddress.city')
    .notEmpty().withMessage('City is required'),
  body('shippingAddress.state')
    .notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode')
    .notEmpty().withMessage('Postal code is required'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['cod', 'stripe', 'zalopay', 'momo', 'vnpay']).withMessage('Invalid payment method'),
];

export const updateOrderStatusValidation = [
  param('orderId')
    .isMongoId().withMessage('Invalid order ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};
