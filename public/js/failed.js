const animation = bodymovin.loadAnimation({
    container: document.getElementById('anim'),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    renderSettings: {
        preserveAspectRatio: 'xMidYMid meet',
    },
    path: 'https://assets6.lottiefiles.com/packages/lf20_ukem05cg.json'
})