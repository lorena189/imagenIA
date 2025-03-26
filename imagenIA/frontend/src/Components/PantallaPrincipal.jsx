import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function PantallaPrincipal() {
  const [firstImage, setFirstImage] = useState(null);
  const [secondImage, setSecondImage] = useState(null);

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

    if (!firstImage) {
      alert("No has seleccionado ningún archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", firstImage);

    try {
      const resApp = await fetch("https://api-ia-db.onrender.com/images/upload", {
        method: "POST",
        body: formData,
      });

      const datapp = await resApp.json();
      if (!datapp || !datapp.id) {
        alert("Hubo un problema al guardar la imagen.");
        return;
      }
      const imageUrl = `https://api-ia-db.onrender.com/images/${datapp.id}`;

      const res = await fetch("http://127.0.0.1:5000/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: imageUrl }),
      });

      const data = await res.json();
      if (data.image && data.image.startsWith("data:image/png;base64,")) {
        setSecondImage(data.image);
      } else {
        alert("La imagen modificada no tiene el formato correcto.");
      }
    } catch (error) {
      console.error("Error en la conexión con la IA:", error);
      alert("Hubo un error al procesar la imagen.");
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