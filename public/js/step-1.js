const mainDiv = document.getElementById('main-selector');
const main = document.getElementById('main1');
// var inputs = document.getElementsByClassName('form-group');
const inputs = document.getElementById('inputs');
function importanceChanged() {
    if (!main.checked) {
        inputs.style.display = 'grid'
    } else {
        inputs.style.display = 'none'
    }
}

window.addEventListener('load', () => {
    query();
    localStorage.clear();
    checkServices();
    setMinDate();
    importanceChanged();
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    let value = params.q;
    if (value === "not-available") {
        alert("Please select correct time and date for service");
    }
});
mainDiv.addEventListener('click', importanceChanged);

const setMinDate = () => {
    const MomentDate = moment(new Date());
    const currentDate = MomentDate.tz("Australia/Sydney").format("YYYY-MM-DD");
    const currentTime = MomentDate.tz("Australia/Sydney").format("HH:mm");
    console.log(currentDate);
    console.log(currentTime);
    document.getElementById("date").setAttribute("min", currentDate);
}

const setDefault = () => {
    localStorage.setItem("bookingPeriod", "bookLater");
    localStorage.removeItem("bookingTime");
    for (let i = 1; i <= 5; i++) {
        let label = document.getElementById(`btn${i}-label`);
        label.style.opacity = "1";
        label.style.cursor = "pointer";
        label.classList.remove("selected__service");
    }
}

const bookingTime = (el) => {
    let timeValue = el.value;
    timeValue = timeValue.toUpperCase();
    if (timeValue.includes("PM") || timeValue.includes("AM")) {
        timeValue = moment(timeValue, "hh:mm A").format("HH:mm");
    }
    for (let i = 1; i <= 5; i++) {
        let label = document.getElementById(`btn${i}-label`);
        label.style.opacity = "1";
        label.style.cursor = "pointer";
    }
    console.log(timeValue);
    let time = timeValue.split(":")[0];
    let minutes = timeValue.split(":")[1];
    localStorage.setItem("bookingTime", `${time}:${minutes}`);
    console.log(time);
    let period = time >= 12 ? "PM" : "AM";
    console.log(period);
    time = parseInt(time) > 12 ? (parseInt(time) - 12).toString() : time;
    console.log(time);
    localStorage.removeItem("selectedService");
    for (let i = 1; i <= 5; i++) {
        let label = document.getElementById(`btn${i}-label`);
        label.classList.remove("selected__service");
    }
    availableServices(time, minutes, period);
}

// Function for checking the available services according to time
const availableServices = (time, minutes, period) => {
    console.log(time, minutes, period);
    const services = [...document.querySelectorAll('input[type=radio]')];
    if (period === "PM") {
        if (parseInt(time) >= 5 && parseInt(time) !== 12) {
            const servicesNotAvailable = services.filter((service, index) => {
                return service.value !== "paxi";
            })

            // console.log(servicesNotAvailable);

            for (let i = 2; i <= 5; i++) {
                const labelId = servicesNotAvailable[i].id;
                document.getElementById(labelId + "-label").style.opacity = "0.4";
                document.getElementById(labelId + "-label").style.cursor = "not-allowed";
                document.getElementById(labelId + "-label").style.pointerEvents = "not-allowed";
            }
        } else {
            document.getElementById("btn1-label").style.opacity = "0.4";
            document.getElementById("btn1-label").style.cursor = "not-allowed";
        }

        if ((parseInt(time) >= 2 && parseInt(minutes) > 00 && parseInt(time) !== 12) || (parseInt(time) > 2 && parseInt(time) !== 12)) {
            console.log(time);
            document.getElementById("btn2-label").style.opacity = "0.4";
            document.getElementById("btn2-label").style.cursor = "not-allowed";
        }

        if ((parseInt(time) >= 3 && parseInt(minutes) > 30 && parseInt(time) !== 12) || (parseInt(time) > 3 && parseInt(time) !== 12)) {
            document.getElementById("btn3-label").style.opacity = "0.4";
            document.getElementById("btn3-label").style.cursor = "not-allowed";
        }
    } else {
        if ((parseInt(time) >= 10 && parseInt(minutes) > 00) || (parseInt(time) > 10)) {
            document.getElementById("btn1-label").style.opacity = "0.4";
            document.getElementById("btn1-label").style.cursor = "not-allowed";
        }
    }
}

