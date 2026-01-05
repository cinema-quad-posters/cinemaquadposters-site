export default async (req) => {
    console.log('Function invoked');
    try {
        const bodyText = await req.text(); // Read stream
        console.log('Body text:', bodyText);
        if (!bodyText) throw new Error('No body provided');
        const { items } = JSON.parse(bodyText);
        if (!Array.isArray(items) || items.length === 0) throw new Error('Invalid or empty items array');
        console.log('Parsed items:', items);
        const Stripe = (await import('stripe')).default;
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
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
        return new Response(JSON.stringify({ sessionId: session.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Function error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};