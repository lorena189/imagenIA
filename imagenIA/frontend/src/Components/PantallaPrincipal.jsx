import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function PantallaPrincipal() {

  const API_URL = "https://api-ia-db.onrender.com";
  const [firstImage, setFirstImage] = useState();
  const [secondImage, setSecondImage] = useState();
  let respApp, respIA;

  const onDrop = useCallback((acceptedFiles) => {
    setFirstImage(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: "image/*",
  });

  const conexionIA = async (e) => {
      e.preventDefault();

      try {
          if (!firstImage) {
              alert("No has seleccionado ningún archivo.");
              return;
          }

          const formData = new FormData();
          formData.append("file", firstImage);

          await fetch(`${API_URL}/images/upload`, {
              method: 'POST',
              body: formData
          })
          .then(response => response.json())
          .then(data => {
            respApp = data;
          })
          .catch(error => Error("Error: ", error));

          if (!respApp || !respApp.id) {
              alert("Hubo un problema al guardar la imagen.");
              return;
          }
          const imageUrl = `${API_URL}/images/${respApp.id}`;

          await fetch('http://127.0.0.1:5000/transform', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  url: imageUrl
              })
          })
          .then(response => response.json())
          .then(data => {
            respIA = data;
          })

          if (respIA.image && respIA.image.startsWith('data:image/png;base64,')) {
              setSecondImage(respIA.image);
          } else {
              alert('La imagen modificada no tiene el formato correcto.');
          }
      } catch (error) {
        throw new Error("Error: ", error);
      }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <form onSubmit={conexionIA}>
        {/* Área de arrastrar y soltar */}
        <div
          {...getRootProps()}
          style={{
            background: "#e3e3e3",
            padding: "20px",
            border: "2px dashed #000",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? <p>Suelta la imagen aquí...</p> : <p>Arrastra y suelta una imagen aquí, o haz clic para seleccionarla</p>}
        </div>

        {/*imagen original */}
        {firstImage && (
          <img
            src={URL.createObjectURL(firstImage)}
            alt="Imagen subida"
            style={{
              width: "300px",
              height: "300px",
              display: "block",
              margin: "10px auto",
            }}
          />
        )}

        {/*imagen procesada */}
        {secondImage && (
          <div style={{ background: "#e3e3e3", padding: "20px", marginBottom: "20px" }}>
            <img
              src={secondImage}
              alt="Imagen modificada"
              style={{
                width: "300px",
                height: "300px",
              }}
            />
          </div>
        )}

        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Convertir a blanco y negro
        </button>
      </form>
    </div>
  );
}