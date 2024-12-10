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

var currentTheme = 1;
let email, password, username, key;
function saveCredentials() {
  localStorage.setItem("email", email);
  localStorage.setItem("password", password);
  localStorage.setItem("username", username);
  localStorage.setItem("currentTheme", currentTheme);
}

function loadCredentials() {
  email = localStorage.getItem("email");
  password = localStorage.getItem("password");
  username = localStorage.getItem("username");
  currentTheme = localStorage.getItem("currentTheme");
}

function logout() {
  email = "";
  password = "";
  username = "";
  saveCredentials();
  toPage("page", "autenticazione");
  ebi("addButtonContainer").classList.add("hidden");
}

function log() {
  loadCredentials();
  console.log("email: " + email);
  console.log("password: " + password);
  console.log("username: " + username);
  console.log("currentTheme: " + currentTheme);

  if (email && password && username) {
    if (navigator.onLine) {
      if (login()) {
        swapToHome();
      }
    } else {
      //can't login without connection so use the page offline will connect after if account exist
      swapToHome();
    }
    applyTheme();
  };
}

function ebi(id) {
  return document.getElementById(id);
}

function applyTheme() {
  const themeColors = {
    1: "yellow",
    2: "blue",
    3: "green",
    4: "purple"
  };

  if (themeColors[currentTheme]) {
    let colorVar = `--primary-${themeColors[currentTheme]}`;
    let colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
    document.documentElement.style.setProperty("--primary-color", colorValue);

    colorVar = `--secondary-${themeColors[currentTheme]}`;
    colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
    document.documentElement.style.setProperty("--secondary-color", colorValue);

    colorVar = `--minor-${themeColors[currentTheme]}`;
    colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
    document.documentElement.style.setProperty("--minor-color", colorValue);
  }
}

//sidebar functions
function openSideBar() {
  ebi("sidebar").classList.add("open");
  ebi("overlaySidebar").classList.add("visible");
}

function closeSidebar() {
  ebi("sidebar").classList.remove("open");
  ebi("overlaySidebar").classList.remove("visible");
}

//popup functions
function openPopup() {
  ebi("popup").classList.add("open");
  ebi("overlayPopUp").classList.add("visible");
}

function closePopup() {
  ebi("popup").classList.remove("open");
  ebi("overlayPopUp").classList.remove("visible");
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
  ebi("eventName").value = "";
  ebi("eventDescription").value = "";
  ebi("eventDate").value = "";
}

function disableLoading() {
  ebi("loadingScreen").classList.add("hidden");
}

function enableLoading() {
  ebi("loadingScreen").classList.remove("hidden");
}

function swapToLogin() {
  cleanRegister();
  cleanLogin();
  ebi("welcome").classList.add("hidden");
  ebi("login").classList.remove("hidden");
  ebi("register").classList.add("hidden");
}

function swapToRegister() {
  cleanLogin();
  cleanRegister();
  ebi("welcome").classList.add("hidden");
  ebi("login").classList.add("hidden");
  ebi("register").classList.remove("hidden");
}

function swapToHome() {
  applyTheme();
  ebi("addButtonContainer").classList.remove("hidden");
  ebi("autenticazione").classList.add("hidden");
  ebi("page").classList.remove("hidden");

  ebi("pageTitle").innerText = "hi, ";
  ebi("decoratedTitle").innerText = username;
}

function toPage(page1, page2) {
  ebi(page1).classList.add("hidden");
  ebi(page2).classList.remove("hidden");
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
    return false;
  }
}

async function proceedToTheme() {
  enableLoading();
  email = ebi("registerUsername").value;
  password = ebi("registerPassword").value;
  const confirmPassword = ebi("confirmPassword").value;

  if (!email || !password || !confirmPassword) {
    displayError("registerError", "Please fill in all fields");
    disableLoading();
    return;
  }

  if (password !== confirmPassword) {
    displayError("registerError", "Passwords do not match");
    disableLoading();
    return;
  }

  const available = await checkEmailAvailability(email);

  disableLoading();
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
  ebi("registerUsername").value = "";
  ebi("registerPassword").value = "";
  ebi("confirmPassword").value = "";
  ebi("registerError").innerText = "";
}

function cleanLogin() {
  ebi("loginUsername").value = "";
  ebi("loginPassword").value = "";
  ebi("loginError").innerText = "";
}

function register() {
  displayError("registerError", "");
  enableLoading();
  username = ebi("registerName").value;
  ntema = currentTheme;

  console.log("register data: " + JSON.stringify({ email, password, ntema, username }));

  const url = serverURL + "/register";

  if (!email || !password) {
    toPage("name", "register");
    displayError("registerError", "an error occurred, please try again");
    disableLoading();
    return;
  }

  if (!username) {
    displayError("nameError", "Please fill in all fields");
    disableLoading();
    return;
  }

  const data = { email, password, ntema, name: username };
  const xhr = new XMLHttpRequest();

  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function () {
    disableLoading();
    if (xhr.status >= 200 && xhr.status < 300) {
      saveCredentials();
      swapToHome();
    } else {
      const errorData = JSON.parse(xhr.responseText);
      displayError("nameError", "Registration failed: " + errorData.error);
    }
  };

  xhr.onerror = function () {
    disableLoading();
    console.error("Network error:", xhr);
    displayError("nameError", "Network error. Please try again.");
  };

  xhr.send(JSON.stringify(data));
}

async function login() {
  displayError("loginError", "");
  enableLoading();
  if (!navigator.onLine) {
    displayError("loginError", "No connection. Please try again.");
    disableLoading();
    return false;
  }

  const url = serverURL + "/login";

  // If email and password are not already initialized, get them from the input fields
  if (!email || !password) {
    email = ebi("loginUsername").value;
    password = ebi("loginPassword").value;
  }

  if (!email || !password) {
    disableLoading();
    displayError("loginError", "Please fill in all fields");
    return false;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function () {
    disableLoading();
    if (xhr.status >= 200 && xhr.status < 300) {
      const { key, name, theme } = JSON.parse(xhr.responseText);

      currentTheme = theme;
      username = name;
      cleanLogin();
      swapToHome();

      console.log("Key:", key);
      console.log("Name:", name);
      console.log("Theme:", currentTheme);
      saveCredentials();
      return true;
    } else {
      const errorData = JSON.parse(xhr.responseText);
      displayError("loginError", "Login failed: " + (errorData.error || "Unknown error"));
    }
  };

  xhr.onerror = function () {
    disableLoading();
    displayError("loginError", "Network error. Please try again.");
    return false;
  };

  xhr.send(JSON.stringify({ email, password }));
}

function displayError(elementId, message) {
  ebi(elementId).innerText = message;
}

function setTheme(theme = 1) {
  const themeColors = {
    1: "yellow",
    2: "blue",
    3: "green",
    4: "purple"
  };

  Object.values(themeColors).forEach(color => {
    ebi(color).classList.remove("border");
  });

  currentTheme = theme;

  if (themeColors[theme]) {
    const element = ebi(themeColors[theme]);
    const colorVar = `--primary-${themeColors[theme]}`;
    const colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
    document.documentElement.style.setProperty("--currentBorderColor", colorValue);
    element.classList.add("border");
  }
}