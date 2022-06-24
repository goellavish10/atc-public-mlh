const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    quoteUserSessionId: {
        type: String,
    },
    deliveryPriority: {
        pickupDateTime: {
            type: String,
            required: true,
        },
        serviceType: {
            type: String,
        },
        bookingPeriod: {
            type: String,
        }
    },
    bookingProgress: {
        type: String,
        required: true,
    },
    paxi: {
        numberOfItems: {
            type: String,
        },

        totalWeight: {
            type: String,
        }
    },
    flatRate: {
        serviceCode: {
            type: String,
        },
        numberOfItems: {
            type: String,
        },
        totalWeight: {
            type: String,
        },
        helper: {
            Handload: {
                type: String,
            },
            Forklift: {
                type: String,
            }
        }
    },
    express: {
        serviceCode: {
            type: String,
        },
        numberOfItems: {
            type: String,
        },
        totalWeight: {
            type: String,
        },
        helper: {
            Handload: {
                type: String,
            },
            Forklift: {
                type: String,
            }
        }
    },
    standard: {
        serviceCode: {
            type: String,
        },
        numberOfItems: {
            type: String,
        },
        totalWeight: {
            type: String,
        },
        helper: {
            Handload: {
                type: String,
            },
            Forklift: {
                type: String,
            }
        }
    },
    vip: {
        serviceCode: {
            type: String,
        },
        numberOfItems: {
            type: String,
        },
        totalWeight: {
            type: String,
        },
        helper: {
            Handload: {
                type: String,
            },
            Forklift: {
                type: String,
            }
        }
    },
    pickupDetails: {
        addressDetails: {
            businessName: {
                type: String,
            },
            address: {
                type: String,
            },
            unit: {
                type: String,
            },
            postcode: {
                type: String,
            },
            suburb: {
                type: String,
            }
        },
        name: {
            type: String,
        },
        phoneNumber: {
            type: String,
        }
    },
    deliveryDetails: {
        addressDetails: {
            businessName: {
                type: String,
            },
            address: {
                type: String,
            },
            unit: {
                type: String,
            },
            postcode: {
                type: String,
            },
            suburb: {
                type: String,
            }
        },
        name: {
            type: String,
        },
        phoneNumber: {
            type: String,
        },
        jobReference: {
            type: String,
        },
        driverInstructions: {
            type: String,
        }
    },
    cost: {
        type: String,
    },
    jobId: {
        type: String,
    },
    bookingDate: {
        type: String,
    },
    distance: {
        type: String,
    },
    trackingLink: {
        type: String,
    },
    stripePaymentId: {
        type: String,
    },
    jobStatus: {
        type: String,
    },
    label: {
        unique_id: {
            type: String,
        },
        url: {
            type: String,
        },
        fileName: {
            type: String,
        }
    },
    pod: {
        unique_id: {
            type: String,
        },
        url: {
            type: String,
        },
        fileName: {
            type: String,
        }
    },
    deliveredTime: {
        type: String,
    }
}, { timestamps: true });

module.exports = Booking = mongoose.model('booking', bookingSchema);