import json

# Load inventory.json
with open('inventory.json', 'r') as f:
    posters = json.load(f)

# Base URL
base_url = 'https://www.cinemaquadposters.co.uk/poster.html?id='

# Start sitemap
sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sitemap += '    <url><loc>https://www.cinemaquadposters.co.uk/shop.html</loc></url>\n'
sitemap += '    <url><loc>https://www.cinemaquadposters.co.uk/about.html</loc></url>\n'
sitemap += '    <url><loc>https://www.cinemaquadposters.co.uk/faq.html</loc></url>\n'
sitemap += '    <url><loc>https://www.cinemaquadposters.co.uk/terms.html</loc></url>\n'

# Add poster URLs
for poster in posters:
    thumbnail = poster.get('thumbnail', '')
    if thumbnail:
        url = base_url + thumbnail.replace('/', '%2F')  # Encode /
        sitemap += f'    <url><loc>{url}</loc></url>\n'

sitemap += '</urlset>'

# Save to sitemap.xml
with open('sitemap.xml', 'w') as f:
    f.write(sitemap)

print('sitemap.xml generated! Upload to 123-reg root.')
