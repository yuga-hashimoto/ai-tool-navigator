from playwright.sync_api import sync_playwright

def verify_account_portal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Dashboard
            print("Navigating to Dashboard...")
            page.goto("http://localhost:3000/en/account")
            # Wait for content to load
            page.wait_for_selector("text=Welcome back, Demo User", timeout=120000)
            page.screenshot(path="verification_dashboard.png")
            print("Dashboard verified.")

            # 2. Orders
            print("Navigating to Orders...")
            page.goto("http://localhost:3000/en/account/orders")
            page.wait_for_selector("text=Order History", timeout=60000)
            page.screenshot(path="verification_orders.png")
            print("Orders verified.")

            # 3. Order Details
            print("Navigating to Order Details...")
            # Click the first order link
            page.click("text=Order #ORD-2025-001")
            page.wait_for_selector("h1:has-text('Order #ORD-2025-001')", timeout=60000)
            page.wait_for_selector("text=AI Writing Assistant Pro")
            page.screenshot(path="verification_order_details.png")
            print("Order Details verified.")

            # 4. Profile
            print("Navigating to Profile...")
            page.goto("http://localhost:3000/en/account/profile")
            page.wait_for_selector("text=Profile Settings", timeout=60000)
            # Fill form
            page.fill("input[name='name']", "Demo User Updated")
            page.click("button:has-text('Save Changes')")
            page.wait_for_selector("text=Profile updated successfully!", timeout=10000)
            page.screenshot(path="verification_profile.png")
            print("Profile verified.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_account_portal()
