from flask import Flask, jsonify, request

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


if __name__ == '__main__':
    app.run(debug=True)
