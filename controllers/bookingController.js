const Booking = require('../Models/Booking');
const User = require('../Models/User');
const Addresse = require('../Models/Address');
const xml = require('xml');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { parseString } = require("xml2js");
const { geocode } = require("../utils/gecode");
const fs = require('fs');
const crypto = require("crypto");
const { checkAvailability } = require('../utils/checkAvailability');
const { googleDriveUpload } = require("../utils/googledrive");
const path = require("path");

module.exports.searchSuburb = async (req, res) => {
    try {
        console.log(req.query.searchString);
        const suburb = await Addresse.find({ SUBURB: { $regex: req.query.searchString, $options: '$i' } }).limit(25);
        console.log(suburb);
        res.json(suburb);
    } catch (err) {
        console.log(err);
        res.json(err);
    }
}

module.exports.deleteAddress = async (req, res) => {
    const { id: addressId } = req.params;
    try {
        const user = await User.findOneAndUpdate({ _id: req.user._id }, { $pull: { savedAddresses: { _id: addressId } } }, { new: true });
        if (!user) {
            return res.status(404).json({ msg: 'Unauthorized' });
        }

        res.json({ msg: "deleted" });
    } catch (err) {
        console.log(err);
        res.status(503).json({ msg: 'Server Error!' });
    }
}

module.exports.saveDistance = async (req, res) => {
    try {
        const { distance } = req.body;
        const { id } = req.query
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let onGoingBooking;
        if (sessionIdQuoteUser !== undefined) {
            onGoingBooking = await Booking.findOneAndUpdate({ quoteUserSessionId: req.user }, {
                $set: {
                    'distance': distance,
                }
            }, { new: true });
        } else {
            const { _id: userId } = req.user;
            onGoingBooking = await Booking.findOneAndUpdate({ user: userId, _id: id }, {
                $set: {
                    'distance': distance,
                }
            }, { new: true });

            if (!onGoingBooking) {
                return res.status(404).json({ msg: 'Not Found!' });
            }
        }
        res.status(201).json({ msg: "Distance Saved!" })
    } catch (err) {
        console.log(err);
    }
}

module.exports.redirectToBookingStep = async (req, res) => {
    try {
        const { _id: userId } = req.user._id;
        let booking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
        console.log(booking);
        if (!booking) {
            return res.redirect("/booking/step-1");
        }

        res.redirect(`/booking/${booking.bookingProgress}`);
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error!",
            url: "/dashboard",
        })
    }
}

module.exports.getBookingStep1 = (req, res) => {
    if (req.params.sessionId !== undefined) {
        return res.render('booking_step1', {
            title: 'Book your ATC Service',
            session_id: req.params.sessionId,
        })
    }
    console.log('req.user ', req.user);
    if (req.user === undefined) {
        console.log(req.user);
        res.locals.quoteUser = "temp";
        crypto.randomBytes(24, function (err, buffer) {
            req.session.quoteUser = buffer.toString('hex');
            return res.redirect(`/quote/step-1/${buffer.toString('hex')}`);
        })
        return;
    }
    res.render('booking_step1', {
        title: 'Book your ATC Service',
        session_id: "",
    })
};

module.exports.getBookingStep2 = async (req, res) => {
    console.log('step-2');

    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let onGoingBooking;
        if (sessionIdQuoteUser !== undefined) {
            onGoingBooking = await Booking.findOne({ quoteUserSessionId: req.user });
        } else {
            const { _id: userId } = req.user;
            onGoingBooking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
        }

        // let onGoingBooking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
        console.log(onGoingBooking);


        if (!onGoingBooking) {
            return res.redirect("/booking/step-1");
        }


        const serviceType = onGoingBooking.deliveryPriority.serviceType;
        console.log(serviceType);

        switch (serviceType) {
            case 'flatRate':
                res.render('booking_step2_flat_rate', {
                    title: 'Booking Step 2 -- Flat Rate',
                    session_id: sessionIdQuoteUser !== undefined ? req.user : "",
                })
                break;
            case 'paxi':
                res.render('booking_step2_paxi', {
                    title: 'Booking Step 2 -- PAXI',
                    session_id: sessionIdQuoteUser !== undefined ? req.user : "",
                    ...(onGoingBooking.paxi.numberOfItems && { items: onGoingBooking.paxi.numberOfItems }),
                    ...(onGoingBooking.paxi.totalWeight && { totalWeight: onGoingBooking.paxi.totalWeight }),
                })
                break;
            case 'express':
                res.render('booking_step2_express', {
                    title: 'Booking Step 2 -- Express',
                    session_id: sessionIdQuoteUser !== undefined ? req.user : "",
                })
                break;
            case 'standard':
                res.render('booking_step2_standard', {
                    title: 'Booking Step 2 -- Standard',
                    session_id: sessionIdQuoteUser !== undefined ? req.user : "",
                })
                break;
            case 'vip':
                res.render('booking_step2_vip', {
                    title: 'Booking Step 2 -- VIP',
                    session_id: sessionIdQuoteUser !== undefined ? req.user : "",
                })
                break;
            default:
                break;
        }
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Error!",
            url: process.env.URL + "/booking/step-2",
        });
    }
}

