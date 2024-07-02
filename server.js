import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import multer from 'multer';
import { User } from './Models/users.js';
import { v2 as cloudinary } from 'cloudinary';

const app = express();

// Middleware
app.use(express.json()); // to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies
// Configuration
cloudinary.config({ 
    cloud_name: 'ddy7obnn5', 
    api_key: '253369474946331', 
    api_secret: '0HjJi14hGD7wCtH2wwUzzMZtkiM' // Click 'View Credentials' below to copy your API secret
});
app.use(express.urlencoded({extended:true}))

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes
app.get('/register', (req, res) => {
  res.render('register.ejs');
});

app.post('/register', upload.single('file'), async (req, res) => {
    const file=req.file.path
  const { name, email, password } = req.body;
  try {
    const cloudinaryRes=await cloudinary.uploader.upload(file,{
        folder:'NodeJsAuth_APP'
    })

   
    let user =await User.create({
        profileImg:cloudinaryRes.secure_url,
        name,email,password
    })
  
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.redirect('/login');
    console.log(cloudinaryRes,name,email,password)
  } catch (error) {
    res.status(500).send('Error creating user');
  }
});
//home page
app.get('/', (req, res) => {
    res.render('login.ejs');
  });
//show login page 
app.get('/login', (req, res) => {
  res.render('login.ejs');
});
//login user
app.post('/login',async(req,res)=>{

 const{email,password}=req.body

 try{
    let user=await User.findOne({email})
    console.log("Gettin user",user)
    if(!user)res.render("login.ejs",{msg:'User not found'})
    else if(user.password != password){
res.render("login.ejs",{msg:'Password is incorrect'})
    }
    else{
        res.render("profile.ejs",{user})
    }
 }
 catch{
    res.status(500).send('Error creating user');
 }
})

// all users

app.get("/users",async(req,res)=>{
    let users=await User.find().sort({createdAt:-1});
    res.render("users.ejs",{users})
})

// Connect to MongoDB
mongoose.connect('mongodb+srv://pranav:mongocloud@cloudlearn.jrnkxc7.mongodb.net/', {
  dbName: 'Auth',
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB is connected');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Start server
const PORT = 1000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
