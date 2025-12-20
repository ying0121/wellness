
// generate random string
const generateRandomString = async size => {
    let randString = ""
    const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for (let i = 0; i < size; i ++) {
        randString += characters[Math.floor(Math.random() * characters.length)]
    }

    return randString
}

module.exports = { generateRandomString }
