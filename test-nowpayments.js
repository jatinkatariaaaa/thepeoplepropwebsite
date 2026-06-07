async function testApi() {
  const payload = {
    price_amount: 50.0,
    price_currency: 'usd',
    order_id: 'test_123',
    order_description: 'Test',
    success_url: 'https://thepeopleprop.live/success',
    cancel_url: 'https://thepeopleprop.live/cancel'
  };

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": "1XVQ4Z2-53TMQ6K-HX2QR80-1S5QYXM",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", data);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

testApi();
