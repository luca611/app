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

const serverURL = "https://pocketdiary-server.onrender.com";

var sidebar, overlayBar;
var overlayPopUp, popUp;
var eventCreation, gradeCreation, hourCreation, nameChange, passwordChange;

let currentTheme = 1;
let email, password, username, key;

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
function toggleEventCreation() { }

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
  cleanRegister();
  cleanLogin();
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("register").classList.add("hidden");
}

function swapToRegister() {
  cleanLogin();
  cleanRegister();
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("login").classList.add("hidden");
  document.getElementById("register").classList.remove("hidden");
}

function swapToHome() {
  document.getElementById("addButtonContainer").classList.remove("hidden");
  document.getElementById("autenticazione").classList.add("hidden");
  document.getElementById("page").classList.remove("hidden");
}

function toPage(page1, page2) {
  document.getElementById(page1).classList.add("hidden");
  document.getElementById(page2).classList.remove("hidden");
}

async function checkEmailAvailability(email) {
  if (!navigator.onLine) {
    return false;
  }

  try {
    const response = await fetch(serverURL + "/checkAvailability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      await response.json();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking email availability:", error);
    return false;
  }
}

async function proceedToTheme() {
  email = document.getElementById("registerUsername").value;
  password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!email || !password || !confirmPassword) {
    displayError("registerError", "Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    displayError("registerError", "Passwords do not match");
    return;
  }

  const available = await checkEmailAvailability(email);

  if (available) {
    toPage("register", "theme");
  } else {
    const errorMessage = navigator.onLine
      ? "Email already taken"
      : "No connection. Please try again.";
    displayError("registerError", errorMessage);
  }
}


function cleanRegister() {
  document.getElementById("registerUsername").value = "";
  document.getElementById("registerPassword").value = "";
  document.getElementById("confirmPassword").value = "";
  document.getElementById("registerError").innerText = "";
}

function cleanLogin() {
  document.getElementById("loginUsername").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginError").innerText = "";
}

async function register() {
  username = document.getElementById("registerName").value;
  ntema = currentTheme;

  console.log("register data: "+JSON.stringify({ email, password, ntema, username }));

  const url = serverURL + "/register";

  if (!email || !password) {
    toPage("name", "register");
    displayError("registerError", "an error occurred, please try again");
    return;
  }

  if(!username){
    displayError("nameError", "Please fill in all fields");
    return;
  }  

  const data = { email, password, ntema, name: username };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      displayError("nameError", "Registration failed: " + errorData.error);
    } else {
      await response.json();
      swapToHome();
    }
  } catch (error) {
    console.error("Network error:", error);
    displayError("nameError", "Network error. Please try again.");ù
  }
}

async function login() {
  if (!navigator.onLine) {
    displayError("loginError", "No connection. Please try again.");
    return;
  }

  const url = serverURL + "/login";
  email = document.getElementById("loginUsername").value;
  password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    displayError("loginError", "Please fill in all fields");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      displayError("loginError", "Login failed: " + (errorData.error || "Unknown error"));
    } else {
      const { key, name, theme } = await response.json();

      currentTheme = theme;
      cleanLogin();
      swapToHome();

      console.log("Key:", key); 
      console.log("Name:", name); 
      console.log("Theme:", currentTheme);
    }
  } catch (error) {
    displayError("loginError", "Network error. Please try again.");
  }
}


function displayError(elementId, message) {
  document.getElementById(elementId).innerText = message;
}

function setTheme(theme) {
  const themeColors = {
    1: "yellow",
    2: "blue",
    3: "green",
    4: "purple"
  };

  Object.values(themeColors).forEach(color => {
    document.getElementById(color).classList.remove("border");
  });

  currentTheme = theme;

  if (themeColors[theme]) {
    const element = document.getElementById(themeColors[theme]);
    const colorVar = `--primary-${themeColors[theme]}`;
    const colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
    document.documentElement.style.setProperty("--currentBorderColor", colorValue);
    element.classList.add("border");
  }
}
