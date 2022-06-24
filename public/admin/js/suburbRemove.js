function submitForm(event) {
    event.preventDefault();
    const suburb = document.getElementById("suburb").value;
    const postcode = document.getElementById("postcode").value;
    if (suburb === "" || postcode === "") {
        alert("Please enter the required field!");
        return;
    }
    let submitBtn = document.getElementById("submitBtn");
    submitBtn.textContent = "Loading..."
    fetch("/admin/suburb-search", {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ suburb, postcode }),
    }).then((res) => {
        if (!res.ok) {
            alert("Server Error");
            window.location.reload();
            return;
        }
        return res.json();
    }).then((data) => {
        console.log(data);
        const alert = document.getElementById('alert-noti');
        const suburbs = document.getElementById('suburbs');

        if (data.length === 0) {
            console.log('here');
            submitBtn.textContent = "Submit"
            alert.removeAttribute("style");
            suburbs.hasAttribute("style") === false && suburbs.setAttribute("style", "display: none");
            return;
        }


        suburbs.removeAttribute("style");
        let container = document.getElementById('cards-container');

        container.innerHTML = "";
        alert.setAttribute("style", "display: none");

        data.map((address, index) => {
            container.innerHTML += `
            <div class="card" style="width: 18rem; margin: 15px;">
            <div class="card-body">
                <h5 class="card-title">${address.SUBURB}</h5>
                <h5 class="card-subtitle mb-2 text-muted">${address.PCODE}</h5>
                <button class="btn btn-danger" onclick="remove('${address._id}', '${index}')" id="remove_${index}">Remove</button>
                <button class="btn btn-warning" onclick="edit('${address._id}', '${index}')" id="edit_${index}">Edit</button>
            </div>
        </div>
            `
        })
        submitBtn.textContent = "Submit"
    })
}

function remove(id, index) {
    const confirmResponse = confirm("Are you sure?");

    if (!confirmResponse) {
        window.location.reload();
        return;
    }
    const deleteBtn = document.getElementById(`remove_${index}`);
    deleteBtn.textContent = "Loading..."
    fetch("/admin/suburb-delete", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
    }).then((res) => {
        if (!res.ok) {
            alert("Server Error!");
            window.location.reload();
        }

        return res.json();
    }).then((data) => {
        if (data.msg === "ok") {
            deleteBtn.textContent = "Removed"
            alert("Suburb Deleted");
            window.location.reload();
        } else {
            deleteBtn.textContent = "Remove"
            alert(data.msg);
        }
    }).catch(err => {
        console.log(err);
    })
}

function edit(id, index) {
    const editBtn = document.getElementById(`edit_${index}`);
    editBtn.textContent = "Loading..."
    fetch("/admin/suburb-edit/" + id, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((res) => {
        if (!res.ok) {
            alert("Server Error!");
            window.location.reload();
        }

        return res.json();
    }).then((data) => {
        let container = document.getElementById('cards-container');

        container.innerHTML = "";
        const suburb = document.getElementById("suburb");
        const postcode = document.getElementById("postcode");
        suburb.value = data.SUBURB;
        postcode.value = data.PCODE;

        const heading = document.getElementById('suburb-heading');
        heading.textContent = "Edit a Suburb";
        const btnDiv = document.getElementById("btnDiv");

        btnDiv.innerHTML = "";

        btnDiv.innerHTML += `
        <button class="btn btn-success" onclick="submitEdit('${id}')" id="changeBtn">Change</button>
        <button class="btn btn-danger ml-4" onclick="cancel()">Cancel</button>
        `;
    }).catch(err => {
        console.log(err);
    })
}

function cancel() {
    window.location.reload();
}

function submitEdit(id) {
    const changeBtn = document.getElementById('changeBtn');
    const suburb = document.getElementById("suburb").value;
    const postcode = document.getElementById("postcode").value;
    if (suburb === "" || postcode === "") {
        alert("Please enter the required field!");
        return;
    }
    changeBtn.textContent = "Loading...";

    fetch("/admin/suburb-edit/" + id, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suburb, postcode }),
    }).then((res) => {
        if (!res.ok) {
            alert("Server Error!");
            window.location.reload();
        }

        return res.json();
    }).then((data) => {
        if (data.msg === "ok") {
            changeBtn.textContent = "Edited";
            alert("Suburb Edited");
            window.location.reload();
        }
    })
}