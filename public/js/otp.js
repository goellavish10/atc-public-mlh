const url = new URLSearchParams(window.location.search);
const q = url.get("q");
const u = url.get("u");

const form = document.getElementById("form");
const error = document.getElementById("otp-error");
const resendotp = document.getElementById("otpResend");
let time = 60;
const resendingCode = document.getElementById("resend-code");

resendingCode.setAttribute("href", `/otp-verification/resend-otp?q=${q}&u=${u}`);

const otptimer = setInterval(() => {
    time -= 1;
    console.log(time);
    resendOtpTimer(time);
}, 1000);


const submitOtp = (event) => {
    event.preventDefault()
    if (document.getElementById("otp").value === "") {
        form.classList.add("error");
        error.classList.add("error-popup");
        error.textContent = "Please enter OTP";
        return;
    }

    document.getElementById("submit").textContent = "Loading...";
    fetch(`/otp-verification/verify?q=${q}&u=${u}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: document.getElementById("otp").value })
    }).then((res) => {
        if (!res.ok) {
            alert("server Error");
            window.location.reaload();
        }
        return res.json();
    }).then((data) => {
        if (data.msg) {
            window.location = "/email" + "?q=" + q + "&u=" + u;
        }

    }).catch((err) => {
        console.log(err);
    })
}

const resendOtpTimer = (t) => {
    resendotp.innerHTML = `
        Resend OTP in ${t}
    `
    if (t === 0) {
        clearInterval(otptimer);
        time = 60;
        resendOTP();
    }
}

const resendOTP = () => {
    resendotp.innerHTML = `
    Didn't receive OTP?
    <a href="/otp-verification/resend-otp?q=${q}&u=${u}" class="link">Resend Code</a>
    `
}

// const resendCode = () => {
//     const url = new URLSearchParams(window.location.search);
//     const q = url.get("q");
//     const u = url.get("u");
// }

const removeError = () => {
    form.classList.remove("error");
    error.classList.remove("error-popup");
}