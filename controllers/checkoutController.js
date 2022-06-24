const stripe = require('stripe')(process.env.STRIPE_API);
const Booking = require('../Models/Booking');
const User = require("../Models/User");
const xml = require('xml');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { parseString } = require("xml2js");
const fs = require("fs");
const path = require("path");
const { googleDriveUpload } = require('../utils/googledrive');


module.exports.checkoutController = async (req, res) => {
    try {
        let booking = await Booking.findById(req.query.q);
        let user = await User.findById(req.user._id);
        if (!booking) {
            return res.render("error_page", {
                title: "Not Found!",
                url: "/booking/step-1",
            })
        }
        if (!user.stripeCusId) {
            const customer = await stripe.customers.create({
                email: user.email,
            });

            user = await User.findByIdAndUpdate(req.user._id, { stripeCusId: customer.id }, { new: true });
        }

        booking = await Booking.findOneAndUpdate({ user: req.user._id, _id: req.query.q }, {
            $set: {
                "bookingProgress": "payment",
            }
        }, { new: true })

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer: user.stripeCusId,
            line_items: [
                {
                    price_data: {
                        currency: 'aud',
                        product_data: {
                            name: booking.deliveryPriority.serviceType.toUpperCase(),
                        },
                        unit_amount: Math.trunc((+booking.cost * 100).toFixed(2)),
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.URL}/payment/done`,
            cancel_url: `${process.env.URL}/payment/failed`,
        })

        booking = await Booking.findOneAndUpdate({ _id: booking._id }, {
            $set: {
                "stripePaymentId": session.payment_intent,
            }
        }, { new: true });

        res.json({ url: session.url });
    } catch (err) {
        console.log(err);
        await Booking.findOneAndUpdate({ user: req.user._id, bookingProgress: "payment" }, {
            $set: {
                "bookingProgress": "step-4",
            }
        }, { new: true })
        res.render("error_page", {
            title: "Oops!",
            url: "/booking/checkout",
        })
    }
}

module.exports.submitJobBooking = async (req, res) => {
    const { _id: userId } = req.user;
    try {
        let onGoingBooking = await Booking.findOne({ user: userId, bookingProgress: "payment" });
        let user = await User.findById(userId);
        console.log(onGoingBooking);
        let serviceUsed = onGoingBooking.deliveryPriority.serviceType;
        let service = {
            SERVICE: serviceUsed === "paxi" ? "PXI" : onGoingBooking[serviceUsed].serviceCode,
        }
        let pickupTime = {
            PICKUPTIME: onGoingBooking.deliveryPriority.pickupDateTime,
        }
        let pickupAddress = {
            ADDRESS: [{ _attr: { type: 'pickup' } }, { ...(onGoingBooking.pickupDetails.addressDetails.businessName ? { NAME: onGoingBooking.pickupDetails.addressDetails.businessName } : { NAME: "" }) }, { ADDRESS1: onGoingBooking.pickupDetails.addressDetails.address }, { SUBURB: onGoingBooking.pickupDetails.addressDetails.suburb }, { ADDRESS3: onGoingBooking.pickupDetails.addressDetails.unit ? onGoingBooking.pickupDetails.addressDetails.unit : "" }, { STATE: onGoingBooking.pickupDetails.addressDetails.state }, { POSTCODE: onGoingBooking.pickupDetails.addressDetails.postcode }]
        }

        let deliveryAddress = {
            ADDRESS: [{ _attr: { type: 'delivery' } }, { ...(onGoingBooking.deliveryDetails.addressDetails.businessName ? { NAME: onGoingBooking.deliveryDetails.addressDetails.businessName } : { NAME: "" }) }, { ADDRESS1: onGoingBooking.deliveryDetails.addressDetails.address }, { SUBURB: onGoingBooking.deliveryDetails.addressDetails.suburb }, { ADDRESS3: onGoingBooking.deliveryDetails.addressDetails.unit ? onGoingBooking.deliveryDetails.addressDetails.unit : "" }, { STATE: onGoingBooking.deliveryDetails.addressDetails.state }, { POSTCODE: onGoingBooking.deliveryDetails.addressDetails.postcode }, { EMAIL: user.email }, { MOBILE: onGoingBooking.deliveryDetails.phoneNumber }]
        }
        let additionalService;
        if (serviceUsed !== "paxi") {
            additionalService = {
                ADDITIONALSERVICE: onGoingBooking[serviceUsed].helper.Forklift ? (onGoingBooking[serviceUsed].helper.Forklift === "yes" ? "TL" : "") : (onGoingBooking[serviceUsed].helper.Handload === "yes" ? "HU" : ""),
            }
        }
        let caller = {
            CALLER: onGoingBooking.deliveryDetails.name,
        }
        let reference1 = {
            REFERENCE1: onGoingBooking.deliveryDetails.jobReference ? onGoingBooking.deliveryDetails.jobReference : "",
        }

        let reference2 = {
            REFERENCE2: onGoingBooking.pickupDetails.phoneNumber,
        }

        // let mobile = {
        //     MOBILE: onGoingBooking.deliveryDetails.phoneNumber,
        // }

        let additionalInstructions = {
            ADDITIONALINSTRUCTIONS: onGoingBooking.deliveryDetails.driverInstructions ? onGoingBooking.deliveryDetails.driverInstructions : "",
        }


        let service_xml = xml(service);
        let pickupAddress_xml = xml(pickupAddress);
        let deliveryAddress_xml = xml(deliveryAddress);
        let pickupTime_xml = xml(pickupTime);
        let additionalService_xml = xml(additionalService);
        let reference1_xml = xml(reference1);
        let reference2_xml = xml(reference2);
        let additionalInstructions_xml = xml(additionalInstructions);
        let caller_xml = xml(caller);
        // let mobile_xml = xml(mobile);


        let openingTags = "<MANIFEST><CONSIGNMENT>";
        let closingTags = "</CONSIGNMENT></MANIFEST>";
        let account = "<ACCOUNT>CREDIT</ACCOUNT>"
        // if (serviceUsed === "express" || serviceUsed === "")
        let totalItems = `<TOTALITEMS>${onGoingBooking[serviceUsed].numberOfItems}</TOTALITEMS>`;
        if (serviceUsed === "paxi" || serviceUsed === "flatRate") {
            totalItems = `<TOTALITEMS>${onGoingBooking[serviceUsed].numberOfItems}</TOTALITEMS>`
        }
        let totalWeight = `<TOTALWEIGHT>${onGoingBooking[serviceUsed].totalWeight}</TOTALWEIGHT>`;

        let body = openingTags + account + caller_xml + service_xml + additionalService_xml + reference1_xml + reference2_xml + pickupTime_xml + pickupAddress_xml + deliveryAddress_xml + totalItems + totalWeight + additionalInstructions_xml + closingTags;

        console.log(body);
        fetch("https://apis.hubsystems.com.au/booking/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/xml',
                Authorization: 'Basic ' + Buffer.from("atc-webbookings:aXjc33-2nkGd").toString("base64"),
            },
            body: body,
        }).then((response) => {
            return response.text();
        }).then(async (xml) => {
            console.log(xml);
            parseString(xml, async (err, result) => {
                if (err) return err;
                console.log(JSON.stringify(result));
                if (result.MANIFEST.CONSIGNMENT[0].STATUS[0] === "FAIL") {
                    onGoingBooking = await Booking.findOneAndUpdate({ user: req.user._id, bookingProgress: "payment" }, {
                        $set: {
                            'bookingProgress': "completed",
                            'jobStatus': result.MANIFEST.CONSIGNMENT[0].STATUS[0],
                        }
                    }, { new: true })

                    return res.redirect(`/payment/success/${onGoingBooking._id}?t=1`);
                }
                let jobId = await result.MANIFEST.CONSIGNMENT[0].FMSJOB[0];
                let tracking = result.MANIFEST.CONSIGNMENT[0].LINK[0];
                console.log(jobId);
                const fileObj = {
                    base64str: result.MANIFEST.CONSIGNMENT[0].FMSLABEL[0],
                    bookingId: onGoingBooking._id.toString(),
                    folder: process.env.LABEL_FOLDER,
                }
                const { id, name, localName, publicUrl } = await googleDriveUpload(fileObj);
                onGoingBooking = await Booking.findOneAndUpdate({ user: req.user._id, bookingProgress: "payment" }, {
                    $set: {
                        'bookingProgress': "completed",
                        'jobId': jobId,
                        'trackingLink': tracking,
                        'jobStatus': result.MANIFEST.CONSIGNMENT[0].STATUS[0],
                        'label.unique_id': id,
                        'label.url': publicUrl,
                        'label.fileName': name,
                    }
                }, { new: true })

                if (onGoingBooking.jobId !== jobId) {
                    onGoingBooking = await Booking.findOneAndUpdate({ user: req.user._id, bookingProgress: "payment" }, {
                        $set: {
                            'jobId': jobId,
                        }
                    }, { new: true })
                }

                console.log("ONGOINGBOOKING BOOKING ID");
                console.log(onGoingBooking.jobId);

                const filePath = path.join(__dirname, "../" + localName);
                fs.unlink(filePath, (err) => {
                    if (err) console.log(err);
                    console.log(`${filePath} deleted`);
                });
            })

            res.redirect(`/payment/success/${onGoingBooking._id}?t=1`);
        }).catch(async (error) => {
            if (error) {
                console.log("Error at fetching details from ATC Server: " + error);
            }

            const booking = await Booking.findOneAndUpdate({ user: req.user._id, bookingProgress: "payment" }, {
                $set: {
                    "bookingProgress": "step-4",
                }
            }, { new: true });

            const refund = await stripe.refunds.create({
                payment_intent: booking.stripePaymentId,
            });
            console.log("------------REFUND---------------");
            console.log(refund);

            res.render("error_page", {
                title: "Server didn't respond",
                url: "/booking/step-4",
            })
        });

    } catch (err) {
        console.log(err);
        const booking = await Booking.findOneAndUpdate({ user: req.user._id, bookingProgress: "payment" }, {
            $set: {
                "bookingProgress": "step-4",
            }
        }, { new: true });

        const refund = await stripe.refunds.create({
            payment_intent: booking.stripePaymentId,
        });
        console.log("------------REFUND---------------");
        console.log(refund);
        res.render("error_page", {
            title: "Server Error!",
            url: "/booking/checkout",
        })
    }
}


module.exports.getPaymentSuccessfulPage = async (req, res) => {
    const { _id: userId } = req.user;
    const id = req.params.id;
    try {
        let booking = await Booking.findOne({ user: userId, _id: id });
        if (!booking) {
            return res.redirect("/booking");
        }
        if (booking.jobStatus === "FAIL") {
            const refund = await stripe.refunds.create({
                payment_intent: booking.stripePaymentId,
            });
            console.log("------------REFUND---------------");
            console.log(refund);
            await Booking.findOneAndDelete({ user: userId, _id: id });
            return res.redirect(`/payment/failed?q=refunded`);
        }
        console.log("---------------JOBID-----------------");
        console.log(booking.jobId);
        if (booking.jobId === undefined) {
            return res.redirect(`/payment/success/${booking._id}?t=1`);
        }
        res.render('success_page', {
            title: 'Success',
            jobId: booking.jobId,
            label: booking.label.url,
            _id: booking.jobId,
            date: booking.bookingDate,
        });
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error!",
            url: "/booking/dashboard",
        })
    }
}

module.exports.getPaymentUnsuccessfulPage = async (req, res) => {
    try {
        const q = req.query.q;
        let booking = await Booking.findOneAndUpdate({ user: req.user._id, bookingProgress: "payment" }, {
            $set: {
                "bookingProgress": "step-4",
            }
        }, { new: true });
        if (!booking) {
            return res.redirect("/dashboard");
        }
        res.render('failure_page', {
            title: 'Failed!',
            jobId: booking.jobId,
            content: q === "refunded" ? "Amount deducted will be refunded shortly." : "Please try again later.",
        })
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error!",
            url: "/booking/checkout",
        })
    }
}