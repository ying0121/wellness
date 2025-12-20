
const QRCode = require("qrcode")

const generateQRCode = async (text) => {
    const url = await QRCode.toDataURL(text)
    return url
}

const saveQRode = async (text, filepath) => {
    new Promise((resolve, reject) => {
        QRCode.toFile(filepath, text, {
            color: {
                dark: "#000",
                light: "#FFF"
            }
        }, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve(true)
            }
        })
    })
}

module.exports = { generateQRCode, saveQRode }
