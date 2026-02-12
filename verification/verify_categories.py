import json
import os
import re
import sys

def get_category_mappings_keys():
    with open('src/lib/categories.ts', 'r') as f:
        content = f.read()

    match = re.search(r'export const CATEGORY_MAPPINGS = \{([^}]+)\}', content, re.DOTALL)
    if not match:
        print("Could not find CATEGORY_MAPPINGS in src/lib/categories.ts")
        return []

    body = match.group(1)
    # Extract keys
    keys = re.findall(r"^\s*(?:'|\")?([a-zA-Z0-9-]+)(?:'|\")?\s*:", body, re.MULTILINE)
    return keys

def get_mapped_categories(keys):
    with open('src/lib/categories.ts', 'r') as f:
        content = f.read()

    mapped_categories = set()
    for key in keys:
        # regex to find [ ... ] for the key
        # key: [ ... ]
        pattern = r"(?:'|\")?" + re.escape(key) + r"(?:'|\")?\s*:\s*\[(.*?)\]"
        match = re.search(pattern, content, re.DOTALL)
        if match:
            list_content = match.group(1)
            # Extract strings
            cats = re.findall(r"['\"]([^'\"]+)['\"]", list_content)
            for c in cats:
                mapped_categories.add(c)
        else:
            print(f"Warning: Could not parse values for key {key}")
    return mapped_categories

def get_tool_categories():
    categories = set()
    tools_dir = 'content/tools'
    for root, dirs, files in os.walk(tools_dir):
        for file in files:
            if file.endswith('.md'):
                with open(os.path.join(root, file), 'r') as f:
                    content = f.read()
                    # Look for category: "Value" or category: Value
                    match = re.search(r'^category:\s*["\']?([^"\']+\S)["\']?\s*$', content, re.MULTILINE)
                    if match:
                        cat = match.group(1).strip()
                        # remove trailing quote if regex was greedy on non-quote
                        if cat.endswith('"') or cat.endswith("'"):
                            cat = cat[:-1]
                        categories.add(cat)
    return categories

def load_json(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)

def verify():
    mappings_keys = get_category_mappings_keys()
    print(f"Found category slugs in CATEGORY_MAPPINGS: {mappings_keys}")

    # Load translation files
    try:
        en_json = load_json('messages/en.json')
        ja_json = load_json('messages/ja.json')
    except Exception as e:
        print(f"Error loading JSON files: {e}")
        sys.exit(1)

    errors = []

    # Check translations for each slug
    for lang_code, data in [('en', en_json), ('ja', ja_json)]:
        category_page = data.get('CategoryPage', {})
        breadcrumbs = data.get('Breadcrumbs', {})

        for slug in mappings_keys:
            title_key = f"{slug}_title"
            desc_key = f"{slug}_description"

            if title_key not in category_page:
                errors.append(f"[{lang_code}] Missing {title_key} in CategoryPage")
            if desc_key not in category_page:
                errors.append(f"[{lang_code}] Missing {desc_key} in CategoryPage")
            if slug not in breadcrumbs:
                errors.append(f"[{lang_code}] Missing {slug} in Breadcrumbs")

    # Check that all used categories in tools are mapped
    mapped_categories = get_mapped_categories(mappings_keys)
    used_categories = get_tool_categories()

    print(f"Mapped categories: {mapped_categories}")
    print(f"Used categories in tools: {used_categories}")

    missing_mappings = used_categories - mapped_categories
    if missing_mappings:
        errors.append(f"Categories used in tools but not mapped in src/lib/categories.ts: {missing_mappings}")

    if errors:
        print("\nERRORS FOUND:")
        for e in errors:
            print(f"- {e}")
        sys.exit(1)
    else:
        print("\nAll verifications passed!")

if __name__ == "__main__":
    verify()
