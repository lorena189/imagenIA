import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export function PantallaPrincipal() {
  const [firstImage, setFirstImage] = useState();
  const [secondImage, setSecondImage] = useState();

  const onDrop = useCallback((acceptedFiles) => {
    setFirstImage(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, 
    accept: 'image/*',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstImage) {
      console.log('No image selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', firstImage);
    formData.append('upload_preset', 'ml_default');
    formData.append('api_key', '536368137275945');

    const res = await fetch('https://api.cloudinary.com/v1_1/dlvi9wdaa/image/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    console.log(data);
  };

  const conexionIA = async (e) => {
    e.preventDefault();

    if (!firstImage) {
      console.log('No image uploaded yet');
      return;
    }

   
    const formData = new FormData();
    formData.append('file', firstImage);
    formData.append('upload_preset', 'ml_default');
    formData.append('api_key', '536368137275945');
    
    const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dlvi9wdaa/image/upload', {
      method: 'POST',
      body: formData,
    });

    const cloudinaryData = await cloudinaryRes.json();
    const imageUrl = cloudinaryData.secure_url; 

    
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
    setSecondImage(`data:image/png;base64,${data.image}`);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
