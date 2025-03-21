
# from flask import Flask, request, jsonify
# import numpy as np
# import requests
# import cv2
# import base64

# app = Flask(__name__)

# def transform_image(url):
#     original_image = requests.get(url)
    
#     img_array = np.array(bytearray(original_image.content), dtype=np.uint8)
#     img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)
#     img = cv2.resize(img, (500, 500), interpolation=cv2.INTER_AREA)
    
#     img_base64 = base64.b64encode(img).decode('utf-8')
#     # img_binary = img.tolist()
    
#     response = {
#         "image": img_base64,
#         "message": "Image is BASE 64 encoded"
#     }
    
#     if img is not None:
#         print(response)
#         cv2.imshow('ImageWindow', img)
#         cv2.waitKey(0)
#         cv2.destroyAllWindows()
#         return response, 200
#     else:
#         return {"error": "Failed to load image."}, 400

# transform_image('http://res.cloudinary.com/dlvi9wdaa/image/upload/v1742420422/Captura_de_pantalla_2024-12-02_135520_qsvuxo.png')

# @app.route('/transform', methods=['POST'])
# def image_result():
#     data = request.get_json(force=True)
    
#     url = data['url']
    
#     modify_img = transform_image(url)
    
#     return jsonify(modify_img), 200
    
# if __name__ == '__main__':
#     app.run(debug=True)
#################################################################


##@app.route('/transform', methods=['POST'])
################################################################
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
