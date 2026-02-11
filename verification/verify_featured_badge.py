from playwright.sync_api import sync_playwright

def test_featured_badge():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to homepage...")
            page.goto("http://localhost:3000")
            page.wait_for_selector("text=Featured Tool")

            print("Checking Semrush card...")
            semrush_card = page.locator("div:has-text('Semrush')").first
            semrush_badge = semrush_card.locator("text=Featured Tool")
            if semrush_badge.count() > 0:
                print("Semrush has 'Featured Tool' badge.")
            else:
                print("Semrush DOES NOT have 'Featured Tool' badge.")

            print("Checking Snov.io card...")
            snov_card = page.locator("div:has-text('Snov.io')").first
            snov_badge = snov_card.locator("text=Featured Tool")
            if snov_badge.count() > 0:
                print("Snov.io has 'Featured Tool' badge.")
            else:
                print("Snov.io DOES NOT have 'Featured Tool' badge.")

            page.screenshot(path="verification/verification.png", full_page=True)
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    test_featured_badge()
