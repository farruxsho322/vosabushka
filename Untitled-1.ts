<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyABSRGOruMxS7GIkrkzdvSoZ8muZxaqG6g",
    authDomain: "vasabushka.firebaseapp.com",
    projectId: "vasabushka",
    storageBucket: "vasabushka.firebasestorage.app",
    messagingSenderId: "956450423767",
    appId: "1:956450423767:web:7e450d1a5916281ca0c192",
    measurementId: "G-QWXYMQRYG1"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>