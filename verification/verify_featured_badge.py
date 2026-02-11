from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000")

    # Wait for the page to load
    page.wait_for_selector("text=Featured Tools")

    # Take a full page screenshot
    page.screenshot(path="verification/featured_tools.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
