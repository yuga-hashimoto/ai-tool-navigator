from playwright.sync_api import sync_playwright

def verify_submit_form_visual():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Determine base URL (localhost:3000 usually)
        base_url = "http://localhost:3000"

        print(f"Navigating to {base_url}/en/submit")
        try:
            page.goto(f"{base_url}/en/submit")
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return

        # Wait for form to load
        page.wait_for_selector("form")

        # Scroll to the new fields
        pricing_model_select = page.locator("select#pricing_model")
        pricing_model_select.scroll_into_view_if_needed()

        # Take a screenshot
        screenshot_path = "verification/submit_form_pricing.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_submit_form_visual()
