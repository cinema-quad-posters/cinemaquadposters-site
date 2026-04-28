// create-products.js  (Improved version)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');

if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ ERROR: STRIPE_SECRET_KEY environment variable is not set!");
    console.error("Please set it first, then run the script again.");
    process.exit(1);
}

let inventory = JSON.parse(fs.readFileSync('inventory.json', 'utf8'));

async function createProducts() {
    console.log(`Starting to process ${inventory.length} posters...\n`);

    for (let i = 0; i < inventory.length; i++) {
        const item = inventory[i];

        if (item.product_id) {
            console.log(`⏭️  Skipping "${item.title}" (already has ID: ${item.product_id})`);
            continue;
        }

        try {
            // Create Stripe Product
            const product = await stripe.products.create({
                name: item.title + (item.variant ? ` - ${item.variant}` : ''),
                description: item.film_summary || "Original British cinema quad poster",
                images: [`https://www.cinemaquadposters.co.uk/${item.thumbnail}`],
                metadata: {
                    originally_released: item['originally released'] || '',
                    director: item.director || '',
                    condition: item.condition || ''
                }
            });

            // Create Price (in pence)
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(item.price * 100),
                currency: 'gbp',
            });

            item.product_id = product.id;

            console.log(`✅ Created product for "${item.title}": ${product.id}`);

        } catch (error) {
            console.error(`❌ Error creating product for "${item.title}":`, error.message);
        }
    }

    // Save updated inventory (pretty-printed)
    fs.writeFileSync('inventory.json', JSON.stringify(inventory, null, 2));
    console.log('\n🎉 Finished! inventory.json has been updated with new Stripe product IDs.');
}

createProducts().catch(console.error);