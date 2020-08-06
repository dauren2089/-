if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//variables init
const express = require('express')
const { request } = require('express')
const flash = require('express-flash')
const session = require('express-session')
const app = express()

const bcrypt = require('bcrypt')
const methodOverride = require('method-override')

const passport = require('passport')
const initializePassport = require('./passport-config')


initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )

//create local database via var users
const users = []

app.set('view-engine', 'ejs')
app.set('view-engine', 'html')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// home page settings
app.get('/', checkAuth, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

// Sign In settings
app.get('/login', checkNotAuth, (req, res) => {
    res.render('login.html')
})

app.post('/login', checkNotAuth, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// Sign Up settings
app.get('/register', checkNotAuth, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuth, async (req, res) => {
    try {
        //hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        
        // push users info
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        //redirecting to sign in page after register
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuth(req, res, next) {
    if (req.isAuthenticated()) {
       return res.redirect('/')
    }
    next()
}
//listening port 3030
app.listen(3030)