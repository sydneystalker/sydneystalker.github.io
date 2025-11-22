//   Author: Sydney Stalker
//   Class: CST 336 - Internet Programing
//   Date: 11/20/2025
//   Assignment: Midterm 
//   File: script.css
//   Abstract: 
const VIDEO_ID = "a_xpPdWWTMQ"
const BASE = `https://csumb.space/api/videoLikes.php?videoId=${encodeURIComponent(VIDEO_ID)}`;

//Step 1 boot and Step 2 show inital likes
document.addEventListener("DOMContentLoaded", loadInitalLikes());

//Wire Buttons
document.getElementByID("likeButton").addEventListener("click", onLike);
document.getElementByID("unlikeButton").addEventListener("click", onCancelLike);

//TODO: some may not be worth the points, come back
document.getElementByID("commentButton").addEventListener("click", onShowComment);
document.getElementByID("questionButton").addEventListener("click", onShowQuestion);
document.getElementByID("reportButton").addEventListener("click", onShowReport);

//LoadInitalLikes
function LoadInitalLikes(){
    fetch(`${BASE}?videoId=$encodeURIComponent(VIDEO_ID)`)
    .then(response => response.json())
    .then(data =>{
        document.getElementbyID("likesCount").textContent = 
        (typeof data.likes === "number") ? data.likes : "0";
    })
    .catch(() => {
    document.getElementbyID("likesCount").textContent = "0";
    });
}

//update likes
function likeVideo(){
    fecth(`${BASE}?videoId=$encodeURIComponent(VIDEO_ID)&action=like`)
    .then(response => response.json())
    .then(data => { 
        document.getElementbyID("likesCount").textContent = data.likes ?? 0;
    });
}
