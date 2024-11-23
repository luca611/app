const cacheName='pwaname'; //PWA id here
//Register PWA service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
//Redirect HTTP to HTTPS
if(location.protocol=="http:"){
    location.href="https"+location.href.substring(4);
}
//Check for updates
let xhr=new XMLHttpRequest();
xhr.onload=function(){
    let v=xhr.responseText.trim()
    if(!localStorage.pwaversion){
        localStorage.pwaversion=v
    }else if(localStorage.pwaversion!=v){
        console.log("Updating PWA")
        delete(localStorage.pwaversion)
        caches.delete(cacheName).then(_=>{location.reload()})
    }
}
xhr.onerror=function(){
    console.log("Update check failed")
}
xhr.open("GET","pwaversion.txt?t="+Date.now())
xhr.send();

//app code

var sidebar, overlayBar;
var overlayPopUp, popUp;
var eventCreation, gradeCreation, hourCreation, nameChange, passwordChange;

window.onload = function() {
    sidebar = document.getElementById('sidebar');
    overlayBar = document.getElementById('overlaySidebar');

    overlayPopUp = document.getElementById('overlayPopUp');
    popUp = document.getElementById('popup');
}

//sidebar functions
function openSideBar() {
    sidebar.classList.add('open');
    overlayBar.classList.add('visible');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    overlayBar.classList.remove('visible');
}

//popup functions
function openPopup(){
    popUp.classList.add('open');
    overlayPopUp.classList.add('visible');
}

function closePopup(){
    popUp.classList.remove('open');
    overlayPopUp.classList.remove('visible');
}

//popUp body functions
function toggleEventCreation(){
}

function openEventCreation(){
    closeSidebar();
    toggleEventCreation();
    openPopup();
}