module.exports.getBookingStep3 = async (req, res) => {
    console.log('step-3');

    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let onGoingBooking;
        if (sessionIdQuoteUser !== undefined) {
            onGoingBooking = await Booking.findOne({ quoteUserSessionId: req.user });
        } else {
            const { _id: userId } = req.user;
            onGoingBooking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
        }
        // let onGoingBooking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });

        if (!onGoingBooking) {
            return res.redirect("/booking/step-1");
        }

        const bookingProgress = onGoingBooking.bookingProgress;

        if (bookingProgress === "step-1") {
            return res.redirect("/booking/step-1");
        }
        console.log(onGoingBooking.pickupDetails);
        if (bookingProgress === "step-3" || bookingProgress === "step-4" || onGoingBooking.pickupDetails !== null) {
            console.log('from if');
            res.render("booking_step3", {
                title: 'Booking Step-3',
                name: req.user.name,
                phone: onGoingBooking.pickupDetails.phoneNumber,
                pickupAddress: onGoingBooking.pickupDetails.addressDetails.address,
                postcode: onGoingBooking.pickupDetails.addressDetails.postcode,
                savedAddresses: sessionIdQuoteUser !== undefined ? "" : req.user.savedAddresses.length === 0 ? "" : req.user.savedAddresses,
                businessName: onGoingBooking.pickupDetails.addressDetails.businessName,
                unit: onGoingBooking.pickupDetails.addressDetails.unit,
                session_id: sessionIdQuoteUser !== undefined ? req.user : "",
                suburb: onGoingBooking.pickupDetails.addressDetails.suburb,
            })
            return;
        }

        console.log('from render');
        res.render("booking_step3", {
            title: 'Booking Step-3',
            name: req.user.name,
            phone: req.user.phone ? req.user.phone : "",
            pickupAddress: "",
            suburb: "",
            state: "",
            postcode: "",
            savedAddresses: sessionIdQuoteUser !== undefined ? "" : req.user.savedAddresses.length === 0 ? "" : req.user.savedAddresses,
            businessName: "",
            unit: "",
            session_id: sessionIdQuoteUser !== undefined ? req.user : "",
            suburb: onGoingBooking.pickupDetails.addressDetails.suburb,
        })
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Error!",
            url: process.env.URL + "/booking/step-2",
        });
    }
}

module.exports.getBookingStep4 = async (req, res) => {
    console.log('step-4');
    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let onGoingBooking;
        if (sessionIdQuoteUser !== undefined) {
            onGoingBooking = await Booking.findOne({ quoteUserSessionId: req.user });
        } else {
            const { _id: userId } = req.user;
            onGoingBooking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } })
        }
        // let onGoingBooking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });

        const bookingProgress = onGoingBooking.bookingProgress;

        console.log("here");

        if (!onGoingBooking) {
            return res.redirect("/booking/step-1");
        }

        if (bookingProgress === "step-1") {
            return res.redirect("/booking/step-1");
        }

        if (bookingProgress === "step-2") {
            return res.redirect("/booking/step-2");
        }

        if (bookingProgress === "step-4" || onGoingBooking.deliveryDetails !== null) {
            res.render("booking_step4", {
                title: 'Booking Step-4',
                name: onGoingBooking.deliveryDetails.name,
                phone: onGoingBooking.deliveryDetails.phoneNumber,
                deliveryAddress: onGoingBooking.deliveryDetails.addressDetails.address,
                postcode: onGoingBooking.deliveryDetails.addressDetails.postcode,
                savedAddresses: sessionIdQuoteUser !== undefined ? "" : req.user.savedAddresses.length === 0 ? "" : req.user.savedAddresses,
                businessName: onGoingBooking.deliveryDetails.addressDetails.businessName,
                unit: onGoingBooking.deliveryDetails.addressDetails.unit,
                jobReference: onGoingBooking.deliveryDetails.jobReference,
                driverInstructions: onGoingBooking.deliveryDetails.driverInstructions,
                session_id: sessionIdQuoteUser !== undefined ? req.user : "",
                suburb: onGoingBooking.deliveryDetails.addressDetails.suburb,
            })
            return;
        }

        res.render("booking_step4", {
            title: 'Booking Step-4',
            savedAddresses: sessionIdQuoteUser !== undefined ? "" : req.user.savedAddresses.length === 0 ? "" : req.user.savedAddresses,
            name: "",
            deliveryAddress: "",
            phone: "",
            suburb: "",
            state: "",
            businessName: "",
            unit: "",
            postcode: "",
            jobReference: "",
            driverInstructions: "",
            session_id: sessionIdQuoteUser !== undefined ? req.user : "",
            suburb: onGoingBooking.deliveryDetails.addressDetails.suburb,
        })
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error!",
            url: "/booking/step-3",
        })
    }
}

