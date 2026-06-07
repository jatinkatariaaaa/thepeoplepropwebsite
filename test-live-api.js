async function testLiveApi() {
  try {
    const response = await fetch("https://thepeopleprop.live/api/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        price_amount: 299,
        price_currency: "usd",
        order_id: "test_live_123",
        program_key: "1-step",
        size: 25000
      })
    });

    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response Text:", text);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

testLiveApi();
