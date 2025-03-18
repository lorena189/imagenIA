import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

function App() {
  // const [file, setFile] = useState();
  const onDrop = useCallback((acceptedFiles) => {
    console.log(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({ onDrop });

  const handleSubmit = async (e) => {
    e.preventDefault();
    ////conexión con el back por el momento tiene Cloudinary
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);
    formData.append("upload_preset", "ml_default");
    formData.append("api_key", "536368137275945");

    // console.log(e.target[1].files[0])
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dlvi9wdaa/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    console.log(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" />

        <div
          {...getRootProps()}
          style={{
            background: "#e3e3e3",
            padding: "20px",
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Sube los archivos aqui ...</p>
          ) : (
            <p>Arrastra y suelta algunos archivos aquí, o haz clic para seleccionarlos</p>
          )}
        </div>

        {acceptedFiles[0] && (
          <img src={URL.createObjectURL(acceptedFiles[0])} alt="" 
            style={{
              width: '300px',
              height: '300px'
            }}
          />
        )}

        <button>Enviar</button>
      </form>
    </div>
  );
}

export default App;
