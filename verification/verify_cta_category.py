from playwright.sync_api import sync_playwright
import urllib.request
import time

def wait_for_server(url, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url) as response:
                if response.getcode() == 200:
                    return True
        except:
            time.sleep(1)
    return False

def run_cuj(page):
    print("Navigating to category page...")
    page.goto("http://localhost:3000/en/category/ai-assistant")
    page.wait_for_timeout(2000)

    print("Taking screenshot of category CTA...")
    # Check if compare href exists (maybe video doesn't have it)
    if page.locator("text=Compare this category").first.is_visible():
        page.locator("text=Compare this category").first.scroll_into_view_if_needed()
        page.wait_for_timeout(1000)
        page.screenshot(path="/app/verification/screenshots/category_cta.png")

        print("Hovering over category CTA...")
        page.locator("text=Compare this category").first.hover()
        page.wait_for_timeout(1000)
        page.screenshot(path="/app/verification/screenshots/category_cta_hover.png")
    else:
        print("CTA not found. Trying another category...")
        page.goto("http://localhost:3000/en/category/writing")
        page.wait_for_timeout(2000)
        page.locator("text=Compare this category").first.scroll_into_view_if_needed()
        page.wait_for_timeout(1000)
        page.screenshot(path="/app/verification/screenshots/category_cta.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    if not wait_for_server("http://localhost:3000/api/health", timeout=60):
        print("Server did not start in time.")
        exit(1)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
