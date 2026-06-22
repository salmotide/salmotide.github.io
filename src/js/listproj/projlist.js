import projdat from "./dtproj.js";

let ctgItem;
let ctgCont;
let viewLink;
let viewImg;
let catIdx = 0;
let projIdx = 0;
let domInitialized = false;

function initDom() {
    if (domInitialized) {
        const isOldDom = !ctgCont || !document.body.contains(ctgCont);
        if (!isOldDom) return;
        domInitialized = false;
        ctgItem = null;
        ctgCont = null;
        viewImg = null;
    }

    ctgItem = document.querySelectorAll(".item");
    ctgCont = document.querySelector(".projects");
    viewLink = document.querySelector("#preview-link");
    viewImg = document.querySelector("#preview-img");

    if (!ctgItem.length || !ctgCont || !viewLink || !viewImg) {
        return;
    }

    ctgItem.forEach((el, idx) => {
        el.onclick = () => setCtg(idx);
    });

    domInitialized = true;
}

function getProj() {
    const category = projdat.categories[catIdx];
    return category === "ALL"
        ? projdat.projects
        : projdat.projects.filter(p => p.ctg === category);
}

function updateItem(item, offset, reverse = false) {
    const direction = reverse ? 1 : 1;
    const x = direction * Math.abs(offset * offset) * 20;
    const y = offset * 100;
    const opacity = 1 - Math.min(Math.abs(offset) * 0.3, 1);

    item.style.transform = `translate(${x}px, ${y}px)`;
    item.style.opacity = opacity;
    item.classList.toggle("active", offset === 0);
}

function render() {
    if (!ctgCont) return;

    const filtered = getProj();
    ctgCont.innerHTML = "";

    filtered.forEach((proj, idx) => {
        const el = document.createElement("div");
        el.className = "project-item";
        el.textContent = proj.ttl;
        el.onclick = () => {
            projIdx = idx;
            updateAll();
        };
        ctgCont.appendChild(el);
    });

    projIdx = Math.max(0, Math.min(projIdx, filtered.length - 1));
    updateProj();
}

function updateCtg() {
    if (!ctgItem) return;
    ctgItem.forEach((el, idx) => updateItem(el, idx - catIdx, true));
}

function updateProj() {
    document.querySelectorAll(".project-item").forEach((el, idx) =>
        updateItem(el, idx - projIdx, false)
    );
}

function updateView() {
    const proj = getProj()[projIdx];
    if (proj && viewImg && viewLink) {
        viewImg.src = `src/img/projects/${proj.img}`;
        viewLink.href = proj.url || "#";
    }
}

function updateAll() {
    initDom();
    render();
    updateCtg();
    updateView();
}

function setCtg(idx) {
    catIdx = Math.max(0, Math.min(idx, projdat.categories.length - 1));
    projIdx = 0;
    updateAll();
}

const menu = {
    categories: projdat.categories,
    projects: projdat.projects,
    getProj,
    render,
    updateCtg,
    updateProj,
    updateView,
    updateAll,
    setCtg
};

export default menu;