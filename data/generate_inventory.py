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

    # Pre-loved / recommerce inventory
    {"provider": "Second Spin Studio", "category": "fashion", "subcategory": "outerwear", "name": "Pre-Loved Denim Overshirt", "price": 74.00, "stock": 2, "sizes": "M|L", "colours": "indigo|faded_blue", "tags": "fashion|classic|edgy|practical|bold|streetwear", "reason": "quality_checked_return", "discount_mode": "markdown", "discount_pct": 30, "show_discount": True, "condition": "preloved_like_new"},
    {"provider": "LoopBack Tech", "category": "electronics", "subcategory": "audio", "name": "Refurbished Pocket Headphones", "price": 52.00, "stock": 2, "colours": "matte_black|silver", "tags": "tech|portable|practical|energetic|audio", "reason": "quality_checked_return", "discount_mode": "protected", "discount_pct": 0, "show_discount": False, "condition": "preloved_like_new"},
    {"provider": "Good Again Goods", "category": "home goods", "subcategory": "lighting", "name": "Pre-Loved Ceramic Table Lamp", "price": 36.00, "stock": 3, "colours": "cream|terracotta", "tags": "home|cozy|calm|decorative|practical|minimal", "reason": "display_refresh", "discount_mode": "markdown", "discount_pct": 35, "show_discount": True, "condition": "preloved_good"},
    {"provider": "Paper Again", "category": "stationery", "subcategory": "planners", "name": "Like-New Desk Planner Folio", "price": 18.00, "stock": 4, "colours": "forest_green|cream", "tags": "stationery|practical|minimal|calm|clean", "reason": "quality_checked_return", "discount_mode": "protected", "discount_pct": 0, "show_discount": False, "condition": "preloved_like_new"},
    {"provider": "Archive Again", "category": "fashion", "subcategory": "accessories", "name": "Pre-Loved Silk Scarf", "price": 28.00, "stock": 3, "colours": "berry|navy", "tags": "fashion|classic|colourful|bold|shareable", "reason": "display_refresh", "discount_mode": "markdown", "discount_pct": 25, "show_discount": True, "condition": "preloved_good"},
]

# The workbook is the API's source for the visible mystery-box clues.
# Colours describe the item or its demo packaging where appropriate.
MYSTERY_FACTS = {
    1: ("black", "olive", "cotton blend"),
    2: ("oat", "forest green", "cotton knit"),
    3: ("natural", "colourful", "recycled cotton"),
    4: ("charcoal", "beige", "polyester blend"),
    5: ("neon yellow", "black", "polyester mesh"),
    6: ("berry", "rose", "wax and botanical oils"),
    7: ("clear", "white", "water-based serum"),
    8: ("green", "cream", "clay and green tea"),
    9: ("yellow", "white", "shea butter and citrus oils"),
    10: ("black", "cream", "potato and mushroom seasoning"),
    11: ("green", "gold", "sparkling water and botanical extracts"),
    12: ("brown", "cream", "wheat pastry and almond filling"),
    13: ("orange", "white", "oats and citrus"),
    14: ("green", "cream", "lentils and herbs"),
    15: ("green", "terracotta", "seed paper and potting mix"),
    16: ("navy", "sand", "recycled polyester fleece"),
    17: ("lavender", "cream", "bath salts and lavender"),
    18: ("blue", "silver", "recycled steel"),
    19: ("amber", "cream", "soy wax"),
    20: ("terracotta", "sand", "ceramic"),
    21: ("speckled", "cream", "terrazzo composite"),
    22: ("clear", "smoke", "reclaimed glass"),
    23: ("matte black", "white", "plastic and silicone"),
    24: ("sage green", "black", "aluminium and plastic"),
    25: ("black", "colourful", "braided nylon and copper"),
    26: ("black", "silver", "plastic and foam"),
    27: ("forest green", "cream", "linen and paper"),
    28: ("colourful", "natural", "recycled paper"),
    29: ("blue", "coral", "fabric and rubber"),
    30: ("brass", "black", "brass"),
    31: ("indigo", "faded blue", "cotton denim"),
    32: ("matte black", "silver", "recycled plastic and metal"),
    33: ("cream", "terracotta", "ceramic and recycled metal"),
    34: ("forest green", "cream", "linen and recycled paper"),
    35: ("berry", "navy", "silk"),
}

MYSTERY_TEASERS = {
    1: "For the days you leave with no fixed plan.",
    2: "A softer pace can still make an entrance.",
    3: "For the detours that become the best part.",
    4: "A little structure for whatever comes next.",
    5: "A bright wildcard for after-dark plans.",
    6: "A tiny confidence boost for unexpected plans.",
    7: "A calm reset in the middle of everything.",
    8: "When the day asks you to slow down.",
    9: "A little sunshine for the in-between moments.",
    10: "The break with a sense of adventure.",
    11: "For the toast nobody saw coming.",
    12: "A cozy pause worth sharing.",
    13: "A bright little detour between plans.",
    14: "For an easy gathering that lasts longer.",
    15: "A fresh start in a small space.",
    16: "For journeys with room to get comfortable.",
    17: "An invitation to make ordinary evenings quieter.",
    18: "A practical sidekick with a little wanderlust.",
    19: "A small ritual for winding down.",
    20: "For slow mornings and familiar company.",
    21: "A place for the little things you keep.",
    22: "The everyday moment, made a bit more special.",
    23: "A private soundtrack for your next move.",
    24: "A little backup for the unplanned day.",
    25: "Small connections can take you far.",
    26: "A focused moment in a noisy world.",
    27: "Plans feel lighter when there is room to dream.",
    28: "For ideas that arrive out of nowhere.",
    29: "A fresh mood for your usual space.",
    30: "A small detail for your next favorite page.",
    31: "A second-life layer with plenty of stories left.",
    32: "Checked, cleaned, and ready for another soundtrack.",
    33: "A warm glow with a little more history.",
    34: "A tidy desk companion looking for a new rhythm.",
    35: "A well-loved accent for a brighter detour.",
}


def generate_inventory():
    today = datetime(2026, 9, 23)
    rows = []

    for index, product in enumerate(PRODUCTS, start=1):
        category = product["category"]
        primary_colour, secondary_colour, materials = MYSTERY_FACTS[index]
        rows.append({
            "sku": f"RO-{index:03d}",
            "provider": product["provider"],
            "category": category,
            "subcategory": product["subcategory"],
            "product_name": product["name"],
            "image_url": product.get("image_url", ""),
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
            "primary_colour": primary_colour,
            "secondary_colour": secondary_colour,
            "materials": materials,
            "mystery_teaser": MYSTERY_TEASERS[index],
            "tags": product["tags"],
            "dietary": product.get("dietary", ""),
            "allergens": product.get("allergens", ""),
            "condition": product.get("condition", "new"),
            "active": product.get("active", True),
        })

    output_path = "data/inventory.xlsx"
    dataframe = pd.DataFrame(rows)
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        dataframe.to_excel(writer, sheet_name="Inventory", index=False)

    print(f"Created {len(rows)} distinct products in '{output_path}'.")


if __name__ == "__main__":
    generate_inventory()