module.exports.getCheckoutPage = async (req, res) => {
    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let onGoingBooking;
        if (sessionIdQuoteUser !== undefined) {
            onGoingBooking = await Booking.findOne({ quoteUserSessionId: req.user });
        } else {
            const { _id: userId } = req.user;
            onGoingBooking = await Booking.findById(req.query.q);
            const available = await checkAvailability(onGoingBooking);
            if (available === "err") {
                return res.redirect("/booking/step-4");
            }

            if (!available) {
                console.log("FALSE");
                return res.redirect("/booking/step-1?q=not-available");
            }

        }
        // let onGoingBooking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
        if (!onGoingBooking) {
            return res.redirect("/dashboard");
        }
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
            ADDRESS: [{ _attr: { type: 'delivery' } }, { ...(onGoingBooking.deliveryDetails.addressDetails.businessName ? { NAME: onGoingBooking.deliveryDetails.addressDetails.businessName } : { NAME: "" }) }, { ADDRESS1: onGoingBooking.deliveryDetails.addressDetails.address }, { SUBURB: onGoingBooking.deliveryDetails.addressDetails.suburb }, { ADDRESS3: onGoingBooking.deliveryDetails.addressDetails.unit ? onGoingBooking.deliveryDetails.addressDetails.unit : "" }, { STATE: onGoingBooking.deliveryDetails.addressDetails.state }, { POSTCODE: onGoingBooking.deliveryDetails.addressDetails.postcode }]
        }
        let additionalService;
        if (serviceUsed !== "paxi") {
            additionalService = {
                ADDITIONALSERVICE: onGoingBooking[serviceUsed].helper.Forklift ? (onGoingBooking[serviceUsed].helper.Forklift === "yes" ? "TL" : "") : (onGoingBooking[serviceUsed].helper.Handload === "yes" ? "HU" : ""),
            }
        }
        let reference = {
            REFERENCE: onGoingBooking.deliveryDetails.jobReference ? onGoingBooking.deliveryDetails.jobReference : "",
        }

        let additionalInstructions = {
            ADDITIONALINSTRUCTIONS: onGoingBooking.deliveryDetails.driverInstructions ? onGoingBooking.deliveryDetails.driverInstructions : "",
        }


        let service_xml = xml(service);
        let pickupAddress_xml = xml(pickupAddress);
        let deliveryAddress_xml = xml(deliveryAddress);
        let pickupTime_xml = xml(pickupTime);
        let additionalService_xml = xml(additionalService);
        let reference_xml = xml(reference);
        let additionalInstructions_xml = xml(additionalInstructions);


        let openingTags = "<MANIFEST><CONSIGNMENT>";
        let closingTags = "</CONSIGNMENT></MANIFEST>";
        let quote = "<QUOTE>true</QUOTE>";
        let account = "<ACCOUNT>CREDIT</ACCOUNT>"
        // if (serviceUsed === "express" || serviceUsed === "")
        let totalItems = `<TOTALITEMS>${onGoingBooking[serviceUsed].numberOfItems}</TOTALITEMS>`;
        if (serviceUsed === "paxi" || serviceUsed === "flatRate") {
            totalItems = `<TOTALITEMS>${onGoingBooking[serviceUsed].numberOfItems}</TOTALITEMS>`
        }
        let totalWeight = `<TOTALWEIGHT>${onGoingBooking[serviceUsed].totalWeight}</TOTALWEIGHT>`;

        let body = openingTags + quote + account + service_xml + additionalService_xml + pickupTime_xml + reference_xml + pickupAddress_xml + deliveryAddress_xml + totalItems + totalWeight + reference_xml + additionalInstructions_xml + closingTags;

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
            const json = parseString(xml, async (err, result) => {
                if (err) return console.log(err);
                console.log(JSON.stringify(result));
                if (result.MANIFEST.CONSIGNMENT === undefined) {
                    return res.render("error_page", {
                        title: "Server Error",
                        url: sessionIdQuoteUser !== undefined ? `/booking/step-2/${sessionIdQuoteUser}` : '/booking/step-2',
                    })
                }
                const { COST, GST, LEVY, LEVYGST } = result.MANIFEST.CONSIGNMENT[0];
                const totalCost = (+COST[0] + (+GST[0]) + (+LEVY[0]) + (+LEVYGST[0])).toFixed(2);
                let estimatedDeliveryTime;

                if (serviceUsed === "paxi") {
                    estimatedDeliveryTime = "1-2 hours"
                }

                if (serviceUsed === "flatRate") {
                    estimatedDeliveryTime = "17:00";
                }

                if (serviceUsed === "express") {
                    estimatedDeliveryTime = "1-2 hours"
                }

                if (serviceUsed === "standard") {
                    estimatedDeliveryTime = "3-4 hours"
                }
                if (serviceUsed === "vip") {
                    estimatedDeliveryTime = "2-3 hours"
                }

                console.log(estimatedDeliveryTime);

                console.log("-----------------COST-----------------")
                console.log(totalCost);

                const dateToSend = dateFormat(onGoingBooking.deliveryPriority.pickupDateTime.split("T")[0]);
                if (sessionIdQuoteUser !== undefined) {
                    onGoingBooking = await Booking.findOneAndUpdate({ quoteUserSessionId: req.user }, {
                        $set: {
                            'cost': totalCost.toString(),
                        }
                    }, { new: true });
                } else {
                    const { _id: userId } = req.user;
                    onGoingBooking = await Booking.findOneAndUpdate({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } }, {
                        $set: {
                            'cost': totalCost.toString(),
                        }
                    }, { new: true })
                }

                if (sessionIdQuoteUser !== undefined) {
                    res.render('quoatation_confirm', {
                        title: 'Checkout',
                        level: onGoingBooking.deliveryPriority.serviceType,
                        service: onGoingBooking[serviceUsed].serviceCode,
                        date: dateToSend,
                        estimatedDeliveryTime,
                        time: onGoingBooking.deliveryPriority.pickupDateTime.split("T")[1],
                        items: onGoingBooking[serviceUsed].numberOfItems,
                        totalWeight: onGoingBooking[serviceUsed].totalWeight,
                        senderDetail: {
                            name: onGoingBooking.pickupDetails.name,
                            ...(onGoingBooking.pickupDetails.addressDetails.businessName && { businessName: onGoingBooking.pickupDetails.addressDetails.businessName }),
                            phone: onGoingBooking.pickupDetails.phoneNumber,
                            address: onGoingBooking.pickupDetails.addressDetails.address,
                            ...(onGoingBooking.pickupDetails.addressDetails.unit && { unit: onGoingBooking.pickupDetails.addressDetails.unit }),
                            postcode: onGoingBooking.pickupDetails.addressDetails.postcode,
                            suburb: onGoingBooking.pickupDetails.addressDetails.suburb,
                        },
                        deliveryDetail: {
                            name: onGoingBooking.deliveryDetails.name,
                            ...(onGoingBooking.deliveryDetails.addressDetails.businessName && { businessName: onGoingBooking.deliveryDetails.addressDetails.businessName }),
                            phone: onGoingBooking.deliveryDetails.phoneNumber,
                            address: onGoingBooking.deliveryDetails.addressDetails.address,
                            ...(onGoingBooking.deliveryDetails.addressDetails.unit && { unit: onGoingBooking.deliveryDetails.addressDetails.unit }),
                            postcode: onGoingBooking.deliveryDetails.addressDetails.postcode,
                            suburb: onGoingBooking.deliveryDetails.addressDetails.suburb,
                        },
                        price: totalCost,
                        driverInstructions: onGoingBooking.deliveryDetails.driverInstructions,
                        session_id: sessionIdQuoteUser !== undefined ? req.user : "",
                    })
                } else {
                    res.render('confirm_pay', {
                        title: 'Checkout',
                        level: onGoingBooking.deliveryPriority.serviceType,
                        service: onGoingBooking[serviceUsed].serviceCode,
                        date: dateToSend,
                        estimatedDeliveryTime,
                        time: onGoingBooking.deliveryPriority.pickupDateTime.split("T")[1],
                        items: onGoingBooking[serviceUsed].numberOfItems,
                        totalWeight: onGoingBooking[serviceUsed].totalWeight,
                        senderDetail: {
                            name: onGoingBooking.pickupDetails.name,
                            ...(onGoingBooking.pickupDetails.addressDetails.businessName && { businessName: onGoingBooking.pickupDetails.addressDetails.businessName }),
                            phone: onGoingBooking.pickupDetails.phoneNumber,
                            address: onGoingBooking.pickupDetails.addressDetails.address,
                            ...(onGoingBooking.pickupDetails.addressDetails.unit && { unit: onGoingBooking.pickupDetails.addressDetails.unit }),
                            postcode: onGoingBooking.pickupDetails.addressDetails.postcode,
                            suburb: onGoingBooking.pickupDetails.addressDetails.suburb,
                        },
                        deliveryDetail: {
                            name: onGoingBooking.deliveryDetails.name,
                            ...(onGoingBooking.deliveryDetails.addressDetails.businessName && { businessName: onGoingBooking.deliveryDetails.addressDetails.businessName }),
                            phone: onGoingBooking.deliveryDetails.phoneNumber,
                            address: onGoingBooking.deliveryDetails.addressDetails.address,
                            ...(onGoingBooking.deliveryDetails.addressDetails.unit && { unit: onGoingBooking.deliveryDetails.addressDetails.unit }),
                            postcode: onGoingBooking.deliveryDetails.addressDetails.postcode,
                            suburb: onGoingBooking.deliveryDetails.addressDetails.suburb,
                        },
                        price: totalCost,
                        driverInstructions: onGoingBooking.deliveryDetails.driverInstructions,
                        session_id: sessionIdQuoteUser !== undefined ? req.user : "",
                        bookingId: onGoingBooking.id,
                    })
                }
            });
        }).catch((err) => {
            console.log("Error at fetching details from ATC Server: " + err);
            res.render("error_page", {
                title: "Server didn't respond",
                url: "/booking/step-4",
            })
        });

    } catch (err) {
        console.log("Error at fetching checkout page: " + err);
        res.render("error_page", {
            title: "Server Error",
            url: "/booking/step-4",
        })
    }

}

