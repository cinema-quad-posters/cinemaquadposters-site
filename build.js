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

// Create static-posters folder if not exists
if (!fs.existsSync('static-posters')) {
    fs.mkdirSync('static-posters');
}

// Array to collect sitemap URLs
const sitemapUrls = [
    '<url><loc>https://www.cinemaquadposters.co.uk/shop.html</loc></url>',
    '<url><loc>https://www.cinemaquadposters.co.uk/about.html</loc></url>',
    '<url><loc>https://www.cinemaquadposters.co.uk/faq.html</loc></url>',
    '<url><loc>https://www.cinemaquadposters.co.uk/terms.html</loc></url>',
    '<url><loc>https://www.cinemaquadposters.co.uk/cart.html</loc></url>',
    '<url><loc>https://www.cinemaquadposters.co.uk/thank-you.html</loc></url>'
];

inventory.forEach(p => {
    // Safe slug from title + variant (e.g., "Grease" + "40th Anniversary re-release" -> "grease-40th-anniversary-re-release")
    let slug = p.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    if (p.variant) {
    const variantSlug = p.variant.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    slug += `-${variantSlug}`;
    }

    // Add to sitemap (update to use new slug)
    sitemapUrls.push(`<url><loc>https://www.cinemaquadposters.co.uk/static-posters/${slug}.html</loc></url>`);

    // Embed poster data as JS var
    const embeddedData = `<script>const posterData = ${JSON.stringify(p)};</script>`;

    // JSON-LD for SEO (product schema)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": esc(p.title),
        "description": esc(p.film_summary),
        "image": `https://www.cinemaquadposters.co.uk/${p.thumbnail}`,
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
        <title>${esc(p.title)} (${p['originally released'] || 'N/A'}) – Original British Quad Poster – Cinema Quad Posters</title>
        <meta name="description" content="${esc(p.film_summary.slice(0, 160))}... Buy this collectible cinema poster.">
    `;

    const ogMetas = `
    <meta property="og:title" content="${esc(p.title)} (${p['originally released'] || 'N/A'}) – Original British Quad Poster – Cinema Quad Posters">
    <meta property="og:description" content="${esc(p.film_summary.slice(0, 200))}... Buy this collectible cinema poster.">
    <meta property="og:image" content="https://www.cinemaquadposters.co.uk/${p.thumbnail}">
    <meta property="og:type" content="product">
    <meta property="og:url" content="https://www.cinemaquadposters.co.uk/static-posters/${slug}.html">
    `;

    // Insert into template (replace placeholder in <head>)
    let newHtml = template.replace('</head>', `${metas}${ogMetas}${embeddedData}${jsonLdScript}</head>`);

    // Save static file
    fs.writeFileSync(`static-posters/${slug}.html`, newHtml);
});

// Generate sitemap.xml
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemapUrls.join('\n    ')}
</urlset>`;
fs.writeFileSync('sitemap.xml', sitemapContent);

console.log('Static posters and sitemap generated! Upload/commit to server/GitHub.');