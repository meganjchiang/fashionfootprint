# flake8: noqa
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from collections import OrderedDict

def get_final_url(shortened_url):
    response = requests.head(shortened_url, allow_redirects=True)
    final_url = response.url
    while 'rstyle.me' in final_url:
        response = requests.head(final_url, allow_redirects=True)
        final_url = response.url

        # remove URL parameters/unecessary info from link
        final_url = final_url.split('?')[0]
    return final_url


# below is a revised url function using Selenium instead of requests -> this works on more types of shortened links but takes much longer

# for this video https://www.youtube.com/watch?v=bvigH2FADPQ, it only takes 9 seconds with the original function but it takes
# 45 seconds with the Selenium function :/

# def get_final_url(url):
#     try:
#         chrome_options = Options()
#         chrome_options.add_argument("--headless")
#         driver = webdriver.Chrome(options=chrome_options)
        
#         # Open the webpage
#         driver.get(url)

#         # wait for page to load
#         time.sleep(3)

#         # get actual URL
#         final_url = driver.current_url

#         # remove tracking info from link
#         final_url = final_url.split('?')[0]

#         driver.quit()

#         return final_url
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return None

def scrape_materials(url):
    url = get_final_url(url)

    # Create session
    session = requests.Session()
    # Retry five times in case of exception
    retry = Retry(connect=5, backoff_factor=0.5)
    # Apply delays between attempts
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('https://', adapter)

    try:
        # search for brand review
        review = session.get(url)
            
        # content
        content = BeautifulSoup(review.text, 'html.parser')

        # site name
        meta_tag = content.find('meta', property='og:site_name')
        if not meta_tag:
            meta_tag = content.find('meta', property='site_name')
        site = meta_tag['content']
        
        if site.endswith('.com'):
            site = site[:-4]
        
        if site == 'Hollister Co.':
            site = 'Hollister'

        if 'Princess Polly' in site:
            site = 'Princess Polly'

        # extract item name
        if site == 'Aritzia':
            item_name_element = content.find('h1', class_='js-product-detail__product-name')
        
        if site == 'Hollister' or site == 'Abercrombie & Fitch':
            item_name_element = content.find('h1', class_='product-title-component product-title-main-header')

        if site == 'Princess Polly':
            item_name_element = content.find('h1', class_='product__title')

        item_name = item_name_element.text.strip().title() if item_name_element else "Unknown"

        # extract materials 
        # norm_text = str(content).lower()
        norm_text = str(content).replace('\u2122', '').replace('\\u2122', '').lower()

        # search for percentage plus material
        result = re.findall('[\d.]+%\s+(?!off)+[^\t\n\r\d~`!@#$%^&*()_\-+=[\]\{\}[\]|\\:;"\'<>,.?/]+', norm_text)

        # potential sections for the main fabric
        potential_sections = ['Body:', 'Main:']

        body_materials = []
        for section in potential_sections:
            section_match = re.search(rf'{section}\s*(.*?)\n', norm_text, re.IGNORECASE)
            if section_match:
                section_text = (section_match.group(1)).replace('', '')
                body_materials = re.findall('[\d.]+%\s+(?!off)+[^\t\n\r\d~`!@#$%^&*()_\-+=[\]\{\}[\]|\\:;"\'<>,.?/]+', section_text)
                if body_materials:
                    break

        result = body_materials if body_materials else result

        all_materials = OrderedDict()
        for item in result:
            percent, material = re.split('%\s+', item, 1)

            material = material.replace('\\u', '').strip()

            # check if percentage is an integer or float
            if '.' in percent:
                percent = float(percent) 
            else:
                percent = int(percent)
            
            if material not in all_materials: 
                all_materials[material] = percent

        # check if percentages add up to 100%
        total = 0
        body_materials = {}
        for key, value in all_materials.items():
            total += value
            body_materials[key] = value

            # return first set of materials (for the clothing body) that add up to 100%
            if total == 100:
                link_start = 'https://www.selflessclothes.com/blog/sustainability-calculator/?'

                material_params = ["COTTON", "RECYCLED_COTTON", "ORGANIC_COTTON", "POLYESTER", "RECYCLED_POLYESTER",
                                   "NYLON", "RECYCLED_NYLON", "ACRYLIC", "SPANDEX", "FLAX", "LINEN", "HEMP", "CUPRO",
                                   "LYOCELL", "TENCEL_LYOCELL_LENZING", "REFIBRA_TENCEL_LYOCELL_LENZING", "MODAL",
                                   "TENCEL_MODAL_LENZING", "VISCOSE", "VISCOSE_BAMBOO", "VISCOSE_ASIA_LENZING",
                                   "VISCOSE_EU_LENZING", "SILK", "ALPACA", "WOOL", "RECYCLED_WOOL", "CASHMERE",
                                   "RECYCLED_CASHMERE"]

                goal_params = []

                for material, percent in body_materials.items():
                    material = material.replace(' ', '_').upper()
                    
                    if material == 'ELASTANE':
                        material = 'SPANDEX'

                    if material == 'RAYON':
                        material = 'VISCOSE'

                    if material == 'TENCEL_LYOCELL':
                        material = 'TENCEL_LYOCELL_LENZING'
                    
                    if material in material_params:
                        goal_params.extend([f"material={material}", f"percentage={percent}"])

                # Reorder the goal_params list to have materials first
                reordered_params = [goal_params[i] for i in range(0, len(goal_params), 2)] + [goal_params[i] for i in range(1, len(goal_params), 2)]

                higg_link = link_start + "&".join(reordered_params) + '#:~:text=Higg%20Material%20Sustainability%20Score'
                
                # Create a new dictionary with 'item' key listed first
                final_dict = {'item': item_name, 'materials': body_materials, 'higg_link': higg_link, 'site': site}
                return final_dict
            
        return "Material percentages do not add up to 100%"
                
    except Exception as e:
        return e

# print(scrape_materials('https://www.aritzia.com/us/en/product/olive-midi-pleated-skirt/112453.html?dwvar_112453_color=31493'))
# print(scrape_materials('https://www.aritzia.com/us/en/product/sinch-smooth-willow-t-shirt/105194.html?dwvar_105194_color=1274'))
# print(scrape_materials('https://www.aritzia.com/us/en/product/homestretch%E2%84%A2-crew-waist-raglan-t-shirt/117914005.html?dwvar_117914_color=32610'))
# print(scrape_materials('https://www.aritzia.com/us/en/product/hold-it%E2%84%A2-new-bergman-tank/116146.html'))
# print(scrape_materials('https://www.aritzia.com/us/en/product/sinch-baby-rib-self-tank/116805002.html?Quantity=1&uuid=ecc87ae5e08f6fc157a3a622a5'))
# print(scrape_materials('https://www.aritzia.com/us/en/product/sinch-smooth-willow-t-shirt/105194.html?dwvar_105194_color=1274'))
# print(scrape_materials("https://www.abercrombie.com/shop/us/p/curve-love-high-rise-wide-leg-jean-55669426?categoryId=12266&faceout=model&seq=02"))