module.exports.getAddress = async (req, res) => {
    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let onGoingBooking;
        if (sessionIdQuoteUser !== undefined) {
            onGoingBooking = await Booking.findOne({ quoteUserSessionId: req.user });
        } else {
            const { _id: userId } = req.user;
            onGoingBooking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } })
        }
        // let onGoingBooking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
        let addressObj = {
            pickup: onGoingBooking.pickupDetails.addressDetails.suburb + ", Australia",
            delivery: onGoingBooking.deliveryDetails.addressDetails.suburb + ", Australia",
        }

        let response = await geocode(addressObj);
        console.log(response);

        if (response.pickup.status !== "OK") {
            addressObj = {
                pickup: onGoingBooking.pickupDetails.addressDetails.address,
                delivery: onGoingBooking.deliveryDetails.addressDetails.suburb + ", Australia",
            }

            response = await geocode(addressObj);
            console.log(response);
        }

        if (response.delivery.status !== "OK") {
            addressObj = {
                pickup: onGoingBooking.pickupDetails.addressDetails.suburb + ", Australia",
                delivery: onGoingBooking.deliveryDetails.addressDetails.address,
            }

            response = await geocode(addressObj);
            console.log(response);
        }


        res.json(response);
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Error!",
            url: process.env.URL + "/booking/step-1",
        });
    }

}

