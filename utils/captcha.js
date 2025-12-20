
// if you want more beautiful captcha, you can you sng-captcha module.
const svgSmoothCaptcha = require('svg-captcha-smooth')
const svgCaptcha = require('svg-captcha')
const md5 = require('md5')

// text captcha with svg-captcha-smooth module
const getCaptcha = async (size, noise, color) => {
    const captcha = svgSmoothCaptcha.create({
        size: size,
        noise: noise,
        color: color,
    })

    return { captcha: captcha.data, key: md5(md5(md5(captcha.text))) }
}

// text captcha with svg-captcha module
const getBeautifulCaptcha = async (size, noise, color) => {
    const captcha = svgCaptcha.create({
        size: size,
        noise: noise,
        color: color,
    })

    return { captcha: captcha.data, key: md5(md5(md5(captcha.text))) }
}

const verifyCaptcha = async (captcha, key) => {
    if (md5(md5(md5(captcha))) === key) {
        return true
    } else {
        return false
    }
}

module.exports = { getCaptcha, getBeautifulCaptcha, verifyCaptcha }
