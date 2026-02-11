from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to the blog post
        # Assuming dev server runs on port 3000
        url = "http://localhost:3000/ja/blog/deepseek-vs-chatgpt-japanese"
        print(f"Navigating to {url}")
        try:
            page.goto(url, timeout=60000)

            # Wait for content to load
            page.wait_for_selector("h1")

            # Take a screenshot of the top
            page.screenshot(path="verification/blog_post_top.png")
            print("Screenshot of top saved to verification/blog_post_top.png")

            # Scroll down to see the comparison
            page.evaluate("window.scrollTo(0, 1000)")
            page.wait_for_timeout(1000) # Wait for potential lazy loading or rendering
            page.screenshot(path="verification/blog_post_middle.png")
            print("Screenshot of middle saved to verification/blog_post_middle.png")

            # Check for links
            # Note: markdown links might be rendered as absolute paths or relative.
            # In the markdown I used /ja/tools/deepseek.
            # Let's check if there is an anchor with that href.
            links = page.locator("a[href='/ja/tools/deepseek']")
            count = links.count()
            print(f"Found {count} links to /ja/tools/deepseek")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        browser.close()

if __name__ == "__main__":
    run()
