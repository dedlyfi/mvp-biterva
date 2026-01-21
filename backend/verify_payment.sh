#!/bin/bash

# Configuration
API_URL="http://localhost:3000/dev"
EMAIL="test-user@example.com" # Ensure this user exists or Signup first
AMOUNT=100

echo "🔍 Starting Receive Payment Verification..."

# 0. Ensure User Exists
echo "0️⃣ Creating User (if not exists)..."
curl -s -X POST "$API_URL/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}" > /dev/null
echo "✅ User setup attempt complete."

# 1. Create Invoice
echo "1️⃣ Creating Invoice for $AMOUNT sats..."
RESPONSE=$(curl -s -X POST "$API_URL/invoice" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$EMAIL\", \"amount\": $AMOUNT, \"memo\": \"Test Payment\"}")

echo "Response: $RESPONSE"

PAYMENT_HASH=$(echo $RESPONSE | grep -o '"paymentHash":"[^"]*' | cut -d'"' -f4)
PAYMENT_REQUEST=$(echo $RESPONSE | grep -o '"paymentRequest":"[^"]*' | cut -d'"' -f4)

if [ -z "$PAYMENT_HASH" ]; then
  echo "❌ Failed to create invoice."
  exit 1
fi

echo "✅ Invoice Created!"
echo "   Hash: $PAYMENT_HASH"
echo "   Req: ${PAYMENT_REQUEST:0:20}..."

# 2. Simulate Webhook (LNBits Callback)
echo "2️⃣ Simulating LNBits Webhook..."
WEBHOOK_RESPONSE=$(curl -s -X POST "$API_URL/webhook" \
  -H "Content-Type: application/json" \
  -d "{\"payment_hash\": \"$PAYMENT_HASH\", \"amount\": $AMOUNT, \"checking_id\": \"test_checking_id\"}")

echo "Response: $WEBHOOK_RESPONSE"

if [[ "$WEBHOOK_RESPONSE" == *"Payment processed"* ]] || [[ "$WEBHOOK_RESPONSE" == *"Already processed"* ]]; then
  echo "✅ Webhook Processed Successfully!"
else
  echo "❌ Webhook Failed."
  exit 1
fi

echo "🎉 Verification Complete!"
