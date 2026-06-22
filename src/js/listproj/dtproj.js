export const prjtxt = `

<div class="container">
    
    <div class="menu">
        <div class="item">ALL</div>
        <div class="item">WEB</div>
        <div class="item">BOT</div>
        <div class="item">DESKTOP</div>
        <div class="item">GAME</div>
    </div>

    <div class="projects"></div>

    <div id="preview" class="preview">
        <div class="ring ring1"></div>
        <div class="ring ring2"></div>
        <a id="preview-link" href="#" target="_blank" rel="noopener noreferrer">
            <img id="preview-img" src="https://picsum.photos/800" alt="Preview image">
        </a>
    </div>


</div>`

const categories = ["ALL", "WEB", "BOT", "DESKTOP", "GAME"];

const projects = [
    { ttl: "StartPage", ctg: "WEB", img: "ocstartpage.webp", url: "https://github.com/salmotide/ocean-startpage" },
    { ttl: "WhatsApp Bot", ctg: "BOT", img: "bot.webp", url: "https://github.com/salmotide/SalBot" },
    { ttl: "Linux", ctg: "DESKTOP", img: "desktop.webp", url: "https://github.com/salmotide/linuxsetup" },
];

const projdat = {
    categories,
    projects,
};

export default projdat;