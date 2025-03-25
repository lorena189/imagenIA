import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export function PantallaPrincipal() {
  const [firstImage, setFirstImage] = useState();
  const [secondImage, setSecondImage] = useState();
  const [imageData, setImageData] = useState(null); 

  const onDrop = useCallback((acceptedFiles) => {
    setFirstImage(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: 'image/*',
  });

  const conexionIA = async (e) => {
    e.preventDefault();

    if (!firstImage) {
      alert("No has seleccionado ningún archivo.");
      return;
    }
   
    const formData = new FormData();
    formData.append('file', firstImage);
    
    const resApp = await fetch('https://api-ia-db.onrender.com/images/upload', {
      method: 'POST',
      body: formData,
    });
    
    const datapp = await resApp.json();
    if (datapp && datapp.id && datapp.hexadecimal) {
      setImageData(datapp);
      console.log("Imagen guardada en la base de datos:", datapp);
    } else {
      alert("Hubo un problema al guardar la imagen.");
      return;
    }

    const imageUrl = `https://api-ia-db.onrender.com/images/${datapp.id}`;
    const res = await fetch('http://127.0.0.1:5000/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: imageUrl,  
      }),
    });

    const data = await res.json();
    if (data.image && data.image.startsWith('data:image/png;base64,')) {
      setSecondImage(data.image);
    } else {
      alert("La imagen modificada no tiene el formato correcto.");
    }
  };

  return (
    <div>
      <form onSubmit={conexionIA}>
        <div
          {...getRootProps()}
          style={{
            background: '#e3e3e3',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Sube los archivos aquí ...</p>
          ) : (
            <p>Arrastra y suelta una imagen aquí, o haz clic para seleccionarla</p>
          )}
        </div>

        {firstImage && (
          <img
            src={URL.createObjectURL(firstImage)}
            alt="Imagen subida"
            style={{
              width: '300px',
              height: '300px',
              display: 'block',
              marginBottom: '20px',
            }}
          />
        )}

        {secondImage && (
          <div
            style={{
              background: '#e3e3e3',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <img
              src={secondImage}
              alt="Imagen modificada"
              style={{
                width: '300px',
                height: '300px',
              }}
            />
          </div>
        )}

        {imageData && (
          <div>
            <h4>Datos de la imagen almacenada:</h4>
            <p><strong>ID:</strong> {imageData.id}</p>
            <p><strong>Nombre de la imagen:</strong> {imageData.name}</p>
            <p><strong>Formato hexadecimal:</strong> {imageData.hexadecimal}</p>
          </div>
        )}

        <button
          onClick={conexionIA}
          style={{ marginBottom: '10px' }}
        >
          Cambiar color de la imagen a blanco y negro
        </button>
      </form>
    </div>
  );
}
