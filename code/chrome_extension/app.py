# flake8: noqa
import logging
from flask import Flask, jsonify, request
import requests
import re
import config
from aritzia_scrape import scrape_materials
from material_calculator import get_material_score
import pandas as pd

api_key = config.API_KEY

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/')
def home():
    return "Flask server is running"

@app.route('/api/data', methods=['GET', 'POST'])
def data():
    data = [
        {"item_name": "Item 1", "avg_score": 75},
        {"item_name": "Item 2", "avg_score": 82},
        {"item_name": "Item 3", "avg_score": 90}
    ]
    return jsonify(data)

@app.route('/api/video_links/<video_id>', methods=['GET'])
def get_video_links(video_id):
    keywords = ['haul', 'clothing', 'clothes', 'shop', 'shopping', 'try on', 'try-on',
                'review', 'styling', 'outfit', 'outfits', 'wardrobe', 'capsule', 'style',
                'purchase', 'lookbook', 'essentials', 'staples']
    social_media_links = ['pinterest', 'youtube', 'youtu.be', 'twitter', 'instagram', 'tiktok',
                          'reddit', 'twitch', 'facebook', 'thmatc', 'spotify', 'vinted', 'epidemicsound',
                          'linktr.ee', 'buymeacoffee', 'squarespace']

    brand_ratings = pd.read_csv('data/brand_ratings_only.csv')
    
    # get data from youtube api via video id
    url = f'https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={api_key}'
    response = requests.get(url)
    data = response.json()

    # accesses 'items' key in youtube data api response 
    if 'items' in data and len(data['items']) > 0:
        video_details = data['items'][0]['snippet']
        # gets description from snippet dict
        # if description not present, defaults to ''
        description = video_details.get('description', '')
        # extract links from description
        links = re.findall(r'(https?://\S+)', description)

        title_og = video_details.get('title', '')
        # makes all titles lowercase so code can match on any version of title:
        title_lower = title_og.lower()

        # filters based on fashion related keywords
        if any(keyword in title_lower for keyword in keywords):
            # filters out social media links
            filtered_links = [link for link in links if not any(social in link for social in social_media_links)]

            scraped_data = {}
            for link in filtered_links:
                try:
                    # remove URL parameters/unecessary info from link
                    link = link.split('?')[0]
                    
                    scraped_result = scrape_materials(link)
                    if not scraped_result.get('Error'):
                        item = scraped_result['item']
                        material_score = get_material_score(scraped_result['materials'])
                        scraped_result['material_score'] = material_score
                        scraped_result['link'] = link

                        brand_rating, price_level, location = brand_ratings.loc[brand_ratings['brand'] == scraped_result['site'],
                                                                   ['avg_brand_rating', 'price_level', 'location']].values[0]

                        scraped_result['brand_rating'] = brand_rating
                        scraped_result['price_level'] = 'N/A' if pd.isna(price_level) else price_level
                        scraped_result['location'] = 'N/A' if pd.isna(location) else location
                        scraped_result['overall_rating'] = round((material_score + brand_rating) / 2, 2)
                        scraped_data[item] = scraped_result
                except Exception as e:
                    logger.exception("An error occurred while processing link: %s", link)
                    continue
                
            return jsonify({'title': title_og, 'video_id': video_id, 'links': filtered_links, 'product_details': scraped_data})
        else:
            return jsonify({'error': 'Not a fashion-related video'}), 404
    else:
        return jsonify({'error', 'Video not found'}), 404


if __name__ == '__main__':
    app.run(debug=True)