// Doing the time check on load of page
// const MomentDate = moment(new Date());
// const currentTime = MomentDate.tz("Australia/Sydney").format("hh:mm A");
// let time = currentTime.split(" ")[0].split(":")[0];
// let minutes = currentTime.split(" ")[0].split(":")[1];
// let period = currentTime.split(" ")[1];
// availableServices(time, minutes, period);

const checkServices = () => {
    console.log("hi");
    localStorage.setItem("bookingPeriod", "bookNow");
    const MomentDate = moment(new Date());
    const currentTime = MomentDate.tz("Australia/Sydney").format("hh:mm A");
    let time = currentTime.split(" ")[0].split(":")[0];
    let minutes = currentTime.split(" ")[0].split(":")[1];
    let period = currentTime.split(" ")[1];
    if (period === "PM" && time !== 12) {
        let bookedTimming = (parseInt(time) + 12).toString();
        localStorage.setItem("bookingTime", `${bookedTimming}:${minutes}`);
        localStorage.setItem("currentTime", `${bookedTimming}:${minutes}`);
    } else {
        localStorage.setItem("bookingTime", `${time}:${minutes}`);
        localStorage.setItem("currentTime", `${time}:${minutes}`);
    }
    for (let i = 1; i <= 5; i++) {
        let label = document.getElementById(`btn${i}-label`);
        label.classList.remove("selected__service");
    }
    availableServices(time, minutes, period);
}

const selectedService = (el) => {
    if (el.style.cursor === 'not-allowed') {
        return;
    };
    for (let i = 1; i <= 5; i++) {
        let label = document.getElementById(`btn${i}-label`);
        label.classList.remove("selected__service");
    }
    el.classList.add("selected__service");
    localStorage.setItem("selectedService", el.dataset.value);

}

const setBookingDate = (el) => {
    localStorage.setItem("bookingDate", el.value);
}

const submitStep1 = () => {
    let bookingPeriod = localStorage.getItem("bookingPeriod");
    if (bookingPeriod === null) {
        bookingPeriod = "bookNow";
    }

    const selectedService = localStorage.getItem("selectedService");

    if (selectedService === null) {
        alert("Please select a service!");
        return;
    }

    let detailObj = {};
    detailObj.bookingPeriod = bookingPeriod;

    if (bookingPeriod === "bookNow") {
        detailObj.serviceType = selectedService;
        detailObj.bookingTime = localStorage.getItem("bookingTime");
        detailObj.bookingDate = formatDate();
        detailObj.currentTime = localStorage.getItem("currentTime");
        detailObj.currentDate = formatDate();
        console.log(detailObj);
    } else if (bookingPeriod === "bookLater") {
        if (localStorage.getItem("bookingDate") === null) {
            alert("Choose Booking Date");
            return;
        }
        if (localStorage.getItem("bookingTime") === null) {
            alert("Choose Booking Time");
            return;
        }
        detailObj.bookingDate = localStorage.getItem("bookingDate");
        detailObj.bookingTime = localStorage.getItem("bookingTime");
        detailObj.currentTime = localStorage.getItem("currentTime");
        detailObj.currentDate = formatDate();
        detailObj.serviceType = selectedService;
    }

    console.log(detailObj);
    document.getElementById("submitBtn").textContent = "Loading...";
    const img = document.getElementById("img-logo");
    let session_id;
    if (img.dataset.booking === "quote") {
        session_id = img.dataset.session;
        fetch("/quote/step-1/" + session_id, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(detailObj)
        }).then((res) => {
            if (!res.ok) {
                alert("Some error occured! Please try again.");
                window.location.reload();
                return;
            }
        }).then(() => {
            window.location.href = "/quote/step-2/" + session_id;
        }).catch((err) => console.log(err));
        return;
    }

    fetch("/booking/step-1", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(detailObj)
    }).then((res) => {
        if (!res.ok) {
            alert("Some error occured! Please try again.");
            window.location.reload();
            return;
        }
    }).then(() => {
        window.location.href = "/booking/step-2";
    }).catch((err) => console.log(err));

}

function formatDate() {
    const date = moment(new Date()).tz("Australia/Sydney").format("YYYY-MM-DD");

    return date;
}

function query() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('q')) {
        if (params.get("q") === "expired") {
            alert("Your earlier booking has been closed as time chosen by you was either up or service is not available.");
        }
    }
}

