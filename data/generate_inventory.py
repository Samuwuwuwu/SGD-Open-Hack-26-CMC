import pandas as pd
import random
from datetime import datetime, timedelta

# Seed for consistent data generation
random.seed(42)

PRODUCT_TEMPLATES = [
    # Fashion - Northstar Apparel / Common Ground
    {"provider": "Northstar Apparel", "category": "fashion", "subcategory": "outerwear", "name": "Oversized Utility Jacket", "base_price": 89.90, "sizes": "S|M|L", "colours": "black|olive", "tags": "oversized|minimal|streetwear|practical", "reasons": ["season_end", "overproduction"]},
    {"provider": "Northstar Apparel", "category": "fashion", "subcategory": "tops", "name": "Heavyweight Boxy Tee", "base_price": 39.90, "sizes": "M|L|XL", "colours": "white|navy", "tags": "minimal|streetwear|basics|casual", "reasons": ["overproduction"]},
    {"provider": "Northstar Apparel", "category": "fashion", "subcategory": "bottoms", "name": "Pleated Cropped Trousers", "base_price": 69.90, "sizes": "S|M", "colours": "charcoal|beige", "tags": "formal|minimal|clean|workwear", "reasons": ["season_end"]},
    {"provider": "Common Ground", "category": "fashion", "subcategory": "outerwear", "name": "Recycled Fleece Pullover", "base_price": 79.00, "sizes": "XS|S|M|L", "colours": "cream|forest_green", "tags": "cozy|outdoor|sustainable|casual", "reasons": ["overproduction"]},
    {"provider": "Common Ground", "category": "fashion", "subcategory": "accessories", "name": "Canvas Tote Bag", "base_price": 24.90, "sizes": "ONE_SIZE", "colours": "natural|black", "tags": "practical|minimal|daily|sustainable", "reasons": ["surplus_stock"]},
    {"provider": "Common Ground", "category": "fashion", "subcategory": "tops", "name": "Striped Organic Cotton Longsleeve", "base_price": 45.00, "sizes": "XXL", "colours": "blue_white", "tags": "casual|classic|nautical", "reasons": ["odd_sizes_left"]},

    # Cosmetics - Glow Theory
    {"provider": "Glow Theory", "category": "cosmetics", "subcategory": "lip Care", "name": "Berry Hydrating Lip Tint", "base_price": 28.00, "sizes": "", "colours": "berry|rose", "tags": "bold|colourful|beauty|compact", "reasons": ["repackaging"]},
    {"provider": "Glow Theory", "category": "cosmetics", "subcategory": "skincare", "name": "Hyaluronic Acid Serum 50ml", "base_price": 42.00, "sizes": "", "colours": "clear", "tags": "skincare|hydration|daily|clean_beauty", "reasons": ["overstock"]},
    {"provider": "Glow Theory", "category": "cosmetics", "subcategory": "skincare", "name": "Calming Green Tea Clay Mask", "base_price": 34.00, "sizes": "", "colours": "green", "tags": "skincare|self_care|relaxing|detox", "reasons": ["season_end"]},

    # Food - Munch Lab & Sunny Side Bakery
    {"provider": "Munch Lab", "category": "food", "subcategory": "snacks", "name": "Truffle & Sea Salt Mushroom Crisps (Pack of 3)", "base_price": 15.00, "sizes": "", "colours": "", "tags": "savory|gourmet|crunchy|snack", "dietary": "vegan|gluten_free", "allergens": "none", "reasons": ["short_shelf_life"]},
    {"provider": "Munch Lab", "category": "food", "subcategory": "drinks", "name": "Sparkling Adaptogen Botanical Elixir", "base_price": 22.00, "sizes": "", "colours": "", "tags": "wellness|refreshing|low_sugar|modern", "dietary": "vegan|halal", "allergens": "none", "reasons": ["overproduction"]},
    {"provider": "Sunny Side Bakery", "category": "food", "subcategory": "pastries", "name": "Chocolate Almond Croissant Box (4-Pack)", "base_price": 18.00, "sizes": "", "colours": "", "tags": "sweet|comfort|shareable|indulgent", "dietary": "vegetarian", "allergens": "gluten|milk|nuts", "reasons": ["daily_surplus"]},

    # Home Goods - Nomad Home
    {"provider": "Nomad Home", "category": "home goods", "subcategory": "decor", "name": "Hand-Poured Soy Wax Candle (Amber & Moss)", "base_price": 32.00, "sizes": "", "colours": "amber", "tags": "cozy|aroma|home|relaxing", "reasons": ["packaging_update"]},
    {"provider": "Nomad Home", "category": "home goods", "subcategory": "kitchen", "name": "Ceramic Matte Mug Set of 2", "base_price": 38.00, "sizes": "", "colours": "terracotta|sand", "tags": "minimal|aesthetic|kitchen|daily", "reasons": ["minor_packaging_damage"]},

    # Electronics & Lifestyle - PocketWorks / Paper Moon
    {"provider": "PocketWorks", "category": "electronics", "subcategory": "audio", "name": "Compact Wireless Earbuds", "base_price": 59.90, "sizes": "", "colours": "matte_black", "tags": "tech|audio|gadget|portable|daily", "reasons": ["discontinued_color"]},
    {"provider": "PocketWorks", "category": "electronics", "subcategory": "chargers", "name": "10000mAh Magnetic Power Bank", "base_price": 45.00, "sizes": "", "colours": "sage_green", "tags": "tech|practical|travel|essential", "reasons": ["overstock"]},
    {"provider": "Paper Moon", "category": "lifestyle", "subcategory": "stationery", "name": "Undated Linen Goal Planner", "base_price": 26.00, "sizes": "", "colours": "forest_green", "tags": "productivity|mindfulness|gift|stationery", "reasons": ["season_end"]},

    # Killer Test Row (Unwanted/Niche item)
    {"provider": "Northstar Apparel", "category": "fashion", "subcategory": "costume", "name": "Neon Yellow Fishnet Vest", "base_price": 49.90, "sizes": "XXS", "colours": "neon_yellow", "tags": "niche|rave|extreme_fashion", "reasons": ["deadstock"]}
]

