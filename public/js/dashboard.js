const filter = document.querySelector('#filtering_btn')
const modal_body = document.querySelector('.modal_bg')
const close = document.querySelector('.close')
filter.addEventListener('click', () => {
    document.getElementById("modalContent").removeAttribute("style");
    document.getElementById("modalContent").style.zIndex = "99999";
    modal_body.classList.add('bg-active')
})
close.addEventListener('click', () => {
    modal_body.classList.remove('bg-active')
})
const modalContent = document.querySelector('#modalContent')
modalContent.style.display = 'none'

const showModal = () => {
    modalContent.style.display = 'block'
    modalContent.style.zIndex = '999'
}

const closeModal = () => {
    modalContent.style.display = 'none'
    modal_body.classList.remove('bg-active')
}

function changeRadio(el) {
    localStorage.setItem("el", el);
}

const fetchFilteredBookings = () => {
    const from = document.getElementById("from_date").value;
    const to = document.getElementById("to_date").value;
    const ref = document.getElementById("ref").value;

    const el = localStorage.getItem("el");

    if (el === null) {
        alert("Please select a choice to filter");
        return;
    }

    if (el === "date") {
        if (from === "" || to === "") {
            alert("Enter Valid Data");
            return;
        }
    }

    if (el === "ref") {
        if (ref === "") {
            alert("Enter Valid Data");
            return;
        }
    }

    const result = ref.replace(/ /g, ";");

    window.location = el === "date" ? `/booking/history/filter?from=${from}&to=${to}` : `/booking/history/filter?ref=${ref}`;
}