module.exports.postBookingStep1 = async (req, res) => {
    const { bookingPeriod, bookingDate, bookingTime, serviceType, currentDate } = req.body;
    console.log(currentDate);
    console.log(req.params.sessionId);
    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let booking;
        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOne({ quoteUserSessionId: sessionIdQuoteUser });
        } else {
            booking = await Booking.findOne({ user: req.user._id, bookingProgress: { $nin: ["completed", "delivered"] } });
        }
        console.log(booking);

        if (booking && booking.bookingProgress !== "completed" && booking.bookingProgress !== "delivered") {
            let bookingObj = {
                ...(sessionIdQuoteUser === undefined ? { user: req.user._id } : { quoteUserSessionId: sessionIdQuoteUser }),
                deliveryPriority: {
                    pickupDateTime: `${bookingDate}T${bookingTime}`,
                    serviceType,
                    bookingPeriod
                },
                bookingDate: `${currentDate}`,
                bookingProgress: "step-1",
            };

            if (sessionIdQuoteUser !== undefined) {
                booking = await Booking.findOneAndUpdate({ quoteUserSessionId: sessionIdQuoteUser }, { $set: bookingObj }, { new: true });
            } else {
                booking = await Booking.findOneAndUpdate({ user: req.user._id, bookingProgress: { $nin: ["completed", "delivered"] } }, { $set: bookingObj }, { new: true });
            }

            return res.json({ msg: "Step-1 Updated! Press \'ok\' to proceed ahead" });
        }
        let bookingObj = {
            ...(sessionIdQuoteUser === undefined ? { user: req.user._id } : { quoteUserSessionId: sessionIdQuoteUser }),
            deliveryPriority: {
                pickupDateTime: `${bookingDate}T${bookingTime}`,
                serviceType,
                bookingPeriod
            },
            bookingProgress: "step-1",
            bookingDate: `${currentDate}`,
        };

        let newBooking = new Booking(bookingObj);

        await newBooking.save();

        res.json({ msg: "Step-1 Completed!", ...(sessionIdQuoteUser !== undefined && { sessionId: sessionIdQuoteUser }) });
    } catch (err) {
        console.error(err);
        res.status(503).json({ msg: 'Server Error! Please try again later.' });
    }
}

module.exports.postBookingStepFlatRate = async (req, res) => {
    const { helper, weight, numberOfItems, serviceCode } = req.body;
    console.log(helper, weight, numberOfItems, serviceCode);
    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let booking;
        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOne({ quoteUserSessionId: req.user });
            if (!booking) {
                return res.redirect("/quote/step-1");
            }
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.find({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
        }
        // booking = await Booking.find({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
        if (!booking) {
            return res.render("error_page", {
                title: "Not Found!",
                url: "/booking/step-1",
            })
        }
        console.log(booking);
        let bookingObj = {
            flatRate: {
                totalWeight: weight,
                numberOfItems,
                serviceCode,
                helper,
            },
            bookingProgress: "step-2",
        }
        console.log("-------Booking OBJ----------");
        console.log(bookingObj);

        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOneAndUpdate({ quoteUserSessionId: req.user }, { $set: bookingObj }, { new: true });
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.findOneAndUpdate({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } }, { $set: bookingObj }, { new: true });
        }
        console.log(booking);

        res.json({ msg: "Step-2 Completed! Press \'OK\' to proceed ahead" })

    } catch (err) {
        console.error(err);
        res.render("error_page", {
            title: "Error!",
            url: process.env.URL + "/booking/step-2",
        });
    }
}

