if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  const http = require("http")
  const express = require('express')
  const app = express()
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')

  const { v4: uuidv4 } = require('uuid');

  const initializePassport = require('./passport-config')
  initializePassport(
    passport,
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
  )
  
users = [
  {
    id: '1676108978763',
    role: 'client',
    username: 'a',
    password: '$2b$10$m1iAb1BTsP/m.9u5BhnjHO7GBXqAqiYl09Gqmjfv9uUdtU.WeqObu',
    category: undefined,
    mobile: '1'
  },
  {
    id: '1676109102078',
    role: 'client',
    username: 'b',
    password: '$2b$10$482i9oUyJzuc6vptyHaLQuwfipvspAtsOIBXdXRq6p.tn/9HM9wJ.',
    category: undefined,
    mobile: '2'
  },
  {
    id: '1676109152819',
    role: 'worker',
    username: 'c',
    password: '$2b$10$mQx1LTFeQVP3O2BYFwyUD.DU1W6V28lcgckMIXiDAlsuBBMtUx3fS',
    category: 'AC/Refrigerator',
    mobile: '3'
  },
  {
    id: '1676109176599',
    role: 'worker',
    username: 'd',
    password: '$2b$10$rdrxvQ7zVNIvMoCIdG8fnearGkz0.bxfn35gpvxybekZ3lm3AVO1K',
    category: 'Mobile Phones',
    mobile: '4'
  },
  {
    id: '1676109202811',
    role: 'worker',
    username: 's',
    password: '$2b$10$TXu5Y50doKCAeQgxO3a/Tes0tWvQQD/E/.24vyubYAPdO77988IfC',
    category: 'Laptops',
    mobile: '5'
  }
]

works = []

  app.set('view-engine', 'ejs')
  app.use(express.urlencoded({ extended: false }))
  app.use(express.static("public"))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))
  


  app.post("/client_profile", checkAuthenticatedClient, (req, res) =>{
    req.user.mobile = req.body.mobile

    res.redirect("/clientdashboard")
  })

  app.get('/clientdashboard', checkAuthenticatedClient, (req, res) => {
    // workers = users.filter(user => user.role === "worker")
    hisworks = works.filter(work => {return (work.client == req.user) & (work.status == "") })
    context = {clientuname: req.user.username, mob: req.user.mobile, hisworks:hisworks}

    res.render("clientdashboard.ejs", context)
  })


  app.get("/negotiate", checkAuthenticated, (req, res) =>{
      // room_id = ""
      if(req.user.role == 'worker'){
        work = works.find(work =>{ return work.worker == req.user })
        if(work){
          context = {uname: req.user.username, room_id: work.room_id}
          res.render("chat.ejs", context)
        }
      }else{
        work = works.find(work =>{ return work.client == req.user })
        if(work){
          context = {uname: req.user.username, room_id: room_id}
        res.render("chat.ejs", context)
      }
    }
    
  })

  app.post("/addwork", checkAuthenticatedClient, (req, res)=>{
    works.push(
      {
        id: Date.now().toString(),
        client: req.user,
        category: req.body.category,
        price: req.body.price,
        desc: req.body.desc,
        worker: {},
        status:"",
        room_id:""
      }
    )

    res.redirect("/clientdashboard")
  })


  app.post("/removework", checkAuthenticatedWorker, (req, res) =>{
    toremove = works.find(work =>{return work.id == req.body.remove })
    toremove.worker = {}
    toremove.status = ""
    toremove.rood_id = ""
    res.redirect("/workerdashboard")
  })

  app.post("/removework_client", checkAuthenticatedClient, (req, res) =>{
    works = works.filter(work =>{return work.id != req.body.remove })
   
    res.redirect("/workerdashboard")
  })

  app.post("/applywork", checkAuthenticatedWorker, (req, res)=>{
    work = works.find(work => work.id === req.body.workid)
    work.worker = req.user
    work.status = "pending"
    room_id = uuidv4()
    work.room_id = room_id
    console.log(work)
    res.redirect("/workerdashboard")
  })

  app.post("/worker_profile", checkAuthenticatedWorker, (req, res) =>{
    req.user.mobile = req.body.mobile
    req.user.category = req.body.category

    res.redirect("/workerdashboard")
  })


  app.get('/workerdashboard', checkAuthenticatedWorker, (req, res) => {
    activeworks = works.filter(work => {
      return work.status == ""
    })
    hisworks = works.filter(work => {return (work.worker == req.user) & (work.status == "pending") })
    context ={works: activeworks, workeruname: req.user.username, mob: req.user.mobile, hisworks:hisworks}

    res.render("workerdashboard.ejs", context)
  })


  app.get('/', checkNotAuthenticated, (req, res) => {
    res.render("landing.ejs")
  })
  
  app.get('/loginworker', checkNotAuthenticated, (req, res) => {
    res.render('loginworker.ejs')
  })
  
  app.get('/loginclient', checkNotAuthenticated, (req, res) => {
    res.render('loginclient.ejs')
  })
  
  app.post('/loginworker', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/loginworker',
    failureFlash: true
  }))

  app.post('/loginclient', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/loginclient',
    failureFlash: true
  }))
  
  app.get('/signupworker', checkNotAuthenticated, (req, res) => {
    res.render('signupworker.ejs')
  })
  
  app.get('/signupclient', checkNotAuthenticated, (req, res) => {
    res.render('signupclient.ejs')
  })
  
  app.post('/signup', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password1, 10)

        users.push({
          id: Date.now().toString(),
          role: req.body.role,
          username: req.body.username,
          password: hashedPassword,
          category : req.body.category, 
          mobile: req.body.mobile
        })

      if(req.body.role == "client"){
        res.redirect('/loginclient')

      }
      else{
        res.redirect('/loginworker')

      }

    } catch {
      if(req.body.role == "client"){
        res.redirect('/signupclient')

      }
      else{
        res.redirect('/signupworker')

      }
    }
  })
  
  app.delete('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
  
  function checkAuthenticatedWorker(req, res, next) {
    if (req.isAuthenticated() && req.user.role =="worker") {
      return next()
    }
  
    res.redirect('/')
  }
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/')
  }

  function checkAuthenticatedClient(req, res, next) {
    if (req.isAuthenticated() && req.user.role =="client") {
      return next()
    }
  
    res.redirect('/')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      if(req.user.role == "client"){
        return res.redirect('/clientdashboard')

      }
      else{
        return res.redirect('/workerdashboard')

      }
    }
    next()
  }
  

// socket io 
const server = http.createServer(app)

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000/"],
    methods: ["GET", "POST"]
  }
});

io.on("connection", socket =>{
      socket.on("joinroom", room_id=>{
        socket.join(room_id)
      })

    //   socket.on("new-user-joined", (username, room_id) =>{
    //     socket.to(room_id).emit("user-joined", username)
    // })

    socket.on("send", (message, username, room_id) =>{
      socket.to(room_id).emit("recieve", {message : message, name : username})
    })

    // socket.on("disconnect", ()=>{
    //   socket.to(room_id).emit("user-left", users[socket.id])
    // })
})

server.listen(3000, ()=>{
    console.log("App here: http://localhost:3000/")
})