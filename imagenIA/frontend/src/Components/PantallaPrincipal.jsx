import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function PantallaPrincipal() {

  const API_URL = "https://api-ia-db.onrender.com";
  const IA_URL = "https://backendia-mrgb.onrender.com";
  const [firstImage, setFirstImage] = useState();
  const [secondImage, setSecondImage] = useState();
  let respApp, respIA;

  const onDrop = useCallback((acceptedFiles) => {
    setSecondImage(null);
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
              method: "POST",
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

          await fetch(`${IA_URL}/transform`, {
              method: 'POST',
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  url: imageUrl
              })
          })
          .then(response => response.json())
          .then(data => {
            respIA = data;
          })

          if (respIA.image && respIA.image.startsWith("data:image/png;base64,")) {
              setSecondImage(respIA.image);
          } else {
              alert("La imagen modificada no tiene el formato correcto.");
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
            background: "#f0f0f0",
            padding: "30px",
            border: "2px dashed #007bff",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.3s ease",
            marginBottom: "30px",
            width: "80%",
            maxWidth: "500px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p style={{ fontSize: "16px", color: "#007bff" }}>Suelta la imagen aquí...</p>
          ): ( 
            <p style={{ fontSize: "16px", color: "#333" }}>
              Arrastra y suelta una imagen aquí, o haz clic para seleccionarla
            </p>
          )}
          
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}></div>
        {/*imagen original */}
        {firstImage && (
          <div style={{ textAlign: "center" }}>
            <img
              src={URL.createObjectURL(firstImage)}
              alt="Imagen subida"
              style={{
                width: "300px",
                height: "300px",
                objectFit: "cover", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        )}

        {/*imagen procesada */}
        {secondImage && (
          <div style={{ textAlign: "center"  }}>
            <img
              src={secondImage}
              alt="Imagen modificada"
              style={{
                width: "300px",
                objectFit: "cover", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        )}

        <button 
        type="submit" 
        style={{ 
          padding: "10px 20px", 
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "ffff",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          transition: "background-color 0.3s",
          marginTop: "20px",
          }}
        >
          Presiona para convertir la imagen a a blanco y negro
        </button>
      </form>
    </div>
  );
}