def generate_inventory(target_count=80):
    rows = []
    today = datetime(2026, 9, 23)

    for i in range(1, target_count + 1):
        template = random.choice(PRODUCT_TEMPLATES)
        
        sku_prefix = template["provider"][:2].upper()
        sku = f"{sku_prefix}-{i:03d}"
        
        # Realistically modest discounts (15% - 40%)
        discount_rate = random.uniform(0.35, 0.50) if template["category"] == "food" else random.uniform(0.15, 0.38)
        retail = template["base_price"]
        surplus = round(retail * (1 - discount_rate), 2)

        expiry = (today + timedelta(days=random.randint(2, 14))).strftime("%Y-%m-%d") if template["category"] == "food" else ""

        row = {
            "sku": sku,
            "provider": template["provider"],
            "category": template["category"],
            "subcategory": template["subcategory"],
            "product_name": template["name"],
            "retail_price": f"{retail:.2f}",
            "surplus_price": f"{surplus:.2f}",
            "stock_qty": random.randint(3, 20),
            "surplus_reason": random.choice(template["reasons"]),
            "days_in_surplus": random.randint(10, 85),
            "expiry_date": expiry,
            "sizes": template.get("sizes", ""),
            "colours": template.get("colours", ""),
            "tags": template["tags"],
            "dietary": template.get("dietary", ""),
            "allergens": template.get("allergens", ""),
            "condition": "new",
            "active": True if template["name"] != "Neon Yellow Fishnet Vest" else False
        }
        rows.append(row)

    df = pd.DataFrame(rows)
    output_path = "data/inventory.xlsx"
    
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Inventory", index=False)
        
    print(f" Success! Created {len(df)} SKUs in '{output_path}' with sheet 'Inventory'.")

if __name__ == "__main__":
    generate_inventory(80)