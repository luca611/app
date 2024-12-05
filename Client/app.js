const cacheName = "pwaname"; //PWA id here
//Register PWA service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
//Redirect HTTP to HTTPS
if (location.protocol == "http:") {
  location.href = "https" + location.href.substring(4);
}
//Check for updates
let xhr = new XMLHttpRequest();
xhr.onload = function () {
  let v = xhr.responseText.trim();
  if (!localStorage.pwaversion) {
    localStorage.pwaversion = v;
  } else if (localStorage.pwaversion != v) {
    console.log("Updating PWA");
    delete localStorage.pwaversion;
    caches.delete(cacheName).then((_) => {
      location.reload();
    });
  }
};
xhr.onerror = function () {
  console.log("Update check failed");
};
xhr.open("GET", "pwaversion.txt?t=" + Date.now());
xhr.send();

//app code

var sidebar, overlayBar;
var overlayPopUp, popUp;
var eventCreation, gradeCreation, hourCreation, nameChange, passwordChange;

window.onload = function () {
  sidebar = document.getElementById("sidebar");
  overlayBar = document.getElementById("overlaySidebar");

  overlayPopUp = document.getElementById("overlayPopUp");
  popUp = document.getElementById("popup");
};

//sidebar functions
function openSideBar() {
  sidebar.classList.add("open");
  overlayBar.classList.add("visible");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlayBar.classList.remove("visible");
}

//popup functions
function openPopup() {
  popUp.classList.add("open");
  overlayPopUp.classList.add("visible");
}

function closePopup() {
  popUp.classList.remove("open");
  overlayPopUp.classList.remove("visible");
  //clearForm();
}

//popUp body functions
function toggleEventCreation() {}

function openEventCreation() {
  closeSidebar();
  toggleEventCreation();
  //clearForm();
  openPopup();
}

function clearForm() {
  var form = document.getElementById("eventName");
  form.value = "";
  form = document.getElementById("eventDescription");
  form.value = "";
  form = document.getElementById("eventDate");
  form.value = "";
}

function disableLoading() {
  document.getElementById("loadingScreen").classList.add("hidden");
}

function swapToLogin() {
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("register").classList.add("hidden");
}

function swapToRegister() {
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("login").classList.add("hidden");
  document.getElementById("register").classList.remove("hidden");
}

function swapToHome() {
  document.getElementById("autenticazione").classList.add("hidden");
  document.getElementById("page").classList.remove("hidden");
}

async function register() {
  let email = document.getElementById("registerUsername").value;
  let password = document.getElementById("registerPassword").value;
  let confirmPassword = document.getElementById("confirmPassword").value;

  if(email == "" || password == "" || confirmPassword == ""){
    document.getElementById("registerError").innerText=("Please fill in all fields");
    return;
  }

  const url = "https://pocketdiary-server.onrender.com/register";

  if (password != confirmPassword) {
    document.getElementById("registerError").innerText=("Passwords do not match");
    return;
  }

  //----waiting for games to be done---
  let ntema = 1;
  let name = "testAccount";
  //-----------------------------------

  const data = { email, password, ntema, name };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData);
      document.getElementById("registerError").innerText=("Registration failed: " + errorData.message);
    } else {
      const result = await response.json();
      console.log("Success:", result);
      swapToHome();
    }
  } catch (error) {
    console.error("Network error:", error);
    document.getElementById("registerError").innerText=("Network error. Please try again.");
  }
}

async function login() {
  const url = 'https://pocketdiary-server.onrender.com/login';

  let email = document.getElementById('loginUsername').value;
  let password = document.getElementById('loginPassword').value;

  if(email == "" || password == ""){
    document.getElementById("loginError").innerText=("Please fill in all fields");
    return;
  }

  const data = { email, password };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error:', errorData);
      document.getElementById("loginError").innerText=('Login failed: ' + errorData.message);
    } else {
      const result = await response.json();
      console.log('Success:', result);
      document.getElementById("loginError").innerText=('Login successful! Your key is: ' + result.key);
    }
  } catch (error) {
    console.error('Network error:', error);
    document.getElementById("loginError").innerText=('Network error. Please try again.'+ error.message);
  }
}


