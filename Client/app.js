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

function topage(page1, page2) {
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

    await response.json();

    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking email availability:", error);
    return false;
  }
}

async function proceedToTheme() {
  console.log("Proceeding to the next step...");
  let email = document.getElementById("registerUsername").value;
  let password = document.getElementById("registerPassword").value;
  let confirmPassword = document.getElementById("confirmPassword").value;

  if (email == "" || password == "" || confirmPassword == "") {
    document.getElementById("registerError").innerText =
      "Please fill in all fields";
    return;
  }

  if (password != confirmPassword) {
    document.getElementById("registerError").innerText =
      "Passwords do not match";
    return;
  }
  let available = await checkEmailAvailability(email);

  console.log("Email availability:", available);
  if (available) {
    topage("register", "theme");
  } else {
    if (navigator.onLine) {
      document.getElementById("registerError").innerText = "Email already taken";
      return
    }
    document.getElementById("registerError").innerText = "No connection. Please try again.";
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
  let email = document.getElementById("registerUsername").value;
  let password = document.getElementById("registerPassword").value;
  let confirmPassword = document.getElementById("confirmPassword").value;

  if (email == "" || password == "" || confirmPassword == "") {
    document.getElementById("registerError").innerText =
      "Please fill in all fields";
    return;
  }

  const url = serverURL + "/register";

  if (password != confirmPassword) {
    document.getElementById("registerError").innerText =
      "Passwords do not match";
    return;
  }

  //----waiting for pages to be done---
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
      swapToRegister();
      const errorData = await response.json();
      console.error("Error:", errorData);
      document.getElementById("registerError").innerText =
        "Registration failed: " + errorData.message;
    } else {
      const result = await response.json();
      cleanRegister();
      swapToHome();
    }
  } catch (error) {
    console.error("Network error:", error);
    swapToRegister();
    document.getElementById("registerError").innerText =
      "Network error. Please try again.";
  }
}



async function login() {
  if (!navigator.onLine) {
    document.getElementById("loginError").innerText =
      "No connection. Please try again.";
    return;
  }

  const url = serverURL + "/login";

  let email = document.getElementById("loginUsername").value;
  let password = document.getElementById("loginPassword").value;

  if (email === "" || password === "") {
    document.getElementById("loginError").innerText =
      "Please fill in all fields";
    return;
  }

  const data = { email, password };
  console.log("Sending data:", data); // Debug payload

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
      document.getElementById("loginError").innerText =
        "Login failed: " + (errorData.message || "Unknown error");
    } else {
      const result = await response.json();
      cleanLogin();
      swapToHome();
    }
  } catch (error) {
    console.error("Network error:", error);
    document.getElementById("loginError").innerText =
      "Network error. Please try again.";
  }
}


function setTheme(theme) {
  let colorArry = [];
  let yellow = document.getElementById("yellow");
  let blue = document.getElementById("blue");
  let green = document.getElementById("green");
  let purple = document.getElementById("purple");

  colorArry.push(yellow, blue, green, purple);

  colorArry.forEach((color) => {
    color.classList.remove("border");
  });

  currentTheme = theme;

  switch (theme) {
    case 1: {
      let primaryYellowValue = getComputedStyle(document.documentElement).getPropertyValue('--primary-yellow');
      document.documentElement.style.setProperty("--currentBorderColor", primaryYellowValue);
      yellow.classList.add("border");
      break;
    }
    case 2: {
      let primaryBlueValue = getComputedStyle(document.documentElement).getPropertyValue('--primary-blue');
      document.documentElement.style.setProperty("--currentBorderColor", primaryBlueValue);
      blue.classList.add("border");
      break;
    }
    case 3: {
      let primaryGreenValue = getComputedStyle(document.documentElement).getPropertyValue('--primary-green');
      document.documentElement.style.setProperty("--currentBorderColor", primaryGreenValue);
      green.classList.add("border");
      break;
    }
    case 4: {
      let primaryPurpleValue = getComputedStyle(document.documentElement).getPropertyValue('--primary-purple');
      document.documentElement.style.setProperty("--currentBorderColor", primaryPurpleValue);
      purple.classList.add("border");
      break;
    }

  }
}