const checkName = (el) => {
    const lengthOfName = el.value.length;
    if (lengthOfName > 20) {
        document.forms[0].classList.add('error');
        el.classList.add('form-error')
        document.getElementById('name-error').classList.add('error-popup');
        document.getElementById('create_account').disabled = true;
        document.getElementById('create_account').style.cursor = 'not-allowed';
        return false;
    } else {
        document.getElementById('create_account').style.cursor = 'pointer';
        document.getElementById('name-error').classList.remove('error-popup');
        document.forms[0].classList.remove('error');
        el.classList.remove('form-error')
        document.getElementById('create_account').disabled = false;
        return true;
    }
}

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const checkEmail = (el) => {
    if (!validateEmail(el.value)) {
        document.forms[0].classList.add('error');
        el.classList.add('form-error')
        document.getElementById('email-error').classList.add('error-popup');
        document.getElementById('email-error').textContent = "Enter a valid email address"
        document.getElementById('create_account').disabled = true;
        document.getElementById('create_account').style.cursor = 'not-allowed';
        return false;
    } else {
        el.classList.remove('form-error')
        document.getElementById('email-error').classList.remove('error-popup');
        document.getElementById('create_account').style.cursor = 'pointer';
        document.forms[0].classList.remove('error');
        document.getElementById('create_account').disabled = false;
        return true;
    }
}

const checkPassword = (el) => {
    if (el.value.length < 6) {
        el.classList.add('form-error')
        document.getElementById('password-error').classList.add('error-popup');
        document.forms[0].classList.add('error');
        document.getElementById('create_account').disabled = true;
        return false;
    } else {
        el.classList.remove('form-error')
        document.getElementById('password-error').classList.remove('error-popup');
        document.forms[0].classList.remove('error');
        document.getElementById('create_account').disabled = false;
        return true;
    }
}

function checkForm() {
    // const nameVerified = ;
    // const emailVerified = );
    // const passwordVerified = ;

    if (!checkName(document.getElementById("name"))) {
        document.forms[0].classList.add('error');
        document.getElementById('create_account').disabled = true;
        document.getElementById('create_account').style.cursor = 'not-allowed';
        return false;
    }

    if (!checkEmail(document.getElementById("email"))) {
        document.forms[0].classList.add('error');
        document.getElementById('create_account').disabled = true;
        document.getElementById('create_account').style.cursor = 'not-allowed';
        return false;
    }

    if (!checkPassword(document.getElementById("password"))) {
        document.forms[0].classList.add('error');
        document.getElementById('create_account').disabled = true;
        document.getElementById('create_account').style.cursor = 'not-allowed';
        return false;
    }

    if (!document.getElementById("check").classList.contains('check2')) {
        document.forms[0].classList.add('error');
        document.getElementById('create_account').disabled = true;
        document.getElementById('create_account').style.cursor = 'not-allowed';
        return false;
    }

    return true;
}

function checkTerms() {
    const check = document.getElementById("check");

    check.classList.toggle("check1");
    check.classList.toggle("check2");
    if (document.forms[0].classList.contains('error')) {
        document.forms[0].classList.remove('error');
        document.getElementById('create_account').disabled = false;
        document.getElementById('create_account').style.cursor = 'pointer';
    }

}

function submitForm() {

    if (!checkForm()) {
        return alert("Please enter form correctly!");
    }
    const form = document.forms[0];

    form.submit()
}