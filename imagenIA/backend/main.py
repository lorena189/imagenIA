from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import requests
import cv2
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)

def transform_image(url):
    original_image = requests.get(url)
    
    img_array = np.array(bytearray(original_image.content), dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR) 
    

    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_img = cv2.resize(gray_img, (500, 500), interpolation=cv2.INTER_AREA)
    

    pil_img = Image.fromarray(gray_img)
    buffered = BytesIO()
    pil_img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

    response = {
        "image": img_base64,
        "message": "Image is BASE 64 encoded"
    }
    
    return response, 200

@app.route('/transform', methods=['POST'])
def image_result():
    data = request.get_json(force=True)
    
    url = data['url']
    
    modify_img, status = transform_image(url)
    
    return jsonify(modify_img), status
    
if __name__ == '__main__':
    app.run(debug=True)
