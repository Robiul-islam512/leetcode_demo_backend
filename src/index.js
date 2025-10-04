import express, { json } from 'express'

const app = express();

const port = 3000;

app.use(express.json({limit:'16kb'}));

const USERS = [];
const preDefineAdmin = [{adminName: 'admin0512',adminPassword:"admin1234"}];
let isAdmin = false;

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
                output: "50",
            }
        ]
    },
    {
        title: "Sum of the even",
        description:"given a following array.get the all even sum",
        testCases: [
            {
                input: "[4,7,8,9,5,12]",
                output: "24"
            }
        ]
    }
]

const findMaxValueProblem = questions[0].title+'\n'+questions[0].description+'\n'+questions[0].testCases.map(testCase=>testCase.input+'\n'+testCase.output+'\n');

const sumOfTheEvenProblem = questions[1].title+'\n'+questions[1].description+'\n'+questions[1].testCases.map(testCase=>testCase.input+'\n'+testCase.output+'\n');

const mySubmissions = [questions[1].title];


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

app.get('/users',(req,res)=>{
    return res.send(USERS);
})

app.post('/login',(req,res)=>{
    const {userName,password} = req.body;

    if(!userName||!password){
        return res.status(404).send('Email and Password Required');
    }

    const userMatch =  USERS.find(user=>user.userName===userName);
    const passwordMatch = USERS.find(user=>user.password === password);

    
    if(!userMatch){
        return res.status(404).send('Wrong User Name');
    }
    if(!passwordMatch){
        return res.status(404).send('Wrong Password');
    }
    return res.status(200).send('Login Successfull');

})

app.post('/admin',(req,res)=>{
    
    const{adminName,adminPassword} = req.body;

    if(!adminName||!adminPassword){
        return res.status(401).send('Fill Admin Name Email and Password');
    }
    const adminNameMatch = adminName === preDefineAdmin[0].adminName;
    const adminPasswordMatch = adminPassword === preDefineAdmin[0].adminPassword;

    if(adminNameMatch && adminPasswordMatch){
        isAdmin = true;
        return res.status(200).send('Admin login successfull');
    }

    return res.status(401).send('Wrong admin Information');
})
app.post('/admin/add',(req,res)=>{
        const{title,description,testCases} = req.body;

        if(!isAdmin){
            return res.status(403).send('Access Denied.Only Aadmin can access');
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

app.get('/isadmin',(req,res)=>{
    res.send(isAdmin);
})

app.get('/questions',(req,res)=>{
    return res.send(questions);
})


app.get('/questions/find_max_value',(req,res)=>{
    return res.send(findMaxValueProblem);
})

app.get('/questions/Sum_of_the_even',(req,res)=>{
    return res.send(sumOfTheEvenProblem)
})

app.post('/questions/find_max_value/submit',(req,res)=>{
    const {userSubmission} = req.body;

    const question = questions.find(question=>question.title === 'Find the Max Number');

    if(!question){
        return res.status(404).json({success: false,message: 'Question not found'});
    }

    const expectedOutputs = question.testCases.map(testcase=>testcase.output);

    const isCorrect = expectedOutputs.every((output,index)=>output==userSubmission[index])

    if(!isCorrect){
        return res.status(404).send('Wrong Answer');
    }

    mySubmissions.push(question.title)
    return res.status(200).send('Accepted');

})

app.get('/usersubmissions',(req,res)=>{
    return res.send(mySubmissions.map(mySubmission=>mySubmission));
})



app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})