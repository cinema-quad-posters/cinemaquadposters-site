const fs = require('fs');
const path = require('path');

// esc function (embedded for generation)
function esc(str) {
    return (str || '').replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;')
                      .replace(/'/g, '&#039;');
}

// Load inventory
const inventory = JSON.parse(fs.readFileSync('inventory.json', 'utf8'));

// Load poster.html template
const template = fs.readFileSync('poster.html', 'utf8');

// Create static-posters folder if not exists (new name to avoid confusion with hi-res /posters)
if (!fs.existsSync('static-posters')) {
    fs.mkdirSync('static-posters');
}

inventory.forEach(p => {
    // Safe slug from title (e.g., "ABBA - THE MOVIE" -> "abba-the-movie")
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();

    // Embed poster data as JS var
    const embeddedData = `<script>const posterData = ${JSON.stringify(p)};</script>`;

    // JSON-LD for Snipcart crawler/SEO (product schema)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": esc(p.title),
        "description": esc(p.film_summary),
        "image": p.thumbnail,
        "offers": {
            "@type": "Offer",
            "price": p.price,
            "priceCurrency": "GBP",
            "itemCondition": "https://schema.org/UsedCondition",
            "availability": "https://schema.org/InStock"
        }
    };
    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

    // Dynamic metas for SEO (title/description)
    const metas = `
        <title>$$ {esc(p.title)} ( $${p['originally released'] || 'N/A'}) – Original British Quad Poster – Cinema Quad Posters</title>
        <meta name="description" content="${esc(p.film_summary.slice(0, 160))}... Buy this collectible cinema poster.">
    `;

    // Insert into template
    let newHtml = template.replace('</head>', `${metas}${embeddedData}${jsonLdScript}</head>`);

    // Save static file in new folder
    fs.writeFileSync(`static-posters/${slug}.html`, newHtml);
});

console.log('Static posters generated! Upload /static-posters folder to server.');