module.exports.postBookingStepExpress = async (req, res) => {
    const { helper, weight, numberOfItems, serviceCode } = req.body;
    console.log(helper, weight, numberOfItems, serviceCode);
    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let booking;
        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOne({ quoteUserSessionId: req.user });
            if (!booking) {
                return res.redirect("/quote/step-1");
            }
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.find({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
        }
        console.log(booking);
        let bookingObj = {
            express: {
                totalWeight: weight,
                numberOfItems,
                serviceCode,
                helper,
            },
            bookingProgress: "step-2",
        }
        console.log("-------Booking OBJ----------");
        console.log(bookingObj);

        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOneAndUpdate({ quoteUserSessionId: req.user }, { $set: bookingObj }, { new: true });
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.findOneAndUpdate({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } }, { $set: bookingObj }, { new: true });
        }

        console.log(booking);

        res.json({ msg: "Step-2 Completed! Press \'OK\' to proceed ahead" })

    } catch (err) {
        console.error(err);
        res.render("error_page", {
            title: "Error!",
            url: process.env.URL + "/booking/step-2",
        });
    }
}

module.exports.postBookingStepStandard = async (req, res) => {
    const { helper, weight, numberOfItems, serviceCode } = req.body;
    console.log(helper, weight, numberOfItems, serviceCode);
    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let booking;
        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOne({ quoteUserSessionId: req.user });
            if (!booking) {
                return res.redirect("/quote/step-1");
            }
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.find({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
            if (!booking) {
                return res.render("error_page", {
                    title: "Not Found!",
                    url: "/booking/step-1",
                })
            }
        }

        console.log(booking);
        let bookingObj = {
            standard: {
                totalWeight: weight,
                numberOfItems,
                serviceCode,
                helper,
            },
            bookingProgress: "step-2",
        }
        console.log("-------Booking OBJ----------");
        console.log(bookingObj);

        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOneAndUpdate({ quoteUserSessionId: req.user }, { $set: bookingObj }, { new: true });
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.findOneAndUpdate({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } }, { $set: bookingObj }, { new: true });
        }

        console.log(booking);

        res.json({ msg: "Step-2 Completed! Press \'OK\' to proceed ahead" })

    } catch (err) {
        console.error(err);
        res.render("error_page", {
            title: "Error!",
            url: process.env.URL + "/booking/step-2",
        });
    }
}

module.exports.postBookingStepVIP = async (req, res) => {
    const { helper, weight, numberOfItems, serviceCode } = req.body;
    console.log(helper, weight, numberOfItems, serviceCode);
    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let booking;
        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOne({ quoteUserSessionId: req.user });
            if (!booking) {
                return res.redirect("/quote/step-1");
            }
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.find({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
            if (!booking) {
                return res.render("error_page", {
                    title: "Not Found!",
                    url: "/booking/step-1",
                })
            }
        }

        console.log(booking);
        let bookingObj = {
            vip: {
                totalWeight: weight,
                numberOfItems,
                serviceCode,
                helper,
            },
            bookingProgress: "step-2",
        }
        console.log("-------Booking OBJ----------");
        console.log(bookingObj);

        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOneAndUpdate({ quoteUserSessionId: req.user }, { $set: bookingObj }, { new: true });
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.findOneAndUpdate({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } }, { $set: bookingObj }, { new: true });
        }


        console.log(booking);

        res.json({ msg: "Step-2 Completed! Press \'OK\' to proceed ahead" })

    } catch (err) {
        console.error(err);
        res.render("error_page", {
            title: "Error!",
            url: process.env.URL + "/booking/step-2",
        });
    }
}

module.exports.postBookingStepPaxi = async (req, res) => {
    const { numberOfItems, totalWeight } = req.body;
    console.log(numberOfItems, totalWeight);
    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let booking;
        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOne({ quoteUserSessionId: req.user });
            if (!booking) {
                return res.redirect("/quote/step-1");
            }
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.find({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
            if (!booking) {
                return res.render("error_page", {
                    title: "Not Found!",
                    url: "/booking/step-1",
                })
            }
        }
        console.log(booking);
        let bookingObj = {
            paxi: {
                totalWeight,
                numberOfItems,
            },
            bookingProgress: "step-2",
        }
        console.log(bookingObj);

        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOneAndUpdate({ quoteUserSessionId: req.user }, { $set: bookingObj }, { new: true });
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.findOneAndUpdate({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } }, { $set: bookingObj }, { new: true });
        }

        console.log(booking);

        res.json({ msg: "Step-2 Completed! Press \'OK\' to proceed ahead" })

    } catch (err) {
        console.error(err);
        res.render("error_page", {
            title: "Error!",
            url: process.env.URL + "/booking/step-2",
        });
    }
}

