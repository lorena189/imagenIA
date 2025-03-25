from flask import Flask, request, jsonify
import numpy as np
import requests
import cv2
import base64

BASE_URL = 'https://api-ia-db.onrender.com/images/list'
IMAGE_URL_TEMPLATE = 'https://api-ia-db.onrender.com/images/{}'

app = Flask(__name__)

def get_latest_image_url():
    try:
        response = requests.get(BASE_URL)
        response.raise_for_status()
        
        images = response.json()
        if images and isinstance(images, list) and len(images) > 0:
            latest_image = images[-1]
            latest_id = latest_image.get('id')
            if latest_id:
                return IMAGE_URL_TEMPLATE.format(latest_id)
        
        print("No se encontró una imagen válida en la API.")
    except requests.RequestException as e:
        print(f"Error al obtener la última imagen: {e}")
    return None

def transform_image(url, show_image=False):
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

        if show_image:
            cv2.imshow("Última Imagen", img)
            cv2.waitKey(0)
            cv2.destroyAllWindows()

        return {"image": img_base64, "message": "Imagen en Base64"}, 200

    except requests.RequestException as e:
        return {"error": f"Error al descargar la imagen: {e}"}, 400
    except Exception as e:
        return {"error": f"Error inesperado: {e}"}, 500

@app.route('/transform', methods=['POST'])
def image_result():
    """Endpoint para procesar una imagen desde una URL enviada en el body."""
    data = request.get_json(force=True)
    
    if 'url' not in data:
        return jsonify({"error": "Falta la URL en el JSON"}), 400

    url = data['url']
    response, status_code = transform_image(url)

    return jsonify(response), status_code

if __name__ == '__main__':
    latest_image_url = get_latest_image_url()
    if latest_image_url:
        transform_image(latest_image_url, show_image=True)
    else:
        print("No se pudo obtener la última imagen.")
    app.run(debug=True)