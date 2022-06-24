// /////////////////////////
//  Save Address checkbox
// ////////////////////////
var check = document.querySelector('#check')
check.addEventListener('click', () => {
    if (check.className == 'check1') {
        check.className = 'check2'
    } else {
        check.className = 'check1'
    }
})

// //////////////////////
// Form Validation
// /////////////////////
const formCheck = () => {
    const nameIn = document.getElementById('name')
    const numIn = document.getElementById('phone_number')
    const addressIn = document.getElementById('address')
    const form = document.getElementById('step-3-form')
    if (nameIn.classList.contains('form-control2')) {
        form.classList.add('error')
    }
    else if (numIn.classList.contains('form-control2')) {
        form.classList.add('error')
    }
    else if (addressIn.classList.contains('form-control2')) {
        form.classList.add('error')
    }
}

const nameCheck = () => {
    const form = document.getElementById('step-3-form')
    const nameIn = document.getElementById('name')
    const nameError = document.getElementById('name-error')
    let nameLen = 0
    nameLen = parseInt(nameIn.value.length)
    if (nameLen > 20) {
        nameIn.classList.add('form-control2')
        nameError.classList.add('error-popup')
        form.classList.add('error')
    }
    else {
        nameIn.classList.remove('form-control2')
        form.classList.remove('error')
        nameError.classList.remove('error-popup')
        formCheck();
    }
}
const numCheck = () => {
    const form = document.getElementById('step-3-form')
    const nameIn = document.getElementById('phone_number')
    const nameError = document.getElementById('phone_number-error')
    let nameLen = 0
    nameLen = parseInt(nameIn.value.length)
    if (nameLen > 10 || nameLen < 10) {
        nameIn.classList.add('form-control2')
        nameError.classList.add('error-popup')
        form.classList.add('error')
    }
    else {
        nameIn.classList.remove('form-control2')
        form.classList.remove('error')
        nameError.classList.remove('error-popup')
        formCheck();

    }
}
const addressCheck = () => {
    const form = document.getElementById('step-3-form')
    const nameIn = document.getElementById('address')
    const nameError = document.getElementById('address-error')
    let nameLen = 0
    nameLen = parseInt(nameIn.value.length)
    if (nameLen <= 2) {
        nameIn.classList.add('form-control2')
        nameError.classList.add('error-popup')
        form.classList.add('error')
    }
    else {
        nameIn.classList.remove('form-control2')
        form.classList.remove('error')
        nameError.classList.remove('error-popup')
        formCheck();
    }
}

// Selecting from saved Addresses
const addressSelector = [...document.getElementsByClassName("address_custom_radio")];

addressSelector.map((el, index) => {
    el.addEventListener('click', () => {
        let addressObj = {};
        if (el.checked) {
            const address = document.getElementById(`address_p_${el.id.split("_")[1]}`);
            console.log(address.textContent.trim());
            addressObj.address = address.textContent.trim();
            if (document.getElementById(`business_h_${el.id.split("_")[1]}`)) {
                addressObj.businessName = document.getElementById(`business_h_${el.id.split("_")[1]}`).textContent.trim();
            }

            if (document.getElementById(`postcode_p_${el.id.split("_")[1]}`)) {
                addressObj.postcode = document.getElementById(`postcode_p_${el.id.split("_")[1]}`).textContent.trim();
            }


            console.log(addressObj);

            localStorage.setItem("selectedAddress", JSON.stringify(addressObj));
        }
    })
})

const selectAddress = () => {
    const addressObj = JSON.parse(localStorage.getItem("selectedAddress"));

    const address = document.getElementById('address');

    address.value = addressObj.address;

    if (addressObj.businessName) {
        const businessName = document.getElementById("business_name");
        businessName.value = addressObj.businessName;
    }

    if (addressObj.postcode) {
        const postcode = document.getElementById("postcode");
        postcode.value = addressObj.postcode;
    }
    closeModal();
}

function classNames(ele) {
    const element = document.getElementById(`${ele}`);
    const small = document.getElementById(`${ele}-error`);
    const form = document.getElementById("step-3-form");
    form.classList.add('error');
    element.classList.add("form-control2");
    small.classList.add("error-popup");
}

function removeClasses(el) {
    if (el.classList.contains("form-control2")) {
        el.classList.remove("form-control2")
        const form = document.getElementById("step-3-form");
        const small = document.getElementById(`${el.id}-error`);
        form.classList.remove('error');
        small.classList.remove("error-popup");
    }
}

// Window load listener
window.addEventListener('load', () => {
    localStorage.clear();
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    let value = params.q;
    if (value === "wrong-suburb") {
        classNames("suburb");
        document.getElementById("suburb-error").textContent = "Please enter a correct suburb";
    }
})

// Collecting all the form data in Local Storage
const business_name = document.getElementById("business_name");
const phone_number = document.getElementById("phone_number");
const unit = document.getElementById("unit");
business_name.addEventListener("keyup", () => {
    localStorage.setItem("businessName", business_name.value);
})
phone_number.addEventListener("keyup", () => {
    localStorage.setItem("phoneNumber", phone_number.value);
})
address.addEventListener("keyup", () => {
    localStorage.setItem("address", address.value);
})
unit.addEventListener("keyup", () => {
    localStorage.setItem("unit", unit.value);
})

// Deleting Address
const deleteAddress = (addressId) => {
    const deleteBtn = document.getElementById(addressId);
    deleteBtn.textContent = "Deleting...";

    fetch(`/booking/delete-address/${addressId}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addressId }),
    }).then((res) => {
        if (!res.ok) {
            alert("Server Error!");
            window.location.reload();
        }
        return res.json();
    }).then((data) => {
        if (data.msg === "deleted") {
            alert("Address Deleted");
            window.location.reload();
        }
    })
}

// autocomplete for Suburb
localStorage.clear();
const suburbInput = document.getElementById("suburb");
let initialValue = "";
let state = 0;
let recommendations;
let availableSuburbs = [];
suburbInput.addEventListener("keyup", () => {
    if (state === 0) {
        state = 1;
        recommendations = setInterval(() => {
            if (initialValue !== localStorage.getItem("initialValue") && localStorage.getItem("initialValue") !== null) {
                initialValue = localStorage.getItem("initialValue");
                console.log(suburbInput.value);
                fetch("/booking/search?searchString=" + suburbInput.value, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then((res) => {
                    if (!res.ok) {
                        alert("Server Error!");
                        return;
                    }

                    return res.json();
                }).then((data) => {
                    console.log(data);
                    availableSuburbs = data;
                    if (data.length === 0) {
                        return;
                    }
                    const autocomplete = document.getElementById("autocomplete__widget");
                    autocomplete.style.display = "inline-block";
                    autocomplete.innerHTML = "";
                    data.forEach((sub) => {
                        autocomplete.innerHTML += `
                        <div class="recom-items" onclick="selectSuburb('${sub.PCODE}', '${sub.SUBURB}')">
                            <div>${sub.SUBURB}</div>
                            <div>${sub.PCODE}</div>
                        </div>
                        <hr style="background-color: #e0e0e0" />
                    `
                    })
                })
            }
        }, 2000)
    }

    localStorage.setItem('initialValue', suburbInput.value);
})

suburbInput.addEventListener("blur", function () {
    clearInterval(recommendations);
    state = 0;
})

function selectSuburb(postcode, suburb) {
    document.getElementById("postcode").value = postcode;
    document.getElementById("autocomplete__widget").style.display = "none";
    suburbInput.value = suburb;
    suburbInput.blur();
}

document.addEventListener('click', () => {
    if (document.getElementById("autocomplete__widget").style.display !== "none") {
        document.getElementById("autocomplete__widget").style.display = "none";
    }
})

// Submitting the form data
const submitStep3 = () => {
    const checkBox = document.getElementById('check');
    if (document.getElementById("name").value === "") {
        classNames("name");
        return;
    }

    if (document.getElementById('phone_number').value === "" && document.getElementById('phone_number').value.length > 10) {
        classNames("phone_number");
        return;
    }

    if (document.getElementById("address").value === "") {
        classNames("address");
        return;
    }

    if (document.getElementById("suburb").value === "") {
        classNames("suburb");
        return;
    }

    if (document.getElementById("postcode").value === "") {
        classNames("postcode");
        return;
    }

    document.getElementById("submitBtn").textContent = "Loading...";

    const detailObj = {
        name: document.getElementById("name").value,
        businessName: localStorage.getItem("businessName") === null ? document.getElementById("business_name").value : localStorage.getItem("businessName"),
        phoneNumber: localStorage.getItem("phoneNumber") === null ? document.getElementById('phone_number').value : localStorage.getItem("phoneNumber"),
        address: document.getElementById("address").value,
        unit: localStorage.getItem("unit") === null ? document.getElementById("unit").value : localStorage.getItem("unit"),
        check: checkBox !== null && checkBox.classList[0] === "check2" ? true : false,
        postcode: localStorage.getItem("postcode") === null ? document.getElementById("postcode").value : localStorage.getItem("postcode"),
        suburb: document.getElementById("suburb").value,
    }

    console.log(detailObj);

    const img = document.getElementById("img-logo");
    let session_id;
    if (img.dataset.booking === "quote") {
        session_id = img.dataset.session;
        fetch("/quote/step-3/" + session_id, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(detailObj),
        }).then((res) => {
            if (!res.ok) {
                alert("Server Error!");
                window.location.reload();
                return;
            }
            return res.json();
        }).then((data) => {
            console.log(data);
            if (data.msg === "wsub") {
                window.location.href = "/quote/step-3" + "/" + session_id + "?q=wrong-suburb";
            }
            window.location.href = "/quote/step-4" + "/" + session_id;
        }).catch((err) => {
            console.log(err);
            alert("Some error occured. Please reload or try again later!");
            return;
        })
        return;
    }

    fetch("/booking/step-3", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(detailObj)
    }).then((response) => {
        if (!response.ok) {
            alert("server error");
            window.location.reload();
        }
        return response.json();
    }).then((data) => {
        if (data.msg === "new") {
            window.location.href = "/booking/step-1";
            return;
        }

        if (data.msg === "login") {
            window.location.href = "/login?q=session-expired";
        }

        if (data.msg === "wsub") {
            window.location.href = "/booking/step-3?q=wrong-suburb";
            return;
        }

        window.location.href = "/booking/step-4";
        return;
    })
}