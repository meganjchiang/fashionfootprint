# flake8: noqa
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup
import time
import pandas as pd
import re


# create session
session = requests.Session()
# retry five times in case of exception
retry = Retry(connect=5, backoff_factor=0.5)
# apply delays between attempts
adapter = HTTPAdapter(max_retries=retry)
session.mount('https://', adapter)


# materials list based off materials calculator
materials = ['cotton', 'recycled cotton', 'organic cotton', 'polyester', 'recycled polyester', 'nylon', 'recycled nylon', 'acrylic',
             'spandex', 'flax', 'linen', 'hemp', 'cupro', 'lyocell', 'tencel', 'refibra', 'modal', 'tencel modal', 'viscose',
             'bamboo', 'lenzing viscose', 'ecovero', 'silk', 'alpaca', 'wool', 'recycled wool', 'cashmere', 'recycled cashmere', 'lenzing™ ecovero™ viscose', 'elastane', 'polyurethane', 'pu', 'tencel™ modal']

# gets item name and materials for aritzia
def scrape_materials(url):
    try:
        # search for brand review
        review = session.get(url)
            
        # content
        content = BeautifulSoup(review.text, 'html.parser')
        # print(content)

        # Extracting item name
        item_name_element = content.find('h1', class_='js-product-detail__product-name')
        item_name = item_name_element.text.strip().title() if item_name_element else "Unknown"

        # extract materials 
        norm_text = str(content).lower()

        # Search for the pattern indicating the start of material information
        material_pattern = re.search(r'content:(.*?)lining:', norm_text, re.IGNORECASE)
        # material_pattern = re.search(r'content:(.*?)(?:lining:|$)', norm_text, re.IGNORECASE)
        # material_pattern = re.search(r'content:(.*?)(?:$)', norm_text, re.IGNORECASE)

        
        if material_pattern:
            # Extracting the material information from the pattern
            material_info = material_pattern.group(1)
            # print("Material Info:", material_info)  # Add this line

            
            made_of = {'item': item_name}
            for material in materials:
                
                # search for percentage plus material
                result = re.search('[\d.]+%\s+' + material, material_info)
                
                # if result doesn't exist, check material plus any non-space characters
                if not result:
                    result = re.search('[\d.]+%\s+' + material + '\S', material_info)
                
                # if result exists, add to made_of list
                if result:
                    item = re.split('%\s+', result.group(0))
                    if '.' in item[0]:
                        percent = float(item[0]) 
                    else:
                        percent = int(item[0]) 
                    made_of[item[1]] = percent

            return made_of
        else:
            return {"item": item_name, "error": "No material information found."}

    except Exception as e:
        return {"item": item_name, "error": str(e)}


# aritzia test: success
# print("1", scrape_materials('https://www.aritzia.com/us/en/product/element-tube-top/113673.html?dwvar_113673_color=1274'))


# print(f"2", scrape_materials('https://www.aritzia.com/us/en/product/martine-poplin-dress/109395.html?dwvar_109395_color=1275'))


# https://www.aritzia.com/us/en/product/sculpt-knit-scoopneck-cropped-tank/100345.html?dwvar_100345_color=15104

# https://www.aritzia.com/us/en/product/tribute-pant/98768.html

# https://www.aritzia.com/us/en/product/archive-linen-shirt/109546.html?dwvar_109546_color=1275

print(scrape_materials('https://www.aritzia.com/us/en/product/olive-midi-pleated-skirt/112453.html?dwvar_112453_color=31493'))


print(scrape_materials('https://www.aritzia.com/us/en/product/sinch-smooth-willow-t-shirt/105194.html?dwvar_105194_color=1274'))