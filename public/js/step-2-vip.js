////////////////////////////////////////////////////////////
//Main Selector code -- Working ✅
localStorage.clear();
const vehicleType = document.getElementsByClassName('main__radio');
const underTon = document.getElementById('under_1_tonne');
const trayTop = document.getElementById('traytop');
const enclosed = document.getElementById('enclosed');

vehicleType[0].addEventListener('click', () => {
    vehicleType[0].checked
        ? underTon.classList.add('set-active')
        : underTon.classList.remove('set-active');
    trayTop.classList.remove('set-active');
    enclosed.classList.remove('set-active');
    document.getElementById("num1").value = "";
    document.getElementById("num2").value = "";
    const hfSelector = document.getElementById('hf-selector');
    hfSelector.classList.remove("handload-show");
});
vehicleType[1].addEventListener('click', () => {
    vehicleType[1].checked
        ? trayTop.classList.add('set-active')
        : underTon.classList.remove('set-active');
    underTon.classList.remove('set-active');
    enclosed.classList.remove('set-active');
    document.getElementById("num1").value = "";
    document.getElementById("num2").value = "";
    const hfSelector = document.getElementById('hf-selector');
    hfSelector.classList.remove("handload-show");
});
vehicleType[2].addEventListener('click', () => {
    vehicleType[2].checked
        ? enclosed.classList.add('set-active')
        : underTon.classList.remove('set-active');
    trayTop.classList.remove('set-active');
    underTon.classList.remove('set-active');
    document.getElementById("num1").value = "";
    document.getElementById("num2").value = "";
    const hfSelector = document.getElementById('hf-selector');
    hfSelector.classList.remove("handload-show");
});
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

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
const maxWeight = {
    VB: 0.5,
    VC: 25,
    VW: 150,
    VSV: 500,
    VST: 500,
    V1T: 900,
    V2T: 1800,
    V4T: 3700,
    V6T: 5800,
    V8T: 7600,
    V12: 11500,
    V14: 13000,
    V1V: 900,
    V2V: 1600,
}

const maxItems = {
    "VB": 1,
    "VC": 3,
    "VW": 6,
}


const forkArr = [
    'SB',
    'VB',
    'EB',
    'SC',
    'VC',
    'EC',
    'SW',
    'VW',
    'EW',
    'SSV',
    'VSV',
    'ESV',
    'S1V',
    'V1V',
    'E1V',
    'S2V',
    'V2V',
    'E2V',
    'VSB',
    'ESB',
    'S1V',
    'V1B',
    'E1B',
];
const hfSelector = document.getElementById('hf-selector');

function checkNumberOfItems(el) {
    const serviceCode = localStorage.getItem("serviceCode");
    if (localStorage.getItem("serviceCode") === null) {
        alert("Please select a service.");
        document.getElementById('num1').value = "";
        document.getElementById('num1').blur();
        return;
    }

    console.log(maxItems[serviceCode]);
    console.log(+el.value);

    if (serviceCode === "SB" || serviceCode === "SW" || serviceCode === "SC") {
        if (+el.value > maxItems[serviceCode]) {
            const form = document.getElementById("form");
            form.classList.add("error");
            document.getElementById("num1").classList.add("form-control2");
            document.getElementById('num1').value = "";
            document.getElementById('num1').focus();
            document.getElementById("itemsSpan").textContent = maxItems[serviceCode];
            document.getElementById("items-error").classList.add("error-popup");
            return;
        } else {
            document.getElementById("items-error").classList.remove("error-popup");
            const form = document.getElementById("form");
            form.classList.remove("error");
            document.getElementById("num1").classList.remove("form-control2");
        }
    }
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
    const maxWeightAllowed = (+maxWeight[localStorage.getItem("serviceCode")]);
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

const imgInupts = [
    ...document.querySelectorAll("#under_1_tonne input[type = 'radio']"),
];
const imgInuptsTray = [
    ...document.querySelectorAll("#traytop input[type = 'radio']"),
];
const imgInuptsEnclosed = [
    ...document.querySelectorAll("#enclosed input[type = 'radio']"),
];

console.log(imgInupts, imgInuptsEnclosed);

let imgSelected = '';

imgInupts.forEach((img) => {
    img.addEventListener('click', () => {
        if (img.checked) {
            imgSelected = img.dataset.delivery;
            localStorage.setItem("serviceCode", imgSelected);
            console.log(imgSelected);
            forkCheck(imgSelected);
            document.getElementById("num1").value = "";
            document.getElementById("num2").value = "";
            const hfSelector = document.getElementById('hf-selector');
            hfSelector.classList.remove("handload-show");
            return;
        }
    });
});

imgInuptsTray.forEach((img) => {
    img.addEventListener('click', () => {
        if (img.checked) {
            imgSelected = img.dataset.delivery;
            localStorage.setItem("serviceCode", imgSelected);
            console.log(imgSelected);
            forkCheck(imgSelected);
            document.getElementById("num1").value = "";
            document.getElementById("num2").value = "";
            const hfSelector = document.getElementById('hf-selector');
            hfSelector.classList.remove("handload-show");
            return;
        }
    });
});

imgInuptsEnclosed.forEach((img) => {
    img.addEventListener('click', () => {
        if (img.checked) {
            imgSelected = img.dataset.delivery;
            localStorage.setItem("serviceCode", imgSelected);
            console.log(imgSelected);
            forkCheck(imgSelected);
            document.getElementById("num1").value = "";
            document.getElementById("num2").value = "";
            const hfSelector = document.getElementById('hf-selector');
            hfSelector.classList.remove("handload-show");
            return;
        }
    });
});

const hfLabel = document.getElementById('hf-label');

const forkCheck = (img) => {
    console.log(img);
    if (search(forkArr, img)) {
        console.log("Handload");
        hfLabel.innerHTML = 'Handload';
        let obj = JSON.parse(localStorage.getItem("helper"));
        console.log(obj);
        if (obj !== null && obj.hasOwnProperty("Forklift")) {
            obj['Handload'] = obj['Forklift'];
            delete obj['Forklift'];
            localStorage.setItem("helper", JSON.stringify(obj));
        }
    } else {
        console.log('Forklift');
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
        fetch("/quote/step-2/paxi/" + session_id, {
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

    fetch("/booking/step-2/vip", {
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
        window.location.href = "/booking/step-3";
    }).catch((err) => {
        console.log(err);
        alert("Some error occured. Please reload or try again later!");
        return;
    })
}