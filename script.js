const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const transcriptElement = document.getElementById('transcript');
const saveBtn = document.getElementById('saveBtn');
const playBtn = document.getElementById('playBtn');
const statusElement = document.getElementById('status');




const googleSpeechApiKey = '%%GOOGLE_SPEECH_API_KEY%%';


let recognition;
let transcript = '';
let synth; // Speech synthesis object
// Helper function to display status messages
function displayStatus(message) {
  statusElement.textContent = message;
}

startBtn.addEventListener('click', () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  recognition = new webkitSpeechRecognition() || new SpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onstart = () => {
    console.log('Speech recognition started');
  };

  recognition.onerror = (error) => {
    console.error('Speech recognition error:', error);
  };

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        transcript += event.results[i][0].transcript;
      }
    }
    transcriptElement.textContent = transcript;
  };

  recognition.start();
  displayStatus('Recording...');
});

stopBtn.addEventListener('click', () => {
  startBtn.disabled = false;
  stopBtn.disabled = true;
  saveBtn.disabled = false;
  playBtn.disabled = transcript.length === 0; // Enable play button only if transcript exists
  recognition.stop();
  displayStatus('');
});

saveBtn.addEventListener('click', () => {
  if (transcript.length === 0) { // Check if there's transcript to save
    alert('No transcript to save!');
    return;
  }

  // Create a Blob object with the transcript text
  const blob = new Blob([transcript], { type: 'text/plain' });

  // Generate a unique filename
  const filename = `transcription_${Date.now()}.txt`;

  // Create a downloadable URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Simulate a click on the link to initiate download
  link.click();

  // Revoke the downloadable URL after download
  window.URL.revokeObjectURL(url);
  displayStatus('Transcript saved!');
  setTimeout(() => { displayStatus('') }, 2000); // Reset status after 2 seconds
});


playBtn.addEventListener('click', () => {
  if (transcript.length === 0) {
      alert('No transcript to play!');
      return;
  }

  if (!synth) {
      synth = window.speechSynthesis || null;
      if (!synth) {
          alert('Text-to-speech not supported by your browser.');
          return;
      }
  }

  function tryPlaying() {
      if (synth.speaking) {
          displayStatus('Speech engine busy. Retrying...');
          setTimeout(tryPlaying, 1000); // Retry after 1 second
          return;
      }

      const utterance = new SpeechSynthesisUtterance(transcript);
      synth.speak(utterance);
      displayStatus('Playing...');

      utterance.onend = () => {
          displayStatus('');
      }

      utterance.onerror = (error) => {
          displayStatus('Error playing transcript: ' + error.message);
      }
  }

  tryPlaying();
});

