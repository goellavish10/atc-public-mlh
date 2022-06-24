const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports.geocode = async (addressObj) => {
    const pickupAd = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${addressObj.pickup}&key=${process.env.GCP_API}`);
    const deliveryAd = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${addressObj.delivery}&key=${process.env.GCP_API}`);
    const pickup = await pickupAd.json();
    const delivery = await deliveryAd.json();

    // console.log("---------------------\n");
    // console.log(data);
    // console.log("---------------------\n");
    return {
        pickup,
        delivery
    }
}