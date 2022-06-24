// /////////////////////////
//  Modal JS
// ////////////////////////
var btn = document.querySelector('.btn');
var modal_body = document.querySelector('.modal_bg');
var close = document.querySelector('.close');
btn.addEventListener('click', () => {
    document.getElementById("modalContent").removeAttribute("style");
    document.getElementById("modalContent").style.zIndex = "99999";
    modal_body.classList.add('bg-active');
})
close.addEventListener('click', () => {
    modal_body.classList.remove('bg-active');
})
const modalContent = document.querySelector('#modalContent');
modalContent.style.display = "none";

const showModal = () => {
    modalContent.style.display = "block";
    modalContent.style.zIndex = "999";
}

const closeModal = () => {
    modalContent.style.display = "none";
    modal_body.classList.remove('bg-active');
}