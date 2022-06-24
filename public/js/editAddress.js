const edit = document.getElementById('edit-btn');

const showForm = (element1, element2, element3, element4) => {
    let form = document.getElementById(element1);
    let text = document.getElementById(element2);
    let btn = document.getElementById(element3);
    let add = document.getElementById(element4);
    add.style.display = 'block';
    form.style.display = 'flex';
    text.style.display = 'none';
    btn.style.display = 'none';
}

const saveForm = (element1, element2, element3, element4) => {
    let form = document.getElementById(element1);
    let text = document.getElementById(element2);
    let btn = document.getElementById(element3);
    let add = document.getElementById(element4);
    add.style.display = 'flex';
    form.style.display = 'none';
    text.style.display = 'flex';
    btn.style.display = 'flex';
}