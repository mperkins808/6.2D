const express = require('express')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const {promisify} = require('util')
const sleep = promisify(setTimeout)
const stripe = require('stripe')('sk_test_51JWd9kF5mb4sOYcjhwbUyCVKOwemHy6TpJudi0UzBYt4IZChA7no04AEq0FnpcLMkbrq97xJdaud2zPKL8Mjc0OA00hsqZbXYH');
mongoose.connect('mongodb+srv://mperkins808:57Bfield57@cluster0.yymy5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
const app = express()
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(express.static("public"))
//Server url
//https://quiet-plains-44536.herokuapp.com/
//MONGOOSE RELATED CODE
const iServerDBSchema = mongoose.Schema(
    {   _id:Number,
        country: {type: String,
            required:false},
        fname: {type: String,
            required:true},
        lname: {type: String,
            required:true},
        email:{type: String,
            trim:true,
            lowercase:true,
            validate(value){
                if (!validator.isEmail(value)){
                    throw new Error('Email Not Valid')
                }
            }},
        password:{type: String,
            required:false,},
        confirmPassword:{type: String,
            required:false,},
        address1: {type: String,
            required:false},
        address2: {type: String,
            required:false},
        city: {type: String,
            required:false},
        state: {type: String,
            required:false},
        zipcode: {type: String,
            required:false},
        phoneNumber: {type: String,
            required:false},
    }
)
const iServiceDB = new mongoose.model('iServiceDB', iServerDBSchema)

//EXPRESS RELATED CODE
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/html/index.html")
})
app.get('/custtask.html', (req, res) => {
    res.sendFile(__dirname + "/public/html/custtask.html")
})
//Naviating to the signup page
app.post('/signup', (req, res) => {
            res.sendFile(__dirname + "/public/html/signup.html")
})

//When user clicks the login button
app.post('/login', (req, res) => {
    const emailLogin = req.body.emailLogin
    const passwordLogin = req.body.passwordLogin
    iServiceDB.findOne({ email : emailLogin}, (err, docs) => {
        //Query was empty
        if (err) 
        {
            console.log("Query was empty")
        }
        //Handles the results of the query
        else if (docs != null)
        {
            if (bcrypt.compareSync(passwordLogin, docs.password))
            {
                res.sendFile(__dirname + "/public/html/custtask.html")
            } 
            else
            {
                res.send("Password was incorrect")
            }

        }

    })
})

app.post('/', (req, res) => {
        const salt = bcrypt.genSaltSync(10)
        var infoCheck = false
        //Extracts a random id to assign
        const _id = Math.floor(Math.random() * 1000000)
        const country = req.body.country
        const fname = req.body.first_name
        const lname = req.body.last_name
        const passwordHash = bcrypt.hashSync(String(req.body.password), salt)
        const confirmPasswordHash = bcrypt.hashSync(String(req.body.confirmPassword), salt)
        const email = req.body.email
        const address1 = req.body.address1
        const address2 = req.body.address2
        const city = req.body.city
        const state = req.body.state
        const zipcode = req.body.zipcode
        const phoneNumber = req.body.phoneNumber
        if (passwordHash != confirmPasswordHash && confirmPasswordHash != null)
        {
        infoCheck = true
        }

    //ONLY EXECUTES if on signup page and the signup button is selected
    else if (req.body.signupcommit == 3)
    {
        console.log("Hash 1: " + passwordHash)
        console.log("Hash 2: " + confirmPasswordHash)
        const dbEntry = new iServiceDB(
            {
                _id:_id,
                country:country,
                fname:fname,
                lname:lname,
                email:email,
                password:passwordHash,
                confirmPassword:confirmPasswordHash,
                address1:address1,
                address2:address2,
                city:city,
                state:state,
                zipcode:zipcode,
                phoneNumber:phoneNumber    
            })
        if (!infoCheck)
        {
        dbEntry.save((err) =>{
        if (err) {
            console.log(err)
            infoCheck = true
        }
        else{
            console.log('Success')
            res.sendFile(__dirname + "/public/html/index.html")
            infoCheck = false;
        }
        })
        }
        else
        {
        res.send("<H1>You did not enter a field correctly</H1>")
        }
    }
    
})

app.post('/loginG', (req, res) => {
    var accountFound = false
    iServiceDB.findOne( {email: req.body.email }, (err, docs) => {
        if (docs != null) {
            console.log("account found")
            accountFound = true
        }
        else
        {
            console.log("account not found")
            accountFound = false
            //creates the user

        }
    })
    sleep(1000).then(() => {
        if (accountFound)
        {
            res.send("custtask.html")
        }
        else
        {
            res.send("account_created")
            const dbGEntry = new iServiceDB(
                {
                    _id: req.body.ID || "-1",
                    country: "",
                    fname: req.body.fname || "Name not found",
                    lname: req.body.sname || "Name not found",
                    email: req.body.email || "NOEMAILFOUND@gmail.com",
                    password: "",
                    confirmPassword: "",
                    address1:"GOOGLE ACCOUNT",
                    address2:"",
                    city: "",
                    state:"",
                    zipcode:"",
                    phoneNumber: ""    
                })
            dbGEntry.save((err) =>{
                if (err) {
                    console.log(err)
                }
            })
        }
    })
    
})

const YOUR_DOMAIN = 'http://localhost:5000';
app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1JWdFuF5mb4sOYcj7cTKhTTx',
          quantity: 1,
        },
      ],
      payment_method_types: [
        'card',
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });
  
    res.redirect(303, session.url)
  });
let port = process.env.PORT
if (port == null || port == "")
{
    port = 5000;
}
app.listen(port, (req, res)=> {
    console.log("Server running succesfully")
})