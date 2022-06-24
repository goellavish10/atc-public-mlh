function submitForm(event) {
    event.preventDefault();
    const form = document.forms[0];
    const jobId = document.getElementById("jobId").value;
    const bookingDate = document.getElementById("bookingDate").value;

    console.log(jobId, bookingDate);

    fetch("/admin/get-job", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId, bookingDate })
    }).then((res) => {
        if (!res.ok) {
            alert("Server Error!");
            window.location.reload();
        }

        return res.json();
    }).then((data) => {
        console.log(data);
        let container = document.getElementById("jobFetched");

        container.innerHTML = "";

        container.innerHTML += `
        <table class="table">
        <thead>
            <tr>
            <th scope="col">Job Id</th>
            <th scope="col">Booking Date</th>
            <th scope="col">Ref</th>
            <th scope="col">From</th>
            <th scope="col">To</th>
            <th scope="col">Service</th>
            <th scope="col">Cost</th>
            <th scope="col">Booked For</th>
            <th scope="col">Status</th>
            <th scope="col">Cancel</th>
            </tr>
        </thead>
        <tbody>
            <tr>
            <td>
            ${data.jobId}
          </td>
          <td>
            ${data.bookingDate}
          </td>
          <td>
            ${data.deliveryDetails.jobReference}
          </td>
          <td>
            ${data.pickupDetails.addressDetails.suburb}
          </td>
          <td>
            ${data.deliveryDetails.addressDetails.suburb}
          </td>
          <td>
            ${data.deliveryPriority.serviceType.toUpperCase()}
          </td>
          <td>
            ${data.cost}
          </td>
          <td>
            ${data.deliveryPriority.pickupDateTime.split("T")[0]}
              ${data.deliveryPriority.pickupDateTime.split("T")[1]}
          </td>
          <td>
            ${data.jobStatus}
          </td>
          <td class="text-center">
              <button type="button" onclick="cancelJob('${data._id}')" class="btn btn-danger text-center">Cancel
                the
                Job</button>
          </td>
            </tr>
        </tbody>
    </table>
        `
    }).catch(err => {
        console.log(err);
    })
}

function cancelJob(id) {
    const confirmResponse = confirm("Are you sure?");

    if (!confirmResponse) {
        window.location.reload();
        return;
    }

    fetch("/admin/cancel-job", {
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
            alert("Job Cancelled and refund initiated!");
            window.location.reload();
        } else {
            alert(data.msg);
        }
    }).catch(err => {
        console.log(err);
    })
}