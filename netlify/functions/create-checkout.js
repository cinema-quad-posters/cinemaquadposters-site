const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { items, shipping } = JSON.parse(event.body);

    // Basic validation: Ensure items is array, each has id/price/quantity=1
    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: 'Invalid items' };
    }
    items.forEach(item => {
      if (!item.id || typeof item.price !== 'number' || item.price <= 0) {
        throw new Error('Invalid item data');
      }
    });

    // Map shipping options to costs and descriptions (adjust amounts if needed)
    const shippingCosts = {
      uk: { amount: 1000, name: 'UK Postage' }, // £10.00 (in pence)
      europe: { amount: 2000, name: 'Europe Postage' }, // £20.00
      worldwide: { amount: 3000, name: 'Worldwide Postage' } // £30.00
    };

    if (!shipping || !shippingCosts[shipping]) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid shipping option' }) };
    }

    const shippingItem = {
      price_data: {
        currency: 'gbp',
        product_data: { name: shippingCosts[shipping].name },
        unit_amount: shippingCosts[shipping].amount,
      },
      quantity: 1,
    };

    // Create line items for posters + shipping
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: { name: item.title },
        unit_amount: Math.round(item.price * 100), // Convert to pence
      },
      quantity: 1,
    }));
    lineItems.push(shippingItem); // Add shipping as last line item

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://cinema-quad-posters-site.netlify.app/thank-you.html',
      cancel_url: 'https://cinema-quad-posters-site.netlify.app/cart.html',
      shipping_address_collection: {
        allowed_countries: ['GB', 'US', 'CA', 'AU', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'IE', 'AT', 'DK', 'SE', 'NO', 'FI', 'CH', 'PT', 'PL', 'CZ', 'HU', 'GR', 'RO', 'BG', 'HR', 'SI', 'SK', 'LT', 'LV', 'EE', 'LU', 'MT', 'CY'] // Expand as needed for address collection
      },
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