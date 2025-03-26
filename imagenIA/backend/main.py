from flask import Flask, request, jsonify
import numpy as np
import requests
import cv2
import base64
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/": {"origins": ""}})

def transform_image(url):
    try:
        response = requests.get(url)
        response.raise_for_status()

        img_array = np.array(bytearray(response.content), dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)

        if img is None:
            return {"error": "No se pudo decodificar la imagen."}, 400

        img = cv2.resize(img, (500, 500), interpolation=cv2.INTER_AREA)

        success, buffer = cv2.imencode('.png', img)
        if not success:
            return {"error": "No se pudo codificar la imagen."}, 500

        img_base64 = base64.b64encode(buffer).decode('utf-8')

        return {"image": f"data:image/png;base64,{img_base64}"}, 200

    except requests.RequestException as e:
        return {"error": f"Error al descargar la imagen: {e}"}, 400
    except Exception as e:
        return {"error": f"Error inesperado: {e}"}, 500

@app.route('/transform', methods=['POST'])
def image_result():
    data = request.get_json(force=True)

    if 'url' not in data:
        return jsonify({"error": "Falta la URL en el JSON"}), 400

    url = data['url']
    response, status_code = transform_image(url)

    return jsonify(response), status_code

if __name__ == 'main':
    app.run(debug=True, host="0.0.0.0", port=5000)