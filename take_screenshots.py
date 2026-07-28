import asyncio
import sys

async def take_screenshots():
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("Instalando Playwright...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright", "-q"])
        from playwright.async_api import async_playwright
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # 480px (mobile pequeño)
        context = await browser.new_context(viewport={"width": 480, "height": 800})
        page = await context.new_page()
        
        try:
            await page.goto('http://127.0.0.1:5000/', timeout=10000)
            await page.wait_for_load_state('networkidle', timeout=10000)
            await page.screenshot(path='C:\\Users\\PAVILION\\Desktop\\PROYECTOS\\the_last_location\\screenshot_480.png')
            print("✓ Screenshot 480px: screenshot_480.png")
        except Exception as e:
            print(f"Error 480px: {e}")
        
        await context.close()
        
        # 375px (iPhone SE)
        context = await browser.new_context(viewport={"width": 375, "height": 812})
        page = await context.new_page()
        
        try:
            await page.goto('http://127.0.0.1:5000/', timeout=10000)
            await page.wait_for_load_state('networkidle', timeout=10000)
            await page.screenshot(path='C:\\Users\\PAVILION\\Desktop\\PROYECTOS\\the_last_location\\screenshot_375.png')
            print("✓ Screenshot 375px: screenshot_375.png")
        except Exception as e:
            print(f"Error 375px: {e}")
        
        await browser.close()

asyncio.run(take_screenshots())
