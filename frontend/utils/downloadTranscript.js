function forceDownloadText(text, filename) {
    let blob = new Blob([text], { type: "text/plain" });
    let blobUrl = window.URL.createObjectURL(blob);
    forceDownload(blobUrl, filename);
  }
  
  function forceDownload(blobUrl, filename) {
    let a = document.createElement("a");
    a.download = filename;
    a.href = blobUrl;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  
  function downloadTranscript(transcriptText, filename) {
    try {
      forceDownloadText(transcriptText, `${filename}.txt`);
    } catch (e) {
      console.error(e);
    }
  }
  
  export default downloadTranscript;
  