from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        print("Navigating to home page...")
        page.goto("http://localhost:3000")

        # Wait for Social Proof to appear (it has 5s delay)
        print("Waiting for Social Proof notification...")
        try:
            # Look for the notification container. It has text "Recent activity"
            page.wait_for_selector('text=Recent activity', timeout=10000)
            print("Social Proof appeared!")
            page.screenshot(path="verification_social_proof.png")
        except Exception as e:
            print(f"Social Proof did not appear: {e}")
            # Take screenshot anyway to see what's happening
            page.screenshot(path="verification_failed_social.png")

        # Scroll to footer
        print("Scrolling to footer...")
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

        # Click Refer & Earn
        print("Clicking Refer & Earn...")
        try:
            page.get_by_role("button", name="Refer & Earn").click()

            # Wait for modal
            print("Waiting for modal...")
            page.wait_for_selector("text=Refer Friends, Get Rewards", timeout=5000)

            # Take screenshot of modal
            print("Taking modal screenshot...")
            page.screenshot(path="verification_referral_modal.png")

        except Exception as e:
            print(f"Referral interaction failed: {e}")
            page.screenshot(path="verification_failed_referral.png")

        browser.close()

if __name__ == "__main__":
    run()
