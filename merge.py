import json
import csv

# Load inventory.json
with open('inventory.json', 'r') as f:
    json_data = json.load(f)

# Load updated_inventory.csv as dict (title: {'payment_link': link, 'product_id': id})
csv_dict = {}
with open('updated_inventory.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['title']:
            csv_dict[row['title']] = {
                'payment_link': row['payment_link'],
                'product_id': row['product_id']
            }

# Update JSON with payment_link and product_id
for item in json_data:
    title = item.get('title')
    if title in csv_dict:
        item['payment_link'] = csv_dict[title]['payment_link']
        item['product_id'] = csv_dict[title]['product_id']

# Save updated JSON
with open('inventory_updated.json', 'w') as f:
    json.dump(json_data, f, indent=4)

print('Merge complete! Upload inventory_updated.json to 123-reg.')
