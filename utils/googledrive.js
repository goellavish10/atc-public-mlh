const { google } = require('googleapis');
const fs = require('fs').promises;
const { createReadStream } = require('fs');
const path = require("path");

async function googleDriveUpload(fileObj) {
    console.log('reached google');
    const oAuth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI,
    )

    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    let typeOfFile = fileObj.type !== undefined ? fileObj.type : "pdf";
    let mimeTypeOfFile = fileObj.type !== undefined ? "image/png" : "application/pdf";

    let name = fileObj.bookingId + "." + typeOfFile;
    await fs.writeFile(name, fileObj.base64str, { encoding: 'base64' });
    console.log("*******FILE CREATED********")
    console.log('Processing After file creation');


    const drive = google.drive({
        version: 'v3',
        auth: oAuth2Client,
    });

    const filePath = path.join(__dirname, '../' + name);

    console.log("TRYING UPLOADING FILE");
    try {
        const response = await drive.files.create({
            requestBody: {
                name: name,
                mimeType: mimeTypeOfFile,
                parents: [fileObj.folder],
            },
            media: {
                mimeType: mimeTypeOfFile,
                body: createReadStream(filePath),
            }
        })

        const publicIdGenerate = await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            }
        })

        const result = await drive.files.get({
            fileId: response.data.id,
            fields: 'webViewLink, webContentLink',
        })

        return {
            id: response.data.id,
            name: response.data.name,
            localName: name,
            publicUrl: result.data.webContentLink,
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = { googleDriveUpload }