const accord = document.getElementsByClassName("accordian-label");
for (let i of accord) {
    i.addEventListener("click", () => {
        i.classList.toggle('active')
    })
}

var check = document.querySelector('#check');
var btn = document.querySelector('.final-button').firstElementChild;
check.addEventListener('click', () => {
    console.log("checked");
    if (check.className === 'check1') {
        check.className = 'check2';
        btn.classList.remove('inactive');
    }
    else {
        check.className = 'check1';
        btn.classList.add('inactive');
    }
})
window.addEventListener("load", () => {
    // window.location.reload();
    const url = new URLSearchParams(window.location.search);
    const t = url.get("t");
    console.log(t);
    fetch("/booking/address", {
        method: 'GET',
    }).then((response) => response.json()).then(({ pickup, delivery }) => {
        console.log(pickup, delivery);
        localStorage.setItem("latP", pickup.results[0].geometry.location.lat);
        localStorage.setItem("lngP", pickup.results[0].geometry.location.lng);
        localStorage.setItem("pPlaceId", pickup.results[0].place_id);
        localStorage.setItem("dPlaceId", delivery.results[0].place_id);
        localStorage.setItem("latD", delivery.results[0].geometry.location.lat);
        localStorage.setItem("lngD", delivery.results[0].geometry.location.lng);
    })

    // Create the script tag, set the appropriate attributes
    let script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCnkuiKUnwUUZduua44JjTiyi7T3wyrxmo&callback=initMap';
    script.async = true;

    // Attach your callback function to the `window` object
    window.initMap = async function () {
        // JS API is loaded and available
        const options = {
            zoom: 10,
            center: { lat: +localStorage.getItem("latP"), lng: +localStorage.getItem("lngP") },
        }

        const map = new google.maps.Map(document.getElementById("map"), options);
        const service = new google.maps.DistanceMatrixService();

        const origin = { lat: +localStorage.getItem("latP"), lng: +localStorage.getItem("lngP") };
        const destination = { lat: +localStorage.getItem("latD"), lng: +localStorage.getItem("lngD") };

        let totalDistance;

        // if ((localStorage.getItem("latP") === localStorage.getItem("latD")) && (localStorage.getItem("lngP") === localStorage.getItem("lngD"))) {
        //     totalDistance = "1 km";
        // } else {
        const request = {
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
        };

        const distanceResponse = await service.getDistanceMatrix(request);
        console.log(distanceResponse);
        if (distanceResponse.rows[0].elements[0].status === "ZERO_RESULTS") {
            console.log("REFRESHING WINDOW");
            window.location.reload();
        }

        totalDistance = distanceResponse.rows[0].elements[0].distance.text;
        console.log(totalDistance);
        // }

        if (totalDistance === "1 m") {
            totalDistance = "1 km";
        }

        document.getElementById("distance").textContent = totalDistance;
        fetch("/booking/save-distance?id=" + document.getElementById("confirmPay").dataset.booking, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ distance: totalDistance })
        }).then((res) => {
            if (!res.ok) {
                console.log("Error!");
                console.log(res);
            }
            return res.json()
        }).then((data) => {
            console.log(data);
        }).catch(err => console.log(err))


        addMarker({ coord: { lat: +localStorage.getItem("latP"), lng: +localStorage.getItem("lngP") }, content: "<h2>Pickup</h2>" });
        addMarker({ coord: { lat: +localStorage.getItem("latD"), lng: +localStorage.getItem("lngD") }, content: "<h2>Delivery</h2>" });

        function addMarker(props) {
            const marker = new google.maps.Marker({
                position: props.coord,
                map: map
            })

            if (props.content) {
                const infoWindow = new google.maps.InfoWindow({
                    content: props.content,
                })

                marker.addListener('click', function () {
                    infoWindow.open(map, marker);
                })
            }
        }
    };

    document.head.appendChild(script);
})


const confirmBtn = document.getElementById("confirmPay");

confirmBtn.addEventListener("click", () => {
    const classNames = [...confirmBtn.classList];

    for (let i = 0; i < classNames.length; i++) {
        if (classNames[i] === "inactive") {
            alert("Please accept the Terms & Conditions");
            return;
        }
    }

    confirmBtn.textContent = "Loading...";

    fetch("/checkout/create-checkout-session?q=" + document.getElementById("confirmPay").dataset.booking, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((res) => {
        if (res.ok) return res.json();
        return res.json().then(json => Promise.reject(json))
    }).then((data) => {
        window.location = data.url;
    }).catch((err) => {
        console.log(err);
    })
})
