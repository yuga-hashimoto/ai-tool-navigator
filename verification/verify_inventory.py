from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Visit the Inventory Dashboard
    print("Navigating to /admin/inventory")
    page.goto("http://localhost:3000/en/admin/inventory")
    # Wait for the main heading
    page.wait_for_selector("h1", timeout=30000)

    # Take screenshot of Dashboard
    print("Taking screenshot of Dashboard")
    page.screenshot(path="verification/dashboard.png")

    # Visit Warehouses
    print("Navigating to /admin/inventory/warehouses")
    page.goto("http://localhost:3000/en/admin/inventory/warehouses")
    page.wait_for_selector("table")

    # Take screenshot of Warehouses
    print("Taking screenshot of Warehouses")
    page.screenshot(path="verification/warehouses.png")

    # Visit Transfers
    print("Navigating to /admin/inventory/transfers")
    page.goto("http://localhost:3000/en/admin/inventory/transfers")
    page.wait_for_selector("table")

    # Take screenshot of Transfers
    print("Taking screenshot of Transfers")
    page.screenshot(path="verification/transfers.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
