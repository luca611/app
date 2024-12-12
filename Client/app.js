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

//-----------------------------------------------------------------
//app code

const serverURL = "https://pocketdiary-server.onrender.com";

var sidebar, overlayBar;
var overlayPopUp, popUp;
var eventCreation, gradeCreation, hourCreation, nameChange, passwordChange;

var currentTheme = 1;
var currentPage = 2;

var email, password, username, privKey;
function saveCredentials() {
  const credentials = {
    email: email,
    password: password,
    username: username,
    currentTheme: currentTheme
  };
  localStorage.setItem("credentials", JSON.stringify(credentials));
}

//-----------------------------------------------------------------

function loadCredentials() {
  const credentials = JSON.parse(localStorage.getItem("credentials"));
  if (credentials) {
    email = credentials.email;
    password = credentials.password;
    username = credentials.username;
    currentTheme = credentials.currentTheme;
  }
}

//-----------------------------------------------------------------

function ebi(id) {
  return document.getElementById(id);
}

//-----------------------------------------------------------------

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

//-----------------------------------------------------------------

function closeSidebar() {
  ebi("sidebar").classList.remove("open");
  ebi("overlaySidebar").classList.remove("visible");
}

//-----------------------------------------------------------------

//popup functions
function openPopup() {
  ebi("popup").classList.add("open");
  ebi("overlayPopUp").classList.add("visible");
}

//-----------------------------------------------------------------

function closePopup() {
  ebi("popup").classList.remove("open");
  ebi("overlayPopUp").classList.remove("visible");
  //clearForm();
}

//-----------------------------------------------------------------

function setPopupPage(page = 0) {

  let pages = document.getElementsByClassName("bodyContainer");
  if (page > pages.length - 1) {
    page = 0;
  }
  Array.from(pages).forEach((e) => {
    e.classList.add("hidden");
  });

  pages[page].classList.remove("hidden");

  if (page === 0) {
    ebi("popupConfrimButton").onclick = createEvent;
  }

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

//-----------------------------------------------------------------

function swapToLogin() {
  cleanRegister();
  cleanLogin();
  ebi("welcome").classList.add("hidden");
  ebi("login").classList.remove("hidden");
  ebi("register").classList.add("hidden");
}

//-----------------------------------------------------------------

function swapToRegister() {
  cleanLogin();
  cleanRegister();
  ebi("welcome").classList.add("hidden");
  ebi("login").classList.add("hidden");
  ebi("register").classList.remove("hidden");
}

//-----------------------------------------------------------------

function swapToHome() {
  applyTheme();
  setPopupPage(0);
  updateActivePageLink();

  ebi("addButtonContainer").classList.remove("hidden");
  ebi("autenticazione").classList.add("hidden");
  ebi("page").classList.remove("hidden");

  ebi("pageTitle").innerText = "hi, ";
  ebi("decoratedTitle").innerText = username;

  loadNotes();
}

//-----------------------------------------------------------------

function updateActivePageLink() {
  let links = document.getElementsByClassName("barLink");
  Array.from(links).forEach((link) => {
    link.classList.remove("active");
  });

  links[currentPage].classList.add("active");
}

function toPage(page1, page2) {
  ebi(page1).classList.add("hidden");
  ebi(page2).classList.remove("hidden");
}

function disableAddButton() {
  ebi("addButtonContainer").classList.add("hidden");
}

function showAddButton() {
  ebi("addButtonContainer").classList.remove("hidden");
}

function hideAllPages() {
  let pages = document.getElementsByClassName("section");
  Array.from(pages).forEach((page) => {
    page.classList.add("hidden");
  });
}

//-----------------------------------------------------------------

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

//-----------------------------------------------------------------

function cleanRegister() {
  ebi("registerUsername").value = "";
  ebi("registerPassword").value = "";
  ebi("confirmPassword").value = "";
  ebi("registerError").innerText = "";
}

//-----------------------------------------------------------------

function cleanLogin() {
  ebi("loginUsername").value = "";
  ebi("loginPassword").value = "";
  ebi("loginError").innerText = "";
}

//-----------------------------------------------------------------

function displayError(elementId, message) {
  ebi(elementId).innerText = message;
}

//-----------------------------------------------------------------

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

/*
  navigation functions

  -> toSettings: hides all pages and shows the settings page
  -> toHome: hides all pages and shows the home page
*/

function toSettings() {
  disableAddButton();
  hideAllPages();
  ebi("settings").classList.remove("hidden");
  ebi("pageTitle").innerText = "Settings";
  ebi("decoratedTitle").innerText = "";
  currentPage = 0;
  updateActivePageLink();
  closeSidebar();
}

//-----------------------------------------------------------------

function toHome() {
  loadNotes();
  setPopupPage(0);
  showAddButton();
  hideAllPages();
  ebi("homepage").classList.remove("hidden");
  ebi("pageTitle").innerText = "hi, ";
  ebi("decoratedTitle").innerText = username;
  currentPage = 2;
  updateActivePageLink();
  closeSidebar();
}

//-----------------------------------------------------------------

function showPlaceholder() {
  ebi("eventsList").classList.add("hidden");
  ebi("eventPlaceholder").classList.remove("hidden");
  ebi("eventPlaceholder").classList.add("visible");
}

//-----------------------------------------------------------------


function showNotes(notes) {
  ebi("eventsList").classList.remove("hidden");
  ebi("eventPlaceholder").classList.add("hidden");
  ebi("eventPlaceholder").classList.remove("visible");
  let list = ebi("eventsList");
  list.innerHTML = "";

  notes.forEach((note, index) => {
    let event = document.createElement("div");
    event.classList.add("upcomingEvent");
    event.id = note.id;
    event.onclick = () => showDeleteButton(note.id);

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("eventButtonContainer");

    let button = document.createElement("button");
    button.classList.add("eventButton");
    button.onclick = () => openEvent(note);

    let icon = document.createElement("img");
    icon.classList.add("eventIcon");
    icon.src = "resources/icons/edit.svg";
    icon.alt = "edit";

    button.appendChild(icon);
    buttonContainer.appendChild(button);

    let infoContainer = document.createElement("div");
    infoContainer.classList.add("eventInfoContainer");

    let title = document.createElement("h3");
    title.classList.add("eventTitle");
    title.innerText = note.title;

    let info = document.createElement("p");
    info.classList.add("eventInfo");
    info.innerText = note.description;

    infoContainer.appendChild(title);
    infoContainer.appendChild(info);

    event.appendChild(buttonContainer);
    event.appendChild(infoContainer);

    list.appendChild(event);
  });
}

//-----------------------------------------------------------------

function showDeleteButton(id) {
  if (!ebi(id).querySelector(".deleteNoteButton")) {
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("deleteNoteButton");

    let deleteIcon = document.createElement("img");
    deleteIcon.src = "resources/icons/delete.svg";
    deleteIcon.classList.add("eventIcon");

    deleteButton.appendChild(deleteIcon);
    ebi(id).appendChild(deleteButton);

    deleteButton.onclick = (e) => {
      e.stopPropagation();
      deleteEvent(id);
    };

    document.addEventListener("click", (e) => {
      if (!ebi(id).contains(e.target)) {
        deleteButton.remove();
      }
    });
  }
}

//-----------------------------------------------------------------

function deleteEvent(id) {
  const url = serverURL + "/deleteNote";
  const data = { key: privKey, id };

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      loadNotes();
      //add a success message
    } else {
      const errorData = JSON.parse(xhr.responseText);
      console.error("Failed to delete event:", errorData.error);
    }
  };

  xhr.onerror = function () {
    console.error("Network error:", xhr);
  };

  xhr.send(JSON.stringify(data));
}

