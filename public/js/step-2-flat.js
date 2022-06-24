let imgSelected;
localStorage.clear();
const selectService = (el) => {
    console.log("clicked");
    localStorage.setItem("serviceCode", el.dataset.delivery);
    imgSelected = localStorage.getItem("serviceCode");
    forkCheck(imgSelected);
    document.getElementById("num1").value = "";
    document.getElementById("num2").value = "";
    const hfSelector = document.getElementById('hf-selector');
    hfSelector.classList.remove("handload-show");
}


function classNames(ele) {
    const element = document.getElementById(`${ele}`);
    const form = document.getElementById("form");
    form.classList.add('error');
    element.classList.add("form-control2");
}

function removeClasses(el) {
    if (el.classList.contains("form-control2")) {
        el.classList.remove("form-control2")
        const form = document.getElementById("form");
        form.classList.remove('error');
    }
}

const forkArr = [
    "FSV", "PR"
];

const maxWeight = {
    PR: 10,
    FSV: 25,
    FSK: 250,
    FHP: 500,
    PLR: 900,
}

const hfSelector = document.getElementById('hf-selector');

function numberOfItems(el) {
    localStorage.setItem("num", el.value);
}

function weight() {
    if (document.getElementById('num1').value === "") {
        alert("Please enter number of items.");
        document.getElementById('num2').value = "";
        document.getElementById('num1').focus();
        return;
    }

    if (localStorage.getItem("serviceCode") === null) {
        alert("Please select a service.");
        document.getElementById('num2').value = "";
        document.getElementById('num2').blur();
        return;
    }
    const maxWeightAllowed = (+maxWeight[localStorage.getItem("serviceCode")]) * (+document.getElementById("num1").value);
    if (parseInt(document.getElementById('num2').value) > maxWeightAllowed) {
        const form = document.getElementById("form");
        form.classList.add("error");
        document.getElementById("weight-error").classList.add("error-popup");
        document.getElementById("weightSpan").textContent = maxWeightAllowed;
        document.getElementById("num2").classList.add("form-control2");
        document.getElementById('num2').value = "";
        document.getElementById('num2').focus();
        return;
    }
    if (parseInt(document.getElementById('num2').value) >= 150) {
        const handOrFork = document.getElementById('hf-label').textContent;
        let obj = {};
        obj[handOrFork] = "yes";
        localStorage.setItem("helper", JSON.stringify(obj));
        hfSelector.classList.add('handload-show');
    } else {
        hfSelector.classList.remove('handload-show');
        localStorage.removeItem("helper");
    }
    forkCheck(imgSelected);
    localStorage.setItem("weight", document.getElementById('num2').value);
}

const hfLabel = document.getElementById('hf-label');


const forkCheck = (imgSelected) => {
    console.log(imgSelected);
    if (search(forkArr, imgSelected, 0, forkArr.length - 1)) {
        hfLabel.innerHTML = 'Handload';
        let obj = JSON.parse(localStorage.getItem("helper"));
        console.log(obj);
        if (obj !== null && obj.hasOwnProperty("Forklift")) {
            obj['Handload'] = obj['Forklift'];
            delete obj['Forklift'];
            localStorage.setItem("helper", JSON.stringify(obj));
        }
    } else {
        hfLabel.innerHTML = 'Forklift';
        let obj = JSON.parse(localStorage.getItem("helper"));
        console.log(obj);
        if (obj !== null && obj.hasOwnProperty("Handload")) {
            obj['Forklift'] = obj['Handload'];
            delete obj['Handload'];
            localStorage.setItem("helper", JSON.stringify(obj));
        }
    }
};

const search = (arr, x) => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === x) {
            return true;
        }
    }

    return false;
};

const submitStep2 = () => {

    if (document.getElementById("num1").value === "" || (+document.getElementById("num1").value) <= 0) {
        classNames("num1")
        return;
    }

    if (document.getElementById("num2").value === "" || (+document.getElementById("num2").value) <= 0) {
        classNames("num2")
        return;
    }

    if (localStorage.getItem("serviceCode") === null) {
        alert("Please select the service");
        return;
    }

    document.getElementById("submitBtn").textContent = "Loading...";

    const bookingObj = {
        serviceCode: localStorage.getItem("serviceCode"),
        numberOfItems: document.getElementById("num1").value,
        weight: document.getElementById("num2").value,
        ...(localStorage.getItem("helper") !== null && { helper: JSON.parse(localStorage.getItem("helper")) }),
    }
    console.log(bookingObj);

    const img = document.getElementById("img-logo");
    let session_id;
    if (img.dataset.booking === "quote") {
        session_id = img.dataset.session;
        fetch("/quote/step-2/flatRate/" + session_id, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingObj),
        }).then((res) => {
            if (!res.ok) {
                alert("Server Error!");
                window.location.reload();
                return;
            }
            return res.json();
        }).then((data) => {
            console.log(data);
            window.location.href = "/quote/step-3" + "/" + session_id;
        }).catch((err) => {
            console.log(err);
            alert("Some error occured. Please reload or try again later!");
            return;
        })
        return;
    }

    fetch("/booking/step-2/flatRate", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingObj),
    }).then((res) => {
        if (!res.ok) {
            alert("Server Error!");
            window.location.reload();
        }
        return res.json();
    }).then((data) => {
        console.log(data);
        window.location.href = "/booking/step-3";
    })
}