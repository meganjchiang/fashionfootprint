from flask import Flask, jsonify, request
import requests
import re
import config

api_key = config.API_KEY

app = Flask(__name__)

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
    keywords = ['haul', 'clothing', 'clothes', 'shop', 'shopping', 'try on', 'try-on', 'review', 'styling']
    social_media_links = ['pinterest', 'youtube', 'twitter', 'instagram', 'tiktok',
                          'reddit', 'twitch', 'facebook', 'thmatc', 'spotify', 'vinted']
    
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

        # makes all titles lowercase so code can match on any version of title:
        title = video_details.get('title', '').lower()

        # filters based on fashion related keywords
        if any(keyword in title for keyword in keywords):
            # filters out social media links
            filtered_links = [link for link in links if not any(social in link for social in social_media_links)]
            return jsonify({'video_id': video_id, 'links': filtered_links})
        else:
            return jsonify({'error': 'Not a fashion-related video'}), 404
    else:
        return jsonify({'error', 'Video not found'}), 404


if __name__ == '__main__':
    app.run(debug=True)
