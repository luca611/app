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

//sidebar functions
function openSideBar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
}


function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
}