module.exports.postBookingStep3 = async (req, res) => {
    const { address, businessName, name, phoneNumber, unit, check, postcode, suburb } = req.body;
    console.log("------------------------");
    console.log(check);
    try {
        const suburbCheck = await Addresse.findOne({ SUBURB: suburb, PCODE: postcode });
        console.log("-----SUBURB CHECK----");
        console.log(suburbCheck);
        if (suburbCheck === null) {
            return res.json({ msg: "wsub" });
        }
        const sessionIdQuoteUser = req.params.sessionId;
        let booking;
        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOne({ quoteUserSessionId: req.user });
            if (!booking) {
                return res.redirect("/quote/step-1");
            }
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
            if (!booking) {
                return res.render("error_page", {
                    title: "Not Found!",
                    url: "/booking/step-1",
                })
            }
        }
        // let booking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
        console.log(booking);
        const addressDetails = {
            address,
            ...(businessName !== "" && { businessName }),
            ...(unit !== "" && { unit }),
            postcode,
            suburb,
        }

        let bookingObj = {
            pickupDetails: {
                addressDetails,
                name,
                phoneNumber,
            },
            bookingProgress: "step-3",
        }

        if (check) {
            const { _id: userId } = req.user;
            let user = await User.findOneAndUpdate({ _id: userId }, { $push: { savedAddresses: addressDetails } }, { new: true });
            console.log(user);
        }

        if (sessionIdQuoteUser !== undefined) {
            console.log(req.user);
            booking = await Booking.findOneAndUpdate({ quoteUserSessionId: req.user }, { $set: bookingObj }, { new: true });
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.findOneAndUpdate({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } }, { $set: bookingObj }, { new: true });
        }
        res.json({ msg: "Step-3 Completed successfully! Press \'OK\' to move to Step - 4" });

    } catch (err) {
        console.error(err);
        res.render("error_page", {
            title: "Error!",
            url: process.env.URL + "/booking/step-3",
        });
    }
}

module.exports.postBookingStep4 = async (req, res) => {
    const { address, businessName, name, phoneNumber, unit, check, jobReference, driverInstructions, suburb, postcode } = req.body;

    try {
        const sessionIdQuoteUser = req.params.sessionId;
        console.log(sessionIdQuoteUser);
        let booking;
        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOne({ quoteUserSessionId: req.user });
            if (!booking) {
                return res.redirect("/quote/step-1");
            }
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.findOne({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } });
            if (!booking) {
                return res.render("error_page", {
                    title: "Not Found!",
                    url: "/booking/step-1",
                })
            }
        }

        if (!booking) {
            return res.json({ msg: 'new' });
        }
        console.log(booking);
        const addressDetails = {
            address,
            ...(businessName !== "" && { businessName }),
            ...(unit !== "" && { unit }),
            suburb,
            postcode,
        }

        let bookingObj = {
            deliveryDetails: {
                addressDetails,
                name,
                phoneNumber,
                ...(jobReference !== "" && { jobReference }),
                ...(driverInstructions !== "" && { driverInstructions }),
            },
            bookingProgress: "step-4",
        }

        if (check) {
            let user = await User.findOneAndUpdate({ user: req.user._id }, { $push: { savedAddresses: addressDetails } }, { new: true });
            console.log(user);
        }

        if (sessionIdQuoteUser !== undefined) {
            booking = await Booking.findOneAndUpdate({ quoteUserSessionId: req.user }, { $set: bookingObj }, { new: true });
        } else {
            const { _id: userId } = req.user;
            booking = await Booking.findOneAndUpdate({ user: userId, bookingProgress: { $nin: ["completed", "delivered"] } }, { $set: bookingObj }, { new: true });
        }

        res.json({ msg: "Step-4 Completed successfully! Press \'OK\' to move to Confirm & Pay", id: booking.id });

    } catch (err) {
        console.error(err);
        res.render("error_page", {
            title: "Error!",
            url: process.env.URL + "/booking/step-4",
        });
    }
}

