// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Import other required libraries
const { v4: uuidv4 } = require('uuid');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { Readable } = require('stream');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4cREXQMgzJ8OWYaVflxjzfp2hP2cGCfE",
  authDomain: "red-delight-414207.firebaseapp.com",
  projectId: "red-delight-414207",
  storageBucket: "red-delight-414207.appspot.com",
  messagingSenderId: "459049003749",
  appId: "1:459049003749:web:5b17d017c3425e6164820c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Creates a client
const client = new textToSpeech.TextToSpeechClient();

// Initialize express app
const server = express();
server.use(bodyParser.json());

// Enable CORS for all requests
server.use(cors());

server.post('/synthesize', async (req, res) => {
  try {
    const { text, languageCode, name } = req.body;

    console.log("TEXT: ", text)

    const request = {
      input: { text: text },
      voice: { languageCode: languageCode, name: name, ssmlGender: "FEMALE" },
      audioConfig: { audioEncoding: 'MP3' },
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    // Convert the binary audio content to a buffer
    const audioBuffer = Buffer.from(response.audioContent, 'binary');

    // Generate a unique filename
    const filename = `${uuidv4()}.mp3`;
    const storageRef = ref(storage, `generatedAudio/${filename}`);

    // Upload the buffer to Firebase Storage
    const snapshot = await uploadBytes(storageRef, audioBuffer, { contentType: 'audio/mp3' });
    //console.log('Uploaded an audio file to Firebase Storage!');

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    //console.log('Download URL:', downloadURL);

    // Return the download URL
    res.json({ downloadURL: downloadURL });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
server.listen(8000, () => {
  console.log('Server is listening on port 8000');
});
