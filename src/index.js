import express, { json } from 'express'
import 'dotenv/config'

const app = express();

const port = process.env.PORT;

app.use(express.json({limit:"16kb"}));

//we have used user variable all user data bcz initially we are not usign Data Base for this project
const USERS = [];

// predefine Data for admin login
const preDefineAdmin = [{adminName: 'admin0512',adminPassword:"admin1234"}];



// We have declare some predefine problems with there title,description and testcases
const questions = [
    {
        title: "Find the Max Number",
        description: "You have an following array.Find max value of given array",
        testCases:[
            {
                input: "[1,2,3,4,5]",
                output: "5",
            },
            {
                input: "[10,20,30,40,50]",
                output: "50"
            }
        ],
        submitStatus: false,
    },
    {
        title: "Sum of the even",
        description:"given a following array.get the all even sum",
        testCases: [
            {
                input: "[4,7,8,9,5,12]",
                output: "24"
            }
        ],
        submitStatus: false,
    }
]

// for demo showing that how it look in frontend
const findMaxValueProblem = questions[0].title+'\n'+questions[0].description+'\n'+questions[0].testCases.map(testCase=>testCase.input+'\n'+testCase.output+'\n');

const sumOfTheEvenProblem = questions[1].title+'\n'+questions[1].description+'\n'+questions[1].testCases.map(testCase=>testCase.input+'\n'+testCase.output+'\n');

const mySubmissions = [];

// User signup 
app.post('/signup',(req,res)=>{
   const {userName,email,password} = req.body;

   if(!userName){
        return res.status(400).send('User Name is Required');
   }
   if(!email){
        return res.status(400).send('Email is Required');
   }
   if(!password){
        return res.status(400).send('Password is Required')
   }

   const userExists = USERS.find(user=>user.userName === userName)
   const emailExists = USERS.find(user=>user.email === email)

   if(userExists){
        return res.status(403).send('User Name is already exists.Try new one');
   }
   if(emailExists){
        return res.status(403).send('Email Is already exists.Try new one');
   }

   USERS.push({userName,email,password});

   return res.status(200).send('Registration is successfull');
})

// this is only for verifying is user sign up or not this is only for admin
app.get('/users',(req,res)=>{
    return res.send(USERS);
})

// same as well login
app.post('/login',(req,res)=>{
    const {userName,password} = req.body;

    if(!userName||!password){
        return res.status(400).send('Email and Password Required');
    }

    const userMatch =  USERS.find(user=>user.userName===userName);
    const passwordMatch = USERS.find(user=>user.password === password);

    
    if(!userMatch){
        return res.status(404).send('Wrong User Name');
    }
    if(!passwordMatch){
        return res.status(401).send('Wrong Password');
    }
    return res.status(200).send('Login Successfull');

})

let adminToken = null;
// this is where admin can login
app.post('/admin',(req,res)=>{
    
    const{adminName,adminPassword} = req.body;

    if(!adminName||!adminPassword){
        return res.status(401).send('Fill Admin Name Email and Password');
    }
    const adminNameMatch = adminName === preDefineAdmin[0].adminName;
    const adminPasswordMatch = adminPassword === preDefineAdmin[0].adminPassword;

    if(adminNameMatch && adminPasswordMatch){
        adminToken = "hjgfdjnvdhfgk";
        return res.status(200).json({message:"Admin login successfull",token: adminToken});
    }

    return res.status(401).send('Wrong admin Information');
})

// after login admin now admin can add new probles to the questions variable
app.post('/admin/add',(req,res)=>{
        const{token,title,description,testCases} = req.body;

        if(token!=adminToken){
            return res.status(403).send('Access Denied.Invalid Token');
        }

        if(!title||!description||!testCases){
            return  res.status(400).send('Please Enter all following info');
        }

        questions.push(
            {
                title,
                description,
                testCases,
            }
        )
        return res.status(201).send('Qustions added successfully');
    })
// checking is admin logged in or not
app.get('/isadmin',(req,res)=>{
    res.send(adminToken?true:false);
})

//showing user all problems that user can see
app.get('/questions',(req,res)=>{
    return res.send(questions);
})

// visit  problem
app.get('/questions/:title',(req,res)=>{
    const {title} = req.params;
    const question = questions.find(question=>question.title.toLowerCase().replace(/\+/g,'_') === title.toLowerCase());

    if(!question){
        res.status(404).send("Question not found");
    }
    return res.send(question);
})


// first problem submission
app.post('/questions/:title/submit',(req,res)=>{
    const {output,userSubmission} = req.body;
    const {title} = req.params;

    
    const question = questions.find(question=>question.title.toLowerCase() === title.toLowerCase());

    if(!question){
        return res.status(404).json({success: false,message: "Question not found"});
    }

    
    const expectedOutputs = question.testCases.map(testcase=>testcase.output);

    const isCorrect = expectedOutputs.includes(userSubmission);

    mySubmissions.push({title: question.title,submitStatus: isCorrect});

    return res.status(isCorrect?200:400).json({
        success: isCorrect,
        message: isCorrect?"Accept":"wrong answer"
    })

})

// user can see submit status 
app.get('/usersubmissions',(req,res)=>{
    return res.send(mySubmissions.map(mySubmission=>`${mySubmission.title} ${mySubmission.submitStatus ? "Accept": "worng answer"}`));
})



app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})