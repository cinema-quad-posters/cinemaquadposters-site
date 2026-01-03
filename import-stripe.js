const fs = require('fs');
const csv = require('csv-parser');
const stripe = require('stripe')('sk_test_51SfRLFAn4nVEPNCVk1ZMglfBfKKQvna2AHT850SAEa33ewNZO8nxxCLStpIPLwZ87WqlvfvfMKKUvZ9vkNkUltks00Zmtgl2Ms'); // Replace with your Stripe secret key

const products = [];

fs.createReadStream('inventory.csv')
    .pipe(csv())
    .on('data', (row) => {
        products.push(row);
    })
    .on('end', async () => {
        const output = []; // For updated CSV with payment links
        output.push(['title', 'variant', 'originally released', 'director', 'actors/0', 'actors/1', 'actors/2', 'actors/3', 'genre/0', 'genre/1', 'condition', 'poster_type', 'poster_size', 'thumbnail', 'hires', 'price', 'film_summary', 'poster_notes', 'tags/0', 'gallery/0', 'sort_title', 'on_sale', 'purchase_date', 'genre/2', 'genre/3', 'actors/4', 'actors/5', 'actors/6', 'tags/1', 'tags/2', 'tags/3', 'tags/4', 'tags/5', 'tags/6', 'tags/7', 'tags/8', 'tags/9', 'actors/7', 'genre/4', 'p', 'actors/8', 'actors/9', 'actors/10', 'actors/11', 'actors/12', 'actors/13', 'actors/14', 'actors/15', 'actors/16', 'genre/5', 'gallery/1', 'gallery/2', 'tags/10', 'tags/11', 'tags/12', 'tags/13', 'payment_link', 'product_id']); // Header with new columns

        for (const p of products) {
            try {
                // Create product
                const product = await stripe.products.create({
                    name: p.title,
                    description: p.film_summary + ' ' + p.poster_notes,
                    images: [p.thumbnail], // Thumbnail; add hires if multiple
                    metadata: {
                        year: p['originally released'],
                        director: p.director,
                        actors: [p['actors/0'], p['actors/1'], p['actors/2'], p['actors/3'], p['actors/4'], p['actors/5'], p['actors/6'], p['actors/7'], p['actors/8'], p['actors/9'], p['actors/10'], p['actors/11'], p['actors/12'], p['actors/13'], p['actors/14'], p['actors/15'], p['actors/16']].filter(a => a && a !== 'nan').join(', '),
                        genre: [p['genre/0'], p['genre/1'], p['genre/2'], p['genre/3'], p['genre/4'], p['genre/5']].filter(g => g && g !== 'nan').join(', '),
                        condition: p.condition,
                        size: p.poster_size,
                        on_sale: p.on_sale,
                        sort_title: p.sort_title,
                        tags: [p['tags/0'], p['tags/1'], p['tags/2'], p['tags/3'], p['tags/4'], p['tags/5'], p['tags/6'], p['tags/7'], p['tags/8'], p['tags/9'], p['tags/10'], p['tags/11'], p['tags/12'], p['tags/13']].filter(t => t && t !== 'nan').join(', '),
                        gallery: [p['gallery/0'], p['gallery/1'], p['gallery/2']].filter(g => g && g !== 'nan').join(', ')
                    }
                });

                // Create price
                const price = await stripe.prices.create({
                    product: product.id,
                    unit_amount: Math.round(parseFloat(p.price) * 100), // Price in pence
                    currency: 'gbp'
                });

                // Create payment link (reverted without success/cancel—defaults to Stripe receipt)
                const paymentLink = await stripe.paymentLinks.create({
                    line_items: [{ price: price.id, quantity: 1 }],
                    shipping_address_collection: { allowed_countries: ['GB', 'US', 'CA', 'AU'] } // Adjust countries
                });

                // Save to output (original row + new columns)
                output.push([
                    p.title, p.variant, p['originally released'], p.director, p['actors/0'], p['actors/1'], p['actors/2'], p['actors/3'], p['genre/0'], p['genre/1'], p.condition, p.poster_type, p.poster_size, p.thumbnail, p.hires, p.price, p.film_summary, p.poster_notes, p['tags/0'], p['gallery/0'], p.sort_title, p.on_sale, p.purchase_date, p['genre/2'], p['genre/3'], p['actors/4'], p['actors/5'], p['actors/6'], p['tags/1'], p['tags/2'], p['tags/3'], p['tags/4'], p['tags/5'], p['tags/6'], p['tags/7'], p['tags/8'], p['tags/9'], p['actors/7'], p['genre/4'], p.p, p['actors/8'], p['actors/9'], p['actors/10'], p['actors/11'], p['actors/12'], p['actors/13'], p['actors/14'], p['actors/15'], p['actors/16'], p['genre/5'], p['gallery/1'], p['gallery/2'], p['tags/10'], p['tags/11'], p['tags/12'], p['tags/13'], paymentLink.url, product.id
                ]);

                console.log(`Imported: ${p.title} - Link: ${paymentLink.url}`);
            } catch (error) {
                console.error(`Error for ${p.title}:`, error.message);
            }
        }

        // Write updated CSV
        fs.writeFileSync('updated_inventory.csv', output.map(row => row.map(field => `"${field ? field.toString().replace(/"/g, '""') : ''}"`).join(',')).join('\n'));
        console.log('Import complete! Check updated_inventory.csv for payment links.');
    });