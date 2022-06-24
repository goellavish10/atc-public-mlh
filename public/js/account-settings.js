window.addEventListener("load", function () {
    const name = document.getElementById("name");
    const phone = document.getElementById("phone");

    localStorage.setItem("name", name.value);
    localStorage.setItem("phone", phone.value);
})
