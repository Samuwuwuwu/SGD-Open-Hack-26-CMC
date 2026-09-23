import pandas as pd
from datetime import datetime, timedelta


PRODUCTS = [
    # Fashion
    {"provider": "Northstar Apparel", "category": "fashion", "subcategory": "outerwear", "name": "Oversized Utility Jacket", "price": 89.90, "stock": 7, "sizes": "S|M|L", "colours": "black|olive", "tags": "bold|edgy|fashion|practical|adventurous|streetwear", "reason": "season_end", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},
    {"provider": "Common Ground", "category": "fashion", "subcategory": "knitwear", "name": "Ribbed Everyday Cardigan", "price": 58.00, "stock": 9, "sizes": "S|M|L", "colours": "oat|forest_green", "tags": "cozy|classic|fashion|comfort|natural|clean", "reason": "overproduction", "discount_mode": "markdown", "discount_pct": 20, "show_discount": True},
    {"provider": "Common Ground", "category": "fashion", "subcategory": "accessories", "name": "Patchwork Market Tote", "price": 32.00, "stock": 14, "sizes": "ONE_SIZE", "colours": "natural|colourful", "tags": "practical|minimal|fashion|portable|shareable|playful", "reason": "surplus_stock", "discount_mode": "markdown", "discount_pct": 25, "show_discount": True},
    {"provider": "Northstar Apparel", "category": "fashion", "subcategory": "bottoms", "name": "Pleated Cropped Trousers", "price": 69.90, "stock": 4, "sizes": "S|M", "colours": "charcoal|beige", "tags": "classic|clean|fashion|practical|minimal", "reason": "season_end", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},
    {"provider": "Northstar Apparel", "category": "fashion", "subcategory": "costume", "name": "Neon Yellow Fishnet Vest", "price": 49.90, "stock": 1, "sizes": "XXS", "colours": "neon_yellow", "tags": "edgy|dark|fashion|bold|niche|rave", "reason": "deadstock", "discount_mode": "protected", "discount_pct": 0, "show_discount": False, "active": False},

    # Cosmetics
    {"provider": "Glow Theory", "category": "cosmetics", "subcategory": "lip care", "name": "Berry Hydrating Lip Tint", "price": 28.00, "stock": 12, "colours": "berry|rose", "tags": "bold|colourful|beauty|portable|playful|cute", "reason": "repackaging", "discount_mode": "markdown", "discount_pct": 20, "show_discount": True},
    {"provider": "Glow Theory", "category": "cosmetics", "subcategory": "skincare", "name": "Hyaluronic Acid Serum 50ml", "price": 42.00, "stock": 8, "colours": "clear", "tags": "clean|calm|beauty|natural|practical|skincare", "reason": "overstock", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},
    {"provider": "Glow Theory", "category": "cosmetics", "subcategory": "skincare", "name": "Calming Green Tea Clay Mask", "price": 34.00, "stock": 10, "colours": "green", "tags": "calm|natural|beauty|cozy|clean|skincare", "reason": "season_end", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},
    {"provider": "Glow Theory", "category": "cosmetics", "subcategory": "body care", "name": "Citrus Hand Cream Duo", "price": 22.00, "stock": 16, "colours": "yellow|white", "tags": "cute|portable|beauty|natural|clean|shareable", "reason": "packaging_update", "discount_mode": "markdown", "discount_pct": 15, "show_discount": True},

    # Food and snacks
    {"provider": "Munch Lab", "category": "food", "subcategory": "snacks", "name": "Truffle Sea Salt Mushroom Crisps", "price": 15.00, "stock": 18, "tags": "food|shareable|adventurous|bold|vegan", "dietary": "vegan|gluten_free", "allergens": "none", "reason": "short_shelf_life", "discount_mode": "markdown", "discount_pct": 35, "show_discount": True},
    {"provider": "Munch Lab", "category": "food", "subcategory": "drinks", "name": "Sparkling Botanical Elixir", "price": 22.00, "stock": 13, "tags": "food|energetic|adventurous|portable|vegan", "dietary": "vegan|halal", "allergens": "none", "reason": "overproduction", "discount_mode": "markdown", "discount_pct": 25, "show_discount": True},
    {"provider": "Sunny Side Bakery", "category": "food", "subcategory": "pastries", "name": "Chocolate Almond Croissant Box", "price": 18.00, "stock": 5, "tags": "food|cozy|comfort|shareable|classic", "dietary": "vegetarian", "allergens": "gluten|milk|nuts", "reason": "daily_surplus", "discount_mode": "markdown", "discount_pct": 30, "show_discount": True},
    {"provider": "Good Loop Pantry", "category": "food", "subcategory": "snacks", "name": "Citrus Oat Snack Box", "price": 19.00, "stock": 11, "tags": "food|practical|shareable|playful|vegan", "dietary": "vegan", "allergens": "gluten", "reason": "short_shelf_life", "discount_mode": "markdown", "discount_pct": 25, "show_discount": True},
    {"provider": "Good Loop Pantry", "category": "food", "subcategory": "snacks", "name": "Herbed Lentil Crisp Kit", "price": 21.00, "stock": 9, "tags": "food|practical|natural|shareable|vegan", "dietary": "vegan", "allergens": "none", "reason": "surplus_stock", "discount_mode": "markdown", "discount_pct": 20, "show_discount": True},

    # Lifestyle
    {"provider": "Little Orbit", "category": "lifestyle", "subcategory": "gardening", "name": "Pocket Garden Starter", "price": 32.00, "stock": 6, "colours": "green|terracotta", "tags": "natural|calm|home|decorative|playful|slow", "reason": "season_end", "discount_mode": "markdown", "discount_pct": 20, "show_discount": True},
    {"provider": "Trail & Tide", "category": "lifestyle", "subcategory": "travel", "name": "Compact Travel Blanket", "price": 48.00, "stock": 5, "colours": "navy|sand", "tags": "cozy|portable|comfort|practical|calm|adventurous", "reason": "overproduction", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},
    {"provider": "Little Orbit", "category": "lifestyle", "subcategory": "wellness", "name": "Lavender Bath Soak Pouch", "price": 26.00, "stock": 8, "colours": "lavender", "tags": "calm|cozy|natural|beauty|shareable|slow", "reason": "packaging_update", "discount_mode": "markdown", "discount_pct": 15, "show_discount": False},
    {"provider": "Trail & Tide", "category": "lifestyle", "subcategory": "hydration", "name": "Recycled Steel Water Bottle", "price": 36.00, "stock": 10, "colours": "blue|silver", "tags": "practical|portable|energetic|natural|shareable", "reason": "discontinued_colour", "discount_mode": "markdown", "discount_pct": 20, "show_discount": True},

    # Home goods
    {"provider": "Nomad Home", "category": "home goods", "subcategory": "decor", "name": "Hand-Poured Soy Wax Candle", "price": 32.00, "stock": 9, "colours": "amber|cream", "tags": "cozy|calm|home|decorative|natural|slow", "reason": "packaging_update", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},
    {"provider": "Nomad Home", "category": "home goods", "subcategory": "kitchen", "name": "Ceramic Matte Mug Set", "price": 38.00, "stock": 5, "colours": "terracotta|sand", "tags": "minimal|cozy|home|practical|classic", "reason": "minor_packaging_damage", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},
    {"provider": "Little Orbit Home", "category": "home goods", "subcategory": "decor", "name": "Terrazzo Catch-All Tray", "price": 44.00, "stock": 3, "colours": "speckled|cream", "tags": "bold|decorative|home|practical|minimal", "reason": "display_refresh", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},
    {"provider": "Little Orbit Home", "category": "home goods", "subcategory": "kitchen", "name": "Reclaimed Glass Tumbler", "price": 28.00, "stock": 12, "colours": "clear|smoke", "tags": "minimal|portable|home|shareable|practical", "reason": "surplus_stock", "discount_mode": "markdown", "discount_pct": 15, "show_discount": True},

    # Electronics and accessories
    {"provider": "PocketWorks", "category": "electronics", "subcategory": "audio", "name": "Compact Wireless Earbuds", "price": 59.90, "stock": 6, "colours": "matte_black|white", "tags": "tech|portable|energetic|dark|audio", "reason": "discontinued_colour", "discount_mode": "markdown", "discount_pct": 25, "show_discount": True},
    {"provider": "PocketWorks", "category": "electronics", "subcategory": "chargers", "name": "10000mAh Magnetic Power Bank", "price": 45.00, "stock": 7, "colours": "sage_green|black", "tags": "tech|portable|practical|adventurous", "reason": "overstock", "discount_mode": "markdown", "discount_pct": 20, "show_discount": True},
    {"provider": "PocketWorks", "category": "electronics", "subcategory": "accessories", "name": "Braided USB-C Cable Set", "price": 19.00, "stock": 15, "colours": "black|colourful", "tags": "tech|practical|portable|clean|shareable", "reason": "overproduction", "discount_mode": "markdown", "discount_pct": 15, "show_discount": True},
    {"provider": "Signal Room", "category": "electronics", "subcategory": "audio", "name": "Single-Ear Studio Monitor", "price": 89.00, "stock": 1, "colours": "black", "tags": "tech|audio|dark|edgy|niche", "reason": "discontinued_model", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},

    # Stationery
    {"provider": "Paper Moon", "category": "stationery", "subcategory": "planners", "name": "Undated Linen Goal Planner", "price": 26.00, "stock": 13, "colours": "forest_green|cream", "tags": "stationery|calm|practical|minimal|clean", "reason": "season_end", "discount_mode": "markdown", "discount_pct": 20, "show_discount": True},
    {"provider": "Paper Moon", "category": "stationery", "subcategory": "notebooks", "name": "Recycled Dot Grid Notebook", "price": 16.00, "stock": 20, "colours": "colourful|natural", "tags": "stationery|playful|practical|colourful|shareable", "reason": "surplus_stock", "discount_mode": "markdown", "discount_pct": 10, "show_discount": True},
    {"provider": "Loop & Light", "category": "stationery", "subcategory": "desk accessories", "name": "Colour Block Desk Mat", "price": 52.00, "stock": 4, "colours": "blue|coral|cream", "tags": "stationery|bold|colourful|practical|decorative", "reason": "display_refresh", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},
    {"provider": "Paper Moon", "category": "stationery", "subcategory": "accessories", "name": "Brass Bookmark Set", "price": 24.00, "stock": 7, "colours": "brass|black", "tags": "stationery|minimal|classic|decorative|shareable", "reason": "packaging_update", "discount_mode": "protected", "discount_pct": 0, "show_discount": False},
]


def generate_inventory():
    today = datetime(2026, 9, 23)
    rows = []

    for index, product in enumerate(PRODUCTS, start=1):
        category = product["category"]
        rows.append({
            "sku": f"RO-{index:03d}",
            "provider": product["provider"],
            "category": category,
            "subcategory": product["subcategory"],
            "product_name": product["name"],
            "retail_price": round(product["price"], 2),
            "surplus_price": round(product["price"] * (1 - product["discount_pct"] / 100), 2),
            "discount_mode": product["discount_mode"],
            "discount_pct": product["discount_pct"],
            "show_discount": product["show_discount"],
            "stock_qty": product["stock"],
            "surplus_reason": product["reason"],
            "days_in_surplus": 10 + (index * 7) % 76,
            "expiry_date": (today + timedelta(days=2 + index % 13)).strftime("%Y-%m-%d") if category == "food" else "",
            "sizes": product.get("sizes", ""),
            "colours": product.get("colours", ""),
            "tags": product["tags"],
            "dietary": product.get("dietary", ""),
            "allergens": product.get("allergens", ""),
            "condition": "new",
            "active": product.get("active", True),
        })

    output_path = "data/inventory.xlsx"
    dataframe = pd.DataFrame(rows)
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        dataframe.to_excel(writer, sheet_name="Inventory", index=False)

    print(f"Created {len(rows)} distinct products in '{output_path}'.")


if __name__ == "__main__":
    generate_inventory()
