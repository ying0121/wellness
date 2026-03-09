
require("dotenv").config()

const express = require("express")
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const path = require("path")
const bodyParser = require("body-parser")
const { connectDB, sequelize } = require("./models/index")

// routes
const mainRoutes = require("./routes/")

const app = express()

app.use(express.json())

// session
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
app.use(session({
    key: "ying-session",
    secret: process.env.SESSION_KEY,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000 // 30 minutes
    }
}))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.urlencoded({ extended: false }))

// link to url
app.use("/", mainRoutes)

app.use("*", (req, res) => {
    res.render("404.ejs")
})

const PORT = process.env.PORT || 7000

const runServer = async () => {
    await connectDB() // connect to mysql database
    // await sequelize.sync({alter: true}) // create tables if not exists
    // run server
    app.listen(PORT, () => {
        console.log(`🚀 Site is running at : ${process.env.SITE_URL}`)
    })
}

runServer()
