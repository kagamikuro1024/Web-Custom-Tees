# Retry Payment Feature - Testing Guide

## ✅ Implementation Complete

### Backend
- ✅ API endpoint: `POST /api/orders/:orderId/retry-payment`
- ✅ Order validation: status, expiration check
- ✅ Auto-cancel expired orders (>1 hour)
- ✅ Support both VNPAY and Stripe

### Frontend
- ✅ OrderDetailPage: Continue Payment button + warning banner
- ✅ OrdersPage: Visual indicators for awaiting_payment orders
- ✅ Status colors: Orange for awaiting_payment
- ✅ Loading states and error handling

---

## 🧪 Testing Steps

### 1. Create Order with Online Payment

**Option A: VNPAY**
```bash
# In Postman or frontend:
1. Login user
2. Add products to cart
3. Create order with paymentMethod: "vnpay"
4. DON'T complete payment (close the VNPAY page)
```

**Option B: Stripe**
```bash
# In Postman or frontend:
1. Login user
2. Add products to cart
3. Create order with paymentMethod: "stripe"
4. DON'T complete payment (close Stripe checkout)
```

**Expected Result:**
- Order created with status = `awaiting_payment`
- Email NOT sent yet (will send after payment)

### 2. View Order Detail Page

```bash
# Navigate to: /orders/ORD20240108123456
```

**Expected UI:**
1. ✅ Status badge: Orange color "awaiting_payment"
2. ✅ Orange warning banner at top:
   - "Payment Pending" heading
   - Warning text about 1 hour limit
   - "Continue Payment Now" button
3. ✅ Header section: "Continue Payment" button (orange)
4. ✅ Can still cancel order
5. ✅ Can still upload/edit custom design

**Screenshot Reference:**
```
┌─────────────────────────────────────────────────┐
│ ⚠️  Payment Pending                            │
│ Your order is waiting for payment...           │
│ [💳 Continue Payment Now]                      │
└─────────────────────────────────────────────────┘

Order #ORD20240108123456
[awaiting_payment] [Continue Payment] [Cancel Order]
```

### 3. View Orders List Page

```bash
# Navigate to: /orders
```

**Expected UI:**
1. ✅ Order card has orange border
2. ✅ Top banner: "⚠️ Payment pending - Complete within 1 hour"
3. ✅ Status badge: Orange "awaiting_payment"
4. ✅ Can filter by "Awaiting Payment" status

### 4. Click "Continue Payment" Button

**Test Flow:**
```bash
1. Click "Continue Payment" button
2. Button shows "Processing..."
3. Redirected to payment page (VNPAY or Stripe)
```

**Expected Behavior:**

**For VNPAY:**
- Frontend calls: `/orders/:orderId/retry-payment`
- Backend returns: orderNumber, paymentMethod="vnpay", totalAmount
- Frontend calls: `/payment/create-payment-url`
- Redirect to: VNPAY payment page

**For Stripe:**
- Frontend calls: `/orders/:orderId/retry-payment`
- Backend returns: orderNumber, paymentMethod="stripe", totalAmount
- Frontend calls: `/stripe/create-checkout-session`
- Redirect to: Stripe checkout page

### 5. Complete Payment

**After successful payment:**
```bash
Expected changes:
1. Order status: awaiting_payment → confirmed
2. Email sent: "Payment Success" template
3. PaymentDetails updated in Order model
4. Can no longer retry payment
5. Warning banner disappears
```

### 6. Test Expired Order (>1 hour)

**Simulate expired order:**
```javascript
// Option 1: In MongoDB directly
db.orders.updateOne(
  { orderNumber: "ORD20240108123456" },
  { $set: { createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) } }
);

// Option 2: Wait 1 hour (for production testing)
```

**Test retry payment:**
```bash
1. Click "Continue Payment"
2. Expected error: "Order has expired and been cancelled. Please create a new order."
3. Order status changed to: cancelled
```

### 7. Test Cron Job Auto-Cancel

**Wait for cron job to run (every 15 minutes):**
```bash
# Or manually trigger in backend:
# Visit: backend/src/services/cron.service.js
# Call cancelExpiredOrders() method

Expected:
- All orders with status=awaiting_payment AND createdAt > 1 hour ago
- Will be cancelled automatically
- Console log: "Auto-cancelled expired order: ORD..."
```

---

## 🐛 Error Scenarios to Test

### 1. Invalid Order ID
```bash
POST /api/orders/invalid_id/retry-payment
Expected: 400 or 404 error
```

### 2. Order Not Owned by User
```bash
POST /api/orders/{other_user_order_id}/retry-payment
Expected: "Order not found" error
```

### 3. Wrong Status (e.g., confirmed)
```bash
# Try retry payment on confirmed order
Expected: "Cannot retry payment. Order status is confirmed"
```

### 4. Network Error During Redirect
```bash
# Disconnect internet before clicking Continue Payment
Expected: Error toast shown, no redirect
```

### 5. Payment Gateway Down
```bash
# If VNPAY/Stripe API fails
Expected: Error message from payment controller
Frontend shows: toast error message
```

---

## 📊 UI Visual Tests

### Status Colors
- `pending`: Yellow
- `awaiting_payment`: **Orange** ⭐
- `confirmed`: Blue
- `processing`: Purple
- `shipped`: Cyan
- `delivered`: Green
- `cancelled`: Red

### Buttons
- **Continue Payment**: Orange background, white text
- **Cancel Order**: Red background, white text
- **View Details**: Blue/primary color

### Warning Banner (awaiting_payment only)
- Background: Orange-50
- Border: Orange-200 (2px)
- Icon: Alert triangle (orange-600)
- Button: Orange-600

---

## 🔄 Complete User Journey

```
1. User adds products to cart
2. User proceeds to checkout
3. User selects "Stripe" or "VNPAY"
4. User fills shipping info
5. User clicks "Place Order"
   → Order created with status = awaiting_payment
   
6. User is redirected to payment page
7. User closes payment page WITHOUT paying
   → Order remains awaiting_payment
   
8. User navigates to Orders page
   → Sees orange border + warning banner
   
9. User clicks "View Details"
   → Sees warning banner + Continue Payment button
   
10. User clicks "Continue Payment"
    → Redirected to new payment session
    
11. User completes payment
    → Order status = confirmed
    → Email sent
    → Warning disappears
    
ALTERNATIVE: User doesn't pay within 1 hour
    → Cron job auto-cancels order
    → Status = cancelled
```

---

## 🎯 Success Criteria

### Backend ✅
- [x] API returns correct payment info
- [x] Validates order status = awaiting_payment
- [x] Checks order expiration (<1 hour)
- [x] Auto-cancels expired orders
- [x] Works with both VNPAY and Stripe

### Frontend ✅
- [x] Orange status badge for awaiting_payment
- [x] Warning banner visible on OrderDetailPage
- [x] Continue Payment button functional
- [x] Loading states during API calls
- [x] Error handling with toast messages
- [x] Visual indicators on OrdersPage
- [x] Can filter by "Awaiting Payment"
- [x] Can cancel awaiting_payment orders
- [x] Can edit design for awaiting_payment orders

### Integration ✅
- [x] End-to-end flow: Create → Close → Retry → Pay → Success
- [x] VNPAY payment retry works
- [x] Stripe payment retry works
- [x] Email sent after successful retry
- [x] Order status updates correctly

---

## 🚀 Deployment Checklist

Before pushing to production:

1. **Backend:**
   - [ ] Commit all changes in `feature/optimization-and-fixes`
   - [ ] Test retry payment API with Postman
   - [ ] Verify cron job runs in production
   - [ ] Check Redis connection (optional in dev)
   - [ ] Verify VNPAY and Stripe credentials

2. **Frontend:**
   - [ ] Test UI on Chrome, Firefox, Safari
   - [ ] Test mobile responsive design
   - [ ] Verify all buttons clickable
   - [ ] Check loading states
   - [ ] Test error scenarios

3. **Database:**
   - [ ] Ensure `awaiting_payment` status in Order enum
   - [ ] Check existing orders won't break

4. **Monitoring:**
   - [ ] Set up logging for retry payment attempts
   - [ ] Monitor cron job execution
   - [ ] Track payment success rate

---

## 📝 Notes

- Cron job runs every **15 minutes**
- Order expires after **1 hour**
- User can retry payment **unlimited times** within 1 hour
- After expiration, must create new order
- Email sent only after **successful payment**
- Custom design editable until order is `processing`

---

## 🔗 Related Documentation

- [OPTIMIZATION_GUIDE.md](backend/OPTIMIZATION_GUIDE.md) - Redis, Queue, Cron setup
- [RETRY_PAYMENT_API.md](backend/RETRY_PAYMENT_API.md) - API documentation + Frontend examples
- [CHANGES_SUMMARY.md](backend/CHANGES_SUMMARY.md) - All changes made in this feature

---

## 💡 Tips for QA

1. **Use Test Payment Cards:**
   - Stripe: `4242 4242 4242 4242`
   - VNPAY: Use sandbox credentials

2. **Speed Up Testing:**
   - Reduce cron interval in `cron.service.js` (for testing only)
   - Manually change `createdAt` in MongoDB

3. **Check Logs:**
   - Backend: `backend/logs/error.log`
   - Frontend: Browser DevTools Console
   - Payment webhooks: Check payment provider dashboard

4. **Common Issues:**
   - Button not appearing? Check order status exactly matches "awaiting_payment"
   - Redirect not working? Check payment API credentials
   - Email not sent? Check Resend API key
   - Cron not running? Check backend server logs
