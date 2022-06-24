let btn1 = document.querySelector('.acc-btn')
let modal_body = document.querySelector('.modal_bg')

const modalContent = document.querySelector('#modalContent')
modalContent.style.display = 'none'

btn1.addEventListener('click', () => {
    modal_body.classList.add('bg-active')
})

const showModal = () => {
    modalContent.style.display = 'block'
    modalContent.style.zIndex = '99999'
}
let close = document.querySelector('.close')

close.addEventListener('click', () => {
    modal_body.classList.remove('bg-active')
})

const closeModal = () => {
    modalContent.style.display = 'none'
    modal_body.classList.remove('bg-active')
}


let modal_edit_body = document.querySelector('.modal_edit_bg')

const modalEditContent = document.querySelector('#modalEditContent')
modalEditContent.style.display = 'none'


const showEditModal = () => {
    modalEditContent.style.display = 'block'
    modalEditContent.style.zIndex = '99999'
    modal_edit_body.classList.add('bg-active')
}

let close_modal = document.querySelector('.close-edit-modal')

close_modal.addEventListener('click', () => {
    modal_edit_body.classList.remove('bg-active')
})

const closeEditModal = () => {
    modalEditContent.style.display = 'none'
    modal_edit_body.classList.remove('bg-active')
}


// Expiry Input
const monthInput = document.querySelector('.month');
const yearInput = document.querySelector('.year');

const focusSibling = function (target, direction, callback) {
    const nextTarget = target[direction];
    nextTarget && nextTarget.focus();
    // if callback is supplied we return the sibling target which has focus
    callback && callback(nextTarget);
}

// input event only fires if there is space in the input for entry. 
// If an input of x length has x characters, keyboard press will not fire this input event.
monthInput.addEventListener('input', (event) => {

    const value = event.target.value.toString();
    // adds 0 to month user input like 9 -> 09
    if (value.length === 1 && value > 1) {
        event.target.value = "0" + value;
    }
    // bounds
    if (value === "00") {
        event.target.value = "01";
    } else if (value > 12) {
        event.target.value = "";
    }
    // if we have a filled input we jump to the year input
    2 <= event.target.value.length && focusSibling(event.target, "nextElementSibling");
    event.stopImmediatePropagation();
});

yearInput.addEventListener('keydown', (event) => {
    // if the year is empty jump to the month input
    if (event.key === "Backspace" && event.target.selectionStart === 0) {
        focusSibling(event.target, "previousElementSibling");
        event.stopImmediatePropagation();
    }
});
