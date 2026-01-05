export default async (req, context) => {
    console.log('Function invoked with body:', req.body);
    try {
        if (!req.body) throw new Error('No body provided');
        const { items } = JSON.parse(req.body);
        if (!Array.isArray(items) || items.length === 0) throw new Error('Invalid or empty items array');
        console.log('Parsed items:', items);
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => {
                if (typeof item.price !== 'number' || item.price <= 0) throw new Error('Invalid price');
                return {
                    price_data: {
                        currency: 'gbp',
                        product_data: { name: item.name },
                        unit_amount: item.price,
                    },
                    quantity: item.quantity || 1,
                };
            }),
            mode: 'payment',
            success_url: 'https://cinema-quad-posters-site.netlify.app/thank-you.html',
            cancel_url: 'https://cinema-quad-posters-site.netlify.app/cart.html',
        });
        console.log('Session created:', session.id);
        return { statusCode: 200, body: JSON.stringify({ sessionId: session.id }) };
    } catch (error) {
        console.error('Function error:', error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};