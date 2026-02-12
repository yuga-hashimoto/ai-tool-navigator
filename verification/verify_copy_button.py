from playwright.sync_api import Page, expect, sync_playwright
import time
import re

def test_copy_code_button(page: Page):
    print("Navigating to blog post...")
    # Navigate to the test blog post
    page.goto("http://localhost:3000/en/blog/test-code-copy")

    print("Waiting for load state...")
    # Wait for the page to load
    page.wait_for_load_state("networkidle")

    print("Checking for pre tag...")
    # Find the code block
    pre_tag = page.locator("pre").first
    expect(pre_tag).to_be_visible()

    print("Hovering over container...")
    container = page.locator(".relative.group").first
    container.hover()

    print("Checking for Copy button...")
    copy_button = container.locator("button[aria-label='Copy Code']")
    expect(copy_button).to_be_visible()

    print("Clicking Copy button...")
    # Click the button
    copy_button.click()

    print("Verifying success state...")
    # The button adds "text-green-400" class when copied.
    # Use regex to match partial class
    expect(copy_button).to_have_class(re.compile(r"text-green-400"))

    print("Taking screenshot...")
    # Take a screenshot
    page.screenshot(path="/home/jules/verification/copy_code_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant clipboard permissions
        context = browser.new_context(permissions=["clipboard-read", "clipboard-write"])
        page = context.new_page()
        try:
            test_copy_code_button(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
            page.screenshot(path="/home/jules/verification/copy_code_failure.png")
        finally:
            context.close()
            browser.close()