module.exports.getJobDetails = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const jobId = req.params.id;
        const bookingDate = req.query.d;
        let booking = await Booking.findOne({ user: userId, jobId: jobId, bookingDate: bookingDate });
        console.log(booking.pod !== undefined)

        console.log("-----------------REQUESTED BOOKING DETAIL--------------");
        console.log(booking);
        if (!booking) {
            console.log("---------------------------------------------");
            return res.redirect("/dashboard");
        }

        let bodyOpeningTags = "<STATUS><QUERY>";
        let bodyClosingTags = "</QUERY></STATUS>";
        let account = "<ACCOUNT>CREDIT</ACCOUNT>";
        let fmsJobId = `<FMSJOB>${jobId}</FMSJOB>`;
        let fmsDate = `<FMSDATE>${bookingDate}</FMSDATE>`;

        const body = bodyOpeningTags + account + fmsJobId + fmsDate + bodyClosingTags;

        let estimatedDeliveryTime;
        const serviceUsed = booking.deliveryPriority.serviceType;

        if (serviceUsed === "paxi") {
            estimatedDeliveryTime = "1-2 hours"
        }

        if (serviceUsed === "flatRate") {
            estimatedDeliveryTime = "17:00";
        }

        if (serviceUsed === "express") {
            estimatedDeliveryTime = "1-2 hours"
        }

        if (serviceUsed === "standard") {
            estimatedDeliveryTime = "3-4 hours"
        }
        if (serviceUsed === "vip") {
            estimatedDeliveryTime = "2-3 hours"
        }

        if (booking.pod !== undefined && booking.pod.unique_id !== undefined) {
            return res.render("job_details", {
                title: "Job Detail",
                pickupDetails: booking.pickupDetails,
                deliveryDetails: booking.deliveryDetails,
                bookedFor: booking.deliveryPriority.pickupDateTime.split("T")[1] + " " + dateFormat(booking.deliveryPriority.pickupDateTime.split("T")[0]),
                serviceLevel: booking.deliveryPriority.serviceType,
                service: booking[booking.deliveryPriority.serviceType]?.serviceCode,
                date: booking.createdAt.toString().split("T")[0],
                price: booking.cost,
                jobId: booking.jobId,
                reference: booking.deliveryDetails.jobReference,
                driverInstructions: booking.deliveryDetails.driverInstructions,
                estimatedDeliveryTime,
                bookingDate: booking.bookingDate,
                label: booking.label.url,
                distance: booking.distance,
                status: booking.jobStatus,
                pod: booking.pod.url,
                pickupSuburb: booking.pickupDetails.addressDetails.suburb,
                deliverySuburb: booking.deliveryDetails.addressDetails.suburb,
                deliveredTime: booking.deliveredTime,
                lat: undefined,
                long: undefined,
            })
        }

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
        }).then((data) => {
            console.log(data);
            const json = parseString(data, async (err, result) => {
                if (err) return console.log(err);
                console.log(JSON.stringify(result));

                result = JSON.parse(JSON.stringify(result));

                console.log(result)

                const status = result.STATUS.QUERY[0].JOBSTATUS[0];
                console.log(status);

                if (result.STATUS.QUERY[0].hasOwnProperty('SIGNATURE')) {
                    // fs.writeFile('pod.pdf', result.STATUS.QUERY[0].SIGNATURE[0], { encoding: 'base64' }, function (err) {
                    //     console.log('File created');
                    // });

                    const fileObj = {
                        base64str: result.STATUS.QUERY[0].SIGNATURE[0],
                        bookingId: booking._id.toString() + "-pod",
                        folder: process.env.POD_FOLDER,
                    }

                    const { id, name, localName, publicUrl } = await googleDriveUpload(fileObj);
                    booking = await Booking.findOneAndUpdate({ user: userId, jobId: jobId, bookingDate: bookingDate }, {
                        $set: {
                            'pod.unique_id': id,
                            'pod.url': publicUrl,
                            'pod.fileName': name,
                        }
                    }, { new: true });

                    const filePath = path.join(__dirname, "../" + localName);
                    fs.unlink(filePath, (err) => {
                        if (err) console.log(err);
                        console.log(`${filePath} deleted`);
                    });
                }

                if (status === "COMPLETE") {
                    booking = await Booking.findOneAndUpdate({ user: userId, jobId: jobId, bookingDate: bookingDate }, {
                        $set: {
                            'bookingProgress': "delivered",
                            "deliveredTime": result.STATUS.QUERY[0].ARRIVEDROP[0].split("T")[1],
                            'jobStatus': status,
                        }
                    }, { new: true });

                    console.log(booking);
                }

                booking = await Booking.findOneAndUpdate({ user: userId, jobId: jobId, bookingDate: bookingDate }, {
                    $set: {
                        'jobStatus': status,
                    }
                }, { new: true });

                res.render("job_details", {
                    title: "Job Detail",
                    pickupDetails: booking.pickupDetails,
                    deliveryDetails: booking.deliveryDetails,
                    bookedFor: booking.deliveryPriority.pickupDateTime.split("T")[1] + " " + dateFormat(booking.deliveryPriority.pickupDateTime.split("T")[0]),
                    serviceLevel: booking.deliveryPriority.serviceType,
                    service: booking[booking.deliveryPriority.serviceType]?.serviceCode,
                    date: booking.createdAt.toString().split("T")[0],
                    price: booking.cost,
                    jobId: booking.jobId,
                    reference: booking.deliveryDetails.jobReference,
                    driverInstructions: booking.deliveryDetails.driverInstructions,
                    estimatedDeliveryTime,
                    bookingDate: booking.bookingDate,
                    label: booking.label.url,
                    distance: booking.distance,
                    status: status,
                    ...(result.STATUS.QUERY[0].hasOwnProperty("DRIVERLATITUDE") === true ? { lat: result.STATUS.QUERY[0].DRIVERLATITUDE[0] } : { lat: undefined }),
                    ...(result.STATUS.QUERY[0].hasOwnProperty("DRIVERLONGITUDE") === true ? { long: result.STATUS.QUERY[0].DRIVERLONGITUDE[0] } : { long: undefined }),
                    ...(status === "COMPLETE" ? { pod: booking.pod.url } : { pod: undefined }),
                    pickupSuburb: booking.pickupDetails.addressDetails.suburb,
                    deliverySuburb: booking.deliveryDetails.addressDetails.suburb,
                    ...(result.STATUS.QUERY[0].hasOwnProperty("ARRIVEDROP") === true ? { deliveredTime: result.STATUS.QUERY[0].ARRIVEDROP[0].split("T")[1] } : { deliveredTime: undefined })
                })
            });
        })


    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error!",
            url: "/dashboard",
        })
    }
}

function dateFormat(d) {
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var t = new Date(d);
    return t.getDate() + ' ' + monthNames[t.getMonth()] + ' ' + t.getFullYear();
}


