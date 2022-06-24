let modal_onload_body = document.querySelector('.modal_onload')

const modalOnloadContent = document.querySelector('#modalOnLoadContent')
modalOnloadContent.style.display = 'none'

window.onload = () => {
    modalOnloadContent.style.display = 'block'
    modalOnloadContent.style.zIndex = '99999'
    modal_onload_body.classList.add('bg-active')
};


let close_onload_modal = document.querySelector('.close-onload-modal')

close_onload_modal.addEventListener('click', () => {
    modal_onload_body.classList.remove('bg-active')
})

const closeOnLoadModal = () => {
    modalOnloadContent.style.display = 'none'
    modal_onload_body.classList.remove('bg-active')
}



// Cgecking Password
const password = document.getElementById('Password')
const btn = document.getElementById('check')
const checkPassword = () => {
    if (password.value.length > 5) {
        btn.classList.remove('inactive')
        close_onload_modal.classList.remove('inactive-btn')
    }
    else {
        btn.classList.add('inactive')
        close_onload_modal.classList.add('inactive-btn')
    }
}