const stripe = require('stripe')('sk_test_51SfRLMA2xzKg16uCC1tgb9LQNtDqYAF3w57TaOczAp1CUOez3gn4GHIVKPp5NhS3OUvzwbxzmPdJud6xeoGt2hR100CZqfafmK'); // Replace with your Stripe SECRET key (test mode first!)
const fs = require('fs');

// Load inventory
let inventory = JSON.parse(fs.readFileSync('inventory.json', 'utf8'));

async function createProducts() {
  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i];
    if (!item.product_id) {  // Only create if missing
      try {
        // Create Product
        const product = await stripe.products.create({
          name: item.title,
          description: item.film_summary,
          images: [`https://www.cinemaquadposters.co.uk/${item.thumbnail}`],  // Optional: Full URL to thumbnail
        });

        // Create Price (one-time, in pence)
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(item.price * 100),  // e.g., 89.99 -> 8999
          currency: 'gbp',
        });

        // Assign ID and log
        item.product_id = product.id;
        console.log(`Created product for "${item.title}": ${product.id}`);
      } catch (error) {
        console.error(`Error creating product for "${item.title}":`, error.message);
      }
    } else {
      console.log(`Skipping "${item.title}" (already has ID: ${item.product_id})`);
    }
  }

  // Save updated inventory.json
  fs.writeFileSync('inventory.json', JSON.stringify(inventory, null, 2));
  console.log('Updated inventory.json with new product IDs.');
}

createProducts().catch(console.error);