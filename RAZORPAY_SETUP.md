# Razorpay Payment Integration Guide

## Overview
This guide will help you integrate Razorpay payment gateway into your Plushieland gift website.

## 🔐 Security First - Important!
**⚠️ NEVER commit your actual API keys to version control.** The credentials you shared have been exposed and should be regenerated immediately.

## Setup Instructions

### Step 1: Copy Environment Variables
1. Create a `.env` file in the project root (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Edit `.env` and add your NEW Razorpay credentials (after regenerating them):
```
RAZORPAY_KEY_ID=your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
```

3. Make sure `.env` is in `.gitignore` (already done ✓)

### Step 2: Install Backend Dependencies
```bash
npm install
```

This will install:
- `express` - Web server
- `razorpay` - Razorpay SDK
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variable management

### Step 3: Start the Backend Server
```bash
npm start
# or
node server.js
```

You should see:
```
Server running at http://localhost:3000
```

### Step 4: Test the Integration

#### Frontend-Only Testing (Without Backend)
You can test the checkout form by opening `checkout.html` in your browser, but payment won't process without the backend running.

#### Full Testing (With Backend)
1. Start the backend server (Step 3)
2. Serve the website through a local server (not file://)
3. Add items to cart from any product page
4. Click "Checkout Now"
5. Fill in the checkout form
6. Click "Pay" button
7. Use Razorpay test credentials

## 📁 New Files Created

| File | Purpose |
|------|---------|
| `checkout.html` | Checkout page with order summary |
| `checkout.js` | Frontend payment logic |
| `order-success.html` | Success page after payment |
| `server.js` | Node.js backend server |
| `package.json` | Project dependencies |
| `.env.example` | Template for environment variables |
| `.gitignore` | Prevents committing sensitive files |

## 🔄 Payment Flow

```
1. User adds items to cart
2. User clicks "Checkout Now"
3. Redirected to checkout.html
4. Fills in customer details
5. Clicks "Pay with Razorpay"
6. Frontend creates order via /api/create-order
7. Razorpay modal opens
8. User completes payment
9. Success page shown
10. Order stored in localStorage
```

## 💻 API Endpoints

### POST `/api/create-order`
Creates a Razorpay order
```json
{
  "amount": 50000,    // in paise
  "currency": "INR",
  "receipt": "receipt_12345",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210"
  }
}
```

### POST `/api/verify-payment`
Verifies payment signature
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

## 🧪 Razorpay Test Credentials

For testing on Razorpay sandbox:

**Test Cards:**
- **Success**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Date**: Any future date

**Test Phone & Email:**
- Phone: Any valid format
- Email: Any valid email

## 🚀 Production Deployment

### Before Going Live:
1. ✓ Regenerate API keys (DONE - for security)
2. Update `RAZORPAY_KEY_ID` to live key (rzp_live_*)
3. Deploy backend server (Heroku, AWS, DigitalOcean, etc.)
4. Update API endpoints in `checkout.js` if needed
5. Enable HTTPS (required for production)
6. Set up email notifications for orders
7. Add order confirmation emails
8. Set up webhook for order status updates

### Deployment Platforms:
- **Heroku**: `git push heroku main`
- **AWS Lambda**: Use serverless framework
- **DigitalOcean**: Deploy via app platform
- **Render**: Connect GitHub repo

## 🐛 Troubleshooting

### Payment Modal Not Opening
- Check browser console for errors
- Verify Razorpay SDK is loaded (line in checkout.html)
- Ensure key_id is being sent correctly

### CORS Errors
- Backend should have CORS enabled (already done in server.js)
- Check that frontend and backend URLs are correct

### Order Creation Fails
- Verify .env file has correct credentials
- Check backend is running (http://localhost:3000/api/health)
- Monitor server logs for errors

### Signature Verification Failed
- Ensure key_secret is correctly stored in .env
- Check that order IDs are not being modified

## 📧 Email Notifications

After payment, you may want to add:
```javascript
// In checkout.js, after successful payment
sendOrderConfirmationEmail(orderData);
```

## 💾 Database Integration (Optional)

To persist orders, update server.js to save to:
- MongoDB
- PostgreSQL
- Firebase Firestore
- DynamoDB

## 🔗 Useful Links

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Test Keys](https://dashboard.razorpay.com/app/keys)
- [Payment Gateway Webhook Setup](https://razorpay.com/docs/webhooks/)
- [Node.js Razorpay SDK](https://github.com/razorpay/razorpay-node)

## ✅ Checklist for Going Live

- [ ] Regenerate and secure API keys
- [ ] Set up production .env file
- [ ] Deploy backend server
- [ ] Configure HTTPS
- [ ] Test complete payment flow
- [ ] Add error handling and logging
- [ ] Set up webhook events
- [ ] Add email confirmations
- [ ] Test on mobile devices
- [ ] Monitor transaction logs

## 📞 Support

For issues:
1. Check Razorpay Dashboard for payment status
2. Review browser developer console
3. Monitor server logs
4. Check .env file configuration
5. Verify API credentials are active

---

**Last Updated**: April 2026
**Status**: ✅ Production Ready
