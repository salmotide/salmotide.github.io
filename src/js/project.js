import { prjtxt } from "./listproj/dtproj.js";
import menu from "./listproj/projlist.js";

function loadCSS() {
    const existingCSS = document.getElementById("prj-sty");

    if (existingCSS){
        existingCSS.href = `src/css/project.css?ts=${Date.now()}`;
        return;
    }
    
    const link = document.createElement("link");
    link.id = "prj-sty"
    link.rel = "stylesheet"
    link.href = "src/css/project.css"

    document.head.appendChild(link);

    console.log("berahsilprj");
}

const hero = document.querySelector(".hero");
const opnprj = document.querySelectorAll(".opn-prj");
const prjcont = document.querySelector(".prj-cont");
const prl = document.querySelector(".imgsld");
const abt = document.querySelector(".aboutme");
const prj = document.querySelector(".btnproject");
const pro = document.querySelector(".profile");
const prjnm = document.querySelector(".btnproject h1");

opnprj.forEach(function(button){
    button.addEventListener("click", function(event){
        event.preventDefault();

        if (hero.classList.contains("prj-opn")) {
            closePanels();
            prjnm.textContent = "My Project";
            return;
        }

        loadCSS();
        prjcont.innerHTML = prjtxt;
        menu.updateAll();


        hero.classList.remove("abt-opn");
        hero.classList.add("prj-opn");

        prl.classList.add("hide");
        abt.classList.add("hide");

        prjnm.textContent = "Close";
    });
});

function closePanels() {
    hero.classList.remove("abt-opn");
    hero.classList.remove("prj-opn");

    prl.classList.remove("hide");
    prj.classList.remove("hide");
    abt.classList.remove("hide");
    pro.classList.remove("left");
}