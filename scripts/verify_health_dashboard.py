from playwright.sync_api import sync_playwright
import time

def verify_system_health():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Visit Dashboard
        try:
            print("Navigating to System Health Dashboard...")
            # Wait for server to be ready - primitive wait
            time.sleep(10)
            page.goto("http://localhost:3000/en/admin/system-health")
            # Wait for title
            page.wait_for_selector("h1:has-text('System Health Dashboard')", timeout=60000)

            # Wait for metrics to load (look for 'Uptime')
            page.wait_for_selector("text=Uptime", timeout=10000)

            # Take screenshot of dashboard
            page.screenshot(path="verification_dashboard.png", full_page=True)
            print("Dashboard screenshot taken.")
        except Exception as e:
            print(f"Failed to verify dashboard: {e}")

        # Visit 404
        try:
            print("Navigating to non-existent page...")
            page.goto("http://localhost:3000/en/non-existent-page-123")
            page.wait_for_selector("text=Page Not Found", timeout=10000)

            # Take screenshot of 404
            page.screenshot(path="verification_404.png", full_page=True)
            print("404 screenshot taken.")
        except Exception as e:
            print(f"Failed to verify 404 page: {e}")

        browser.close()

if __name__ == "__main__":
    verify_system_health()
