import React, { useState } from 'react';
import { UploadDropzone } from "@bytescale/upload-widget-react";

function AudioUploader({ onTranscribe }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

  const options = {
    apiKey: "public_12a1yFCDXAtsDmb8m5n4gn7VWLwf" || "free",
    maxFileCount: 1,
    mimeTypes: ["audio/mpeg"],
    styles: { colors: { primary: "#000" } },
  };

  const handleTranscribe = async (fileUrl) => {
    setLoading(true);
    try {
        const url = 'http://localhost:9000' + '/transcribe-audio';
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioUrl: fileUrl }),
      });

      if (!res.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await res.json();
      onTranscribe(data.transcription);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <UploadDropzone
        options={options}
        onUpdate={({ uploadedFiles }) => {
          if (uploadedFiles.length !== 0) {
            handleTranscribe(uploadedFiles[0].fileUrl);
            console.log(uploadedFiles[0].fileUrl)
          }
        }}
        width="600px" 
    height="250px"
      />
      {loading && <p>Transcribing...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default AudioUploader;