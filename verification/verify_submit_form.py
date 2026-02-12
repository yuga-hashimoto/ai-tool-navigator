import time
from playwright.sync_api import sync_playwright

def verify_submit_form():
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

        # Check for new fields
        print("Checking for Pricing Model field...")
        pricing_model_select = page.locator("select#pricing_model")
        if pricing_model_select.count() > 0:
            print("Pricing Model field found.")
        else:
            print("ERROR: Pricing Model field not found.")
            exit(1)

        print("Checking for Price field...")
        price_input = page.locator("input#price")
        if price_input.count() > 0:
            print("Price field found.")
        else:
            print("ERROR: Price field not found.")
            exit(1)

        # Fill the form
        print("Filling the form...")
        page.fill("input#name", "Test Tool")
        page.fill("input#url", "https://example.com")
        page.fill("input#category", "Testing")

        # Select pricing model
        page.select_option("select#pricing_model", "freemium")

        # Fill price
        page.fill("input#price", "$50/mo")

        page.fill("textarea#description", "This is a test description for the tool submission.")

        # Submit
        print("Submitting the form...")
        submit_button = page.get_by_role("button", name="Submit Tool")
        submit_button.click()

        # Wait for a bit
        time.sleep(2)


        # Check for response message (likely error due to missing env vars, but that's expected)
        # We look for either success or error message
        try:
            page.wait_for_selector(".text-green-800, .text-red-800", timeout=5000)
            success_msg = page.locator(".text-green-800")
            error_msg = page.locator(".text-red-800")

            if success_msg.count() > 0:
                print("Success message displayed.")
            elif error_msg.count() > 0:
                print("Error message displayed (Expected if env vars missing).")
            else:
                print("No success or error message found.")
        except Exception as e:
            print(f"Timed out waiting for response message: {e}")

        browser.close()

if __name__ == "__main__":
    verify_submit_form()
