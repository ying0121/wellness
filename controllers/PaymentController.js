
const ClinicService = require("../models/ClinicService")
const Letters = require("../models/Letters")
const PaymentTransactions = require("../models/PaymentTransactions")
const ContactEmail = require("../models/ContactEmail")

const ejs = require("ejs")
const path = require("path")
const Stripe = require("stripe")
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
})

exports.createPaymentIntent = async (req, res) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

    // claculate order amount
    const calculateOrderAmount = async _items => {
        let total = 0
        for (const item of _items) {
            total += item.amount
        }
        return total
    }

    try {
        const items = req.body.items

        const paymentIntent = await stripe.paymentIntents.create({
            amount: await calculateOrderAmount(items),
            currency: "usd",
            automatic_payment_methods: {
                enabled: true
            }
        })

        res.json({ status: "success", clientSecret: paymentIntent.client_secret })
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: "error", message: error.message })
    }
}

exports.paymentResult = async (req, res) => {
    let data = req.body

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

    // Retrieve PaymentIntent and payment method
    const paymentIntent = await stripe.paymentIntents.retrieve(data.payment_id)
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method)

    // Assign payment details to the data object
    data.card_number = paymentMethod.card.last4
    data.brand = paymentMethod.card.brand
    const expMonth = paymentMethod.card.exp_month
    const expYear = paymentMethod.card.exp_year
    data.expired_date = `${String(expMonth).padStart(2, '0')}/${expYear}`
    data.name = paymentMethod.billing_details.name || null
    data.email = paymentMethod.billing_details.email || null
    data.phone = paymentMethod.billing_details.phone || null
    data.country = paymentMethod.billing_details.address?.country || null

    // insert transaction data
    await PaymentTransactions.create(data)

    const category_data = data.category === "service" ? await ClinicService.findOne({ where: { id: data.category_id } }) : await Letters.findOne({ where: { id: data.category_id } })
    data.category_title = category_data.title

    // create and send an invoice begin //
    let customerId = paymentIntent.customer
    if (!customerId) {
        const customer = await stripe.customers.create({
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: { country: data.country },
            description: `Invoice for ${data.category} - ${data.category_title}`
        })

        customerId = customer.id
    }

    const invoiceItem = await stripe.invoiceItems.create({
        customer: customerId,
        amount: data.amount * 100,
        currency: data.currency,
        description: `Invoice for ${data.category} - ${data.category_title}`
    })

    const invoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: "send_invoice",
        days_until_due: 3
    })

    await stripe.invoices.sendInvoice(invoice.id)
    // create and send an invoice end //

    // send email begin //

    const emails = ContactEmail.findAll({ attributes: ["email"], where: { payment_email: 1 } })

    const emailConfig = {
        site_url: process.env.SITE_URL,
        card_number: data.card_number,
        brand: data.brand,
        amount: data.amount,
        currency: data.currency,
        payment_id: data.payment_id,
        status: data.status,
        status_color: data.status === 'succeeded' ? '#5cb85c' : '#d9534f',
        name: data.name,
        email: data.email,
        phone: data.phone,
        category: data.category === 'service' ? 'Service' : 'Letter',
        date: new Date().toLocaleDateString(),
        category_title: data.category_title,
    }
    ejs.renderFile(path.join(__dirname, '../views/email/paymentemail.ejs'), emailConfig, (error, data) => {
        if (error) {
            res.status(200).json({ status: "error", id: case_number })
        } else {
            const mailOptions = {
                from: process.env.MAIL_USERNAME,
                to: emails,
                subject: "Payment Email",
                html: data
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(err)
                    res.status(200).json({ status: "error" })
                } else {
                    res.status(200).json({ status: "success" })
                }
            })
        }
    })
    // send email end //
}
