const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { items } = JSON.parse(event.body);

    // Basic validation: Ensure items is array, each has id/price/quantity=1
    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: 'Invalid items' };
    }
    items.forEach(item => {
      if (!item.id || typeof item.price !== 'number' || item.price <= 0) {
        throw new Error('Invalid item data');
      }
    });

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: { name: item.title },
        unit_amount: Math.round(item.price * 100), // Convert to pence
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://cinema-quad-posters-site.netlify.app/thank-you.html', // Replace with your actual Netlify URL
      cancel_url: 'https://cinema-quad-posters-site.netlify.app/cart.html', // Replace with your actual Netlify URL
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: error.message };
  }
};