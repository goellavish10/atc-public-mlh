let items = document.getElementById('no_of_items');
let weight = document.getElementById('weight');
localStorage.clear()
items.addEventListener("keyup", () => {
    const numberOfItems = items.value;
    if (numberOfItems > 5) {
        const form = document.getElementById("form");
        form.classList.add('error');
        const errorMsg = document.querySelector("#items-error");
        errorMsg.style.color = "#e01b1b";
        document.getElementById("no_of_items").classList.add("form-control2");
        items.value = "";
        return;
    }

    localStorage.setItem("numberOfItems", numberOfItems.toString());

});

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
        const errorMsg1 = document.querySelector("#weight-error");
        const errorMsg2 = document.querySelector("#items-error");
        errorMsg1.removeAttribute("style");
        errorMsg2.removeAttribute("style");
        errorMsg1.textContent = "Note: Max weight per item is 25kg ";
    }
}

weight.addEventListener("keyup", () => {
    const numberOfItems = items.value;
    console.log(numberOfItems);
    if (numberOfItems === "") {
        const form = document.getElementById("form");
        form.classList.add("error");
        const errorMsg = document.querySelector("#weight-error");
        errorMsg.style.color = "#e01b1b";
        errorMsg.textContent = "Please enter number of items first";
        document.getElementById("weight").classList.add("form-control2");
        weight.value = "";
        return;
    }

    let maxWeight = numberOfItems * 25;
    const weightOfItems = weight.value;

    if (weightOfItems > maxWeight || weightOfItems <= 0) {
        const form = document.getElementById("form");
        form.classList.add("error");
        const errorMsg = document.querySelector("#weight-error");
        errorMsg.style.color = "#e01b1b";
        document.getElementById("weight").classList.add("form-control2");
        errorMsg.textContent = `Max weight allowed is 25kg per item, i.e. total weight ${maxWeight}`
        weight.value = "";
        return;
    }

    localStorage.setItem("totalWeight", weightOfItems.toString());
});

const submitStep2 = () => {
    const items = document.getElementById('no_of_items').value.toString();
    const weight = document.getElementById('weight').value.toString();

    if (items === "" || (+items) <= 0) {
        classNames("no_of_items");
        return;
    }

    if (weight === "" || (+weight) <= 0) {
        classNames("weight");
        return;
    }

    document.getElementById("submitBtn").textContent = "Loading...";
    const detailObj = {
        numberOfItems: items,
        totalWeight: weight,
    }

    const img = document.getElementById("img-logo");
    let session_id;
    if (img.dataset.booking === "quote") {
        session_id = img.dataset.session;
        fetch("/quote/step-2/paxi/" + session_id, {
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
            window.location.href = "/quote/step-3" + "/" + session_id;
        }).catch((err) => {
            console.log(err);
            alert("Some error occured. Please reload or try again later!");
            return;
        })
        return;
    }

    fetch("/booking/step-2/paxi", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(detailObj),
    }).then((response) => {
        if (!response.ok) {
            alert("Server Error! Please try again.");
            window.location.reload();
            return;
        }

        return response.json();
    }).then((data) => {
        if (data.msg === "new") {
            window.location.href = "/booking/step-1";
            return;
        }
        window.location.href = "/booking/step-3";
        return;
    })
}