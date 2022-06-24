// /////////////////////////
// Job Details Page Specific
// /////////////////////////
const accord = document.getElementsByClassName('accordian-label')
for (let i of accord) {
    i.addEventListener('click', () => {
        i.classList.toggle('active')
    })
}


const pod = document.getElementById('pod-btn')

const podText = () => {
    if (window.innerWidth <= 576) {
        pod.innerText = 'Download POD'
    }
    else {
        pod.innerText = 'Download Proof of Delivery'

    }
}
window.onload = () => podText()
window.onresize = () => podText()



// window.onload = ()=>{
//   if (window.innerWidth<=576)
// }