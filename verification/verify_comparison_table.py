from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Wait a bit for server to be fully ready
    time.sleep(10)

    try:
        url = "http://localhost:3000/en/blog/test-comparison-table"
        print(f"Navigating to {url}")
        response = page.goto(url)
        print(f"Status: {response.status}")

        if response.status != 200:
             print(f"Failed to load page: {response.status}")
             # Print body for debugging
             # print(page.content())

        # Wait for the table content
        print("Waiting for table content...")
        page.wait_for_selector("text=ChatGPT", timeout=20000)

        # Take screenshot
        output_path = "verification/comparison_table.png"
        page.screenshot(path=output_path, full_page=True)
        print(f"Screenshot taken at {output_path}")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
