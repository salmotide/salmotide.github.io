const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const overlay = document.querySelector(".overlay");

menuToggle.addEventListener("click", function (){
  menuPanel.classList.toggle("active");
  overlay.classList.toggle("active");
  menuToggle.classList.toggle("active");
});

overlay.addEventListener("click", function(){
  menuPanel.classList.remove("active");
  overlay.classList.remove("active");
  menuToggle.classList.remove("active");
});
