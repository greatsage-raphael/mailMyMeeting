import React, { useState, useEffect } from 'react';
import { useNylas } from '@nylas/nylas-react';
import NylasLogin from './NylasLogin';
import Layout from './components/Layout';
import { UploadDropzone } from "@bytescale/upload-widget-react";
import downloadTranscript from '../utils/downloadTranscript';
import summarizeMeeting from '../utils/summarize';

function App() {
  const nylas = useNylas();
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastNotification, setToastNotification] = useState('');
  const SERVER_URI = import.meta.env.VITE_SERVER_URI || 'http://localhost:9000';
  const [transcription, setTranscription] = useState('');
  const [sumary, setSummary] = useState("")

  useEffect(() => {
    if (!nylas) {
      return;
    }

    // Handle the code that is passed in the query params from Nylas after a successful login
    const params = new URLSearchParams(window.location.search);
    if (params.has('code')) {
      nylas
        .exchangeCodeFromUrlForToken()
        .then((user) => {
          const { id } = JSON.parse(user);
          setUserId(id);
          sessionStorage.setItem('userId', id);
        })
        .catch((error) => {
          console.error('An error occurred parsing the response:', error);
        });
    }
  }, [nylas]);

  useEffect(() => {
    const userIdString = sessionStorage.getItem('userId');
    const userEmail = sessionStorage.getItem('userEmail');
    if (userIdString) {
      setUserId(userIdString);
    }
    if (userEmail) {
      setUserEmail(userEmail);
    }
  }, []);

  useEffect(() => {
    if (userId?.length) {
      window.history.replaceState({}, '', `/?userId=${userId}`);
    } else {
      window.history.replaceState({}, '', '/');
    }
  }, [userId]);


  const disconnectUser = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    setUserId('');
    setUserEmail('');
  };


  function AudioUploader({ onTranscribe }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

  const options = {
    apiKey: process.env.NEXT_PUBLIC_UPLOAD_API_KEY || "free",
    maxFileCount: 1,
    mimeTypes: ["audio/mpeg"],
    styles: { colors: { primary: "#000" } },
  };

  const handleTranscribe = async (fileUrl) => {
    setLoading(true);
    try {
      const url = SERVER_URI + '/transcribe-audio';
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
      const transcription = data.transcription

      sendEmail(transcription)
      const summary = await summarizeMeeting(transcription)
      sendSummary(summary)
      setSummary(summary)
      console.log(summary)

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

const sendEmail = async (transcription) => {
  try {
    const url = SERVER_URI + '/nylas/send-email';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: userId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        subject: 'Raw Transcription',
        body: transcription,
      }),
    });

    if (!res.ok) {
      setToastNotification('Error sending email.');
      throw new Error(res.statusText);
    }

    const data = await res.json();
    console.log(data);

    // Set success toast notification
    setToastNotification('Email sent successfully!');

    return data;
  } catch (error) {
    console.error(`Error sending emails:`, error);
    setToastNotification('Error sending email.');
    return false;
  }
};

const sendSummary = async (summary) => {
  try {
    const url = SERVER_URI + '/nylas/send-email';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: userId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        subject: 'Summarized Transcription',
        body: summary,
      }),
    });

    if (!res.ok) {
      setToastNotification('Error sending email.');
      throw new Error(res.statusText);
    }

    const data = await res.json();
    console.log(data);

    // Set success toast notification
    setToastNotification('Email sent successfully!');

    return data;
  } catch (error) {
    console.error(`Error sending emails:`, error);
    setToastNotification('Error sending email.');
    return false;
  }
};




return (
  <Layout
    showMenu={!!userId}
    disconnectUser={disconnectUser}
    isLoading={isLoading}
    title="Mail My Meeting 📧"
    toastNotification={toastNotification}
    setToastNotification={setToastNotification}
    transcription={transcription}
  >
    {toastNotification && <div className="toast">{toastNotification}</div>}
    {!userId ? (
      <>
      <h1>Upload any audio 🔊 in any language 🌐 and get the transcription ✍🏾 and summary 📝</h1>
      <NylasLogin email={userEmail} setEmail={setUserEmail} />
      </>
    ) : (
      <>
        <AudioUploader onTranscribe={setTranscription} /> <br />
        {transcription && (
          <>
          <div>
            <h2>Transcription ✍🏾</h2>
            <p>{transcription}</p><br/>
            <button
              onClick={() => {
              downloadTranscript(transcription, "transcript");}}>
              Download Transcript
            </button>
          </div> <br />
          </>
        )}
        {sumary && (
            <div className="sm:mt-0 mt-8">
              <h2 className="mb-1 font-medium text-lg">Summary 📝</h2>
              <p>{sumary}</p> < br/>
              <button
              onClick={() => {
              downloadTranscript(sumary, "Summary");}}>
              Download Summary
            </button>
            </div>
          )}
      </>
    )}
  </Layout>
);

}

export default App;
