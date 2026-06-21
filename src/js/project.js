function loadCSS() {
    const existingCSS = document.getElementById("prj-sty");

    if (existingCSS){
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
const prjnm = document.querySelector(".btnproject h1");

const prjtxt = `
<h1>My Project</h1>

<a class="prj-list" href="https://github.com/salmotide/ocean-startpage">
    <img class="prj-img" src="src/img/projects/ocstartpage.webp" alt="Ocean StartPage">
    <h3>My Startpage</h3>
</a>

<a class="prj-list" href="https://github.com/salmotide/SalBot">
    <img class="prj-img" src="src/img/projects/bot.webp">
    <h3>bot whatsapp</h3>
</a>

<a class="prj-list" href="https://github.com/salmotide/linuxsetup">
    <img class="prj-img" src="src/img/projects/desktop.webp">
    <h3>My Linux Setup</h3>
</a>
`

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
}