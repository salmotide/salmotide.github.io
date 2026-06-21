function loadCSS() {
    const existingCSS = document.getElementById("abt-sty");

    if (existingCSS){
        return
    }

    const link = document.createElement("link");
    link.id = "abt-sty"
    link.rel = "stylesheet"
    link.href = "src/css/about.css"

    document.head.appendChild(link);

    console.log("berhasil")
}


const hero = document.querySelector(".hero");
const opnabt = document.querySelectorAll(".opn-abt");
const abt = document.querySelector(".aboutme")
const abtcont = document.querySelector(".abt-cont");
const prl = document.querySelector(".imgsld");
const prj = document.querySelector(".btnproject");
const abtnm = document.querySelector(".aboutme h1");

const abttxt =`
<h1>About Me</h1>

<p>Hello I am salmotide i like creating somting fun</p>

`;

opnabt.forEach(function(button) {
    button.addEventListener("click", function(event){
        event.preventDefault();

        if (hero.classList.contains("abt-opn")) {
            closePanels();
            abtnm.textContent = "About Me";
            return;
        }
    
        loadCSS();

        abtcont.innerHTML = abttxt;
        hero.classList.remove("prj-opn");
        hero.classList.add("abt-opn");

        abt.classList.remove("hide");
        prl.classList.add("hide");
        prj.classList.add("hide");
        
        abtnm.textContent = "Close";
    });
});

function closePanels() {
    hero.classList.remove("abt-opn");
    hero.classList.remove("prj-opn");

    prl.classList.remove("hide");
    prj.classList.remove("hide");
    abt.classList.remove("hide");
}