import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

/**
 * Componente principal de la aplicación que permite subir una imagen, enviarla a una IA que modifica sus propiedades y mostrarla nuevamente en este mismo.
 *
 * @returns {JSX.Element} Componente de la pantalla principal que muestra la imagen original y la imagen procesada.
 */
export function PantallaPrincipal() {
    const DB_URL = 'https://api-ia-db.onrender.com';
    const IA_URL = 'https://backendia-x3sb.onrender.com/';
    const [firstImage, setFirstImage] = useState();
    const [secondImage, setSecondImage] = useState();
    let respApp, respIA;

    /**
     * Maneja la carga de imagenes y actualiza el estado con la primer imagen subida.
     *
     * @param {File[]} acceptedFiles - Lista de archivos aceptados.
     */
    const onDrop = useCallback((acceptedFiles) => {
        setSecondImage(null);
        setFirstImage(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: 'image/*'
    });

    /**
     * Establece la conexión con la IA que se encargara de procesar la imagen a modificar y obtener la imagen modifica como respuesta.
     *
     * @param {Event} e - Variable del tipo Object Event que permite acceder a las acciones del usuario.
     * @return {Promise{Blob}} - El archivo Blob de la imagen devuelta.
     */
    const conexionIA = async (e) => {
        e.preventDefault();

        try {
            if (!firstImage) {
                alert('No has seleccionado ningún archivo.');
                return;
            }

            const formData = new FormData();
            formData.append('file', firstImage);

            await fetch(`${DB_URL}/images/upload`, {
                method: 'POST',
                body: formData
            })
                .then((response) => response.json())
                .then((data) => {
                    respApp = data;
                })
                .catch((error) => Error('Error: ', error));

            if (!respApp || !respApp.id) {
                alert('Hubo un problema al guardar la imagen.');
                return;
            }
            const imageUrl = `${DB_URL}/images/${respApp.id}`;
            await fetch(`${IA_URL}/transform`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: imageUrl
                })
            })
                .then((response) => response.json())
                .then((data) => {
                    respIA = data;
                });

            if (respIA.image && respIA.image.startsWith('data:image/png;base64,')) {
                setSecondImage(respIA.image);
            } else {
                alert('La imagen modificada no tiene el formato correcto.');
            }
        } catch (error) {
            throw new Error('Error: ', error);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <form onSubmit={conexionIA}>
                {/* Área de arrastrar y soltar */}
                <div
                    {...getRootProps()}
                    style={{
                        background: '#f0f0f0',
                        padding: '30px',
                        border: '2px dashed #007bff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease',
                        marginBottom: '30px',
                        width: '80%',
                        maxWidth: '500px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p style={{ fontSize: '16px', color: '#007bff' }}>Suelta la imagen aquí...</p>
                    ) : (
                        <p style={{ fontSize: '16px', color: '#333' }}>
                            Arrastra y suelta una imagen aquí, o haz clic para seleccionarla
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Imagen original */}
                    {firstImage && (
                        <div style={{ textAlign: 'center' }}>
                            <img
                                src={URL.createObjectURL(firstImage)}
                                alt="Imagen subida"
                                style={{
                                    width: '300px',
                                    height: '300px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </div>
                    )}

                    {/* Imagen procesada */}
                    {secondImage && (
                        <div style={{ textAlign: 'center' }}>
                            <img
                                src={secondImage}
                                alt="Imagen modificada"
                                style={{
                                    width: '300px',
                                    height: '300px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        cursor: 'pointer',
                        backgroundColor: '#007bff',
                        color: 'ffffff',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        transition: 'background-color 0.3s',
                        marginTop: '20px'
                    }}
                >
                    Presiona para convertir la imagen a blanco y negro
                </button>
            </form>
        </div>
    );
}