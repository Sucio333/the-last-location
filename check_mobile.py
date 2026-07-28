import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # Viewport móvil pequeño (480px ancho)
        context = await browser.new_context(viewport={"width": 480, "height": 800})
        page = await context.new_page()
        
        await page.goto('http://127.0.0.1:5000/')
        await page.wait_for_load_state('networkidle')
        
        # Esperar a que se carguen los elementos
        await page.wait_for_selector('.soundcloud-volume-controls', timeout=5000)
        
        # Tomar screenshot
        await page.screenshot(path='C:\\Users\\PAVILION\\Desktop\\PROYECTOS\\the_last_location\\screenshot_mobile_480.png')
        print("Screenshot tomado: screenshot_mobile_480.png")
        
        # También tomar para 375px (mobile muy pequeño)
        await context.close()
        context = await browser.new_context(viewport={"width": 375, "height": 812})
        page = await context.new_page()
        
        await page.goto('http://127.0.0.1:5000/')
        await page.wait_for_load_state('networkidle')
        await page.wait_for_selector('.soundcloud-volume-controls', timeout=5000)
        
        await page.screenshot(path='C:\\Users\\PAVILION\\Desktop\\PROYECTOS\\the_last_location\\screenshot_mobile_375.png')
        print("Screenshot tomado: screenshot_mobile_375.png")
        
        await browser.close()

asyncio.run(test())
