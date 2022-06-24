const mailchimp = require("@mailchimp/mailchimp_marketing");
const md5 = require("md5");

mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API,
    server: "us15",
});

const addMember = async (obj) => {
    try {
        const checkingMember = await checkMemberExists(obj);
        if (hasWhiteSpace(obj.full_name)) {
            if (checkingMember === 404) {
                const response = await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
                    email_address: obj.email,
                    status: "subscribed",
                    merge_fields: {
                        FNAME: obj.full_name.split(" ")[0],
                        LNAME: obj.full_name.split(" ")[1],
                    },
                    tags: ["customer"],
                });
                console.log("-------MAILCHIMP MEMBER ADDED---------");
                console.log(response);
            }
        } else {
            if (checkingMember === 404) {
                const response = await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
                    email_address: obj.email,
                    status: "subscribed",
                    merge_fields: {
                        FNAME: obj.full_name,
                    },
                    tags: ["customer"],
                });
                console.log(response);
            }
        }
    } catch (err) {
        console.log(err);
    }
};

function hasWhiteSpace(s) {
    return s.indexOf(' ') >= 0;
}

async function checkMemberExists(obj) {
    try {
        const response = await mailchimp.lists.getListMember(
            process.env.MAILCHIMP_LIST_ID,
            md5(obj.email),
        );

        console.log("------------CHECK MEMBER----------------");
        console.log(response);
        return true;
    } catch (err) {
        console.log(err.status);
        return err.status;
    }

}


module.exports = { addMember };