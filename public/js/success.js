const animation = bodymovin.loadAnimation({
    container: document.getElementById('anim'),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    renderSettings: {
        preserveAspectRatio: 'xMidYMid meet',
    },
    path: 'https://assets4.lottiefiles.com/packages/lf20_eo10bcbf.json'
})

window.addEventListener("load", function () {
    const url = new URLSearchParams(window.location.search);
    const t = url.get("t");

    if (t === "1") {
        const str = window.location.href
        const last = str.substring(str.lastIndexOf("/") + 1, str.length);
        const _id = last.split("?")[0];
        window.location.href = `/payment/success/${_id}`;
    }
})