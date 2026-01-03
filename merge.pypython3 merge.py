import json
import csv

# Load inventory.json
with open('inventory.json', 'r') as f:
    json_data = json.load(f)

# Load updated_inventory.csv as dict (title: payment_link)
csv_dict = {}
with open('updated_inventory.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['title'] and row['payment_link']:
            csv_dict[row['title']] = row['payment_link']

# Update JSON with payment_links
for item in json_data:
    title = item.get('title')
    if title in csv_dict:
        item['payment_link'] = csv_dict[title]

# Save updated JSON
with open('inventory_updated.json', 'w') as f:
    json.dump(json_data, f, indent=4)

print('Merge complete! Upload inventory_updated.json to 123-reg.')