/*
  auth functions
 
  -> register: sends a POST request to the server to register a new user
  -> login: sends a POST request to the server to login a user
 
*/

async function checkEmailAvailability(email) {
  if (!navigator.onLine) {
    return false;
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", serverURL + "/checkAvailability", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else {
        resolve(false);
      }
    };

    xhr.onerror = function () {
      resolve(false);
    };

    xhr.send(JSON.stringify({ email }));
  });
}

//-----------------------------------------------------------------


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

//-----------------------------------------------------------------


async function logout() {
  email = "";
  password = "";
  username = "";
  saveCredentials();
  toPage("page", "autenticazione");
  ebi("addButtonContainer").classList.add("hidden");
}

//-----------------------------------------------------------------

async function login() {
  displayError("loginError", "");
  enableLoading();
  if (!navigator.onLine) {
    displayError("loginError", "No connection. Please try again.");
    disableLoading();
    return false;
  }

  const url = serverURL + "/login";

  /*
    had to double check if the email and password are not empty
    to see before if they were saved and ,if not, get them from the input fields 
  */
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

      privKey = key;
      currentTheme = theme;
      username = name;
      cleanLogin();
      swapToHome();
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

//-----------------------------------------------------------------

function autologin() {
  loadCredentials();

  if (email && password && username) {
    if (navigator.onLine) {
      if (login() && typeof key !== undefined) {
        swapToHome();
      }
    } else {
      swapToHome();
    }
    applyTheme();
  };
}

/*
  db manitulation functions

  -> createEvent: sends a POST request to the server to create a new event

*/

async function createEvent() {
  const title = ebi("eventName").value;
  const description = ebi("eventDescription").value;
  const date = ebi("eventDate").value;



  if (!title || !description || !date) {
    displayError("eventError", "Please fill in all fields");
    return;
  }

  const url = serverURL + "/addNote";
  const data = { key: privKey, title, description, date, email };

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      displayError("eventError", "");
      title.value = "";
      description.value = "";
      date.value = "";
      closePopup();
      loadNotes();
    } else {
      const errorData = JSON.parse(xhr.responseText);
      displayError("eventError", "Failed to create event: " + (errorData.error || "Unknown error"));
    }
  };

  xhr.onerror = function () {
    displayError("eventError", "Network error. Please try again.");
  };

  xhr.send(JSON.stringify(data));
}

//-----------------------------------------------------------------
function loadNotes() {
  const url = serverURL + "/getTodayNotes";

  if (!email || !privKey) {
    console.error("Email or key is missing:", { email, privKey });
    return;
  }

  const body = JSON.stringify({ key: privKey, email });

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        if (Array.isArray(JSON.parse(xhr.responseText).notes)) {
          if (data.notes.length > 0) {
            showNotes(data.notes);
          } else {
            showPlaceholder();
            return;
          }
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (e) {
        throw new Error("Error parsing response" + e);
      }
    } else {
      throw new Error(xhr.responseText);
    }
  };

  xhr.onerror = function () {
    throw new Error(xhr.statusText);
  };
  xhr.send(body);
}