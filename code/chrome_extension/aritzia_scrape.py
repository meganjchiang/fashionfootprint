# flake8: noqa
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup
import re

def scrape_materials(url):
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
        site = meta_tag['content'][:-4]
        # print(site)

        # extract item name
        item_name_element = content.find('h1', class_='js-product-detail__product-name')
        item_name = item_name_element.text.strip().title() if item_name_element else "Unknown"

        # extract materials 
        norm_text = str(content).lower()

        # search for percentage plus material
        result = re.findall('[\d.]+%\s+(?!off)+[^\t\n\r\d~`!@#$%^&*()_\-+=[\]\{\}[\]|\\:;"\'<>,.?/]+', norm_text)

        all_materials = {}
        for item in result:
            percent, material = re.split('%\s+', item)

            # check if percentage is an integer or float
            if '.' in percent:
                percent = float(percent) 
            else:
                percent = int(percent) 
            all_materials[material] = percent

        # check if percentages add up to 100%
        total = 0
        body_materials = {}
        for key, value in all_materials.items():
            total += value
            body_materials[key] = value

            # return first set of materials (for the clothing body) that add up to 100%
            if total == 100:
                # Create a new dictionary with 'item' key listed first
                final_dict = {'item': item_name, 'site': site}
                final_dict.update(body_materials)
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