import express from "express";
import ejs from "ejs";
import { isQuestionOrExclamationToken } from "typescript";


const app = express();

app.set("view engine","ejs");
app.set("port",3000);

app.use(express.static("public"));
app.use(express.urlencoded({extended : false}));
app.use(express.json());


// const user =   hier wordt de user gedeclareerd op loging pagina ingeladen 

let characters:string[] = ["Gandalf","Frodo","Bilbo","Smaug"];
let movies:string[] = ["LOTR - The fellowship of the Ring","LOTR - The Towers","LOTR - The return of the King","The Hobbit - an unexpected Journey","The Hobbit - The desolation of Smaug","The Hobbit - The battle of the five Armies"];

app.get("/",(req,res)=>
{
    res.render("index")
})

app.get("/quizPage",(req,res)=>
{
    res.render("quizPage")
})

app.post("quizPage",(req,res)=>
{
    let choice:string = req.body.q;
    if ( choice = "10round")
    {
        res.redirect("quizTenRounds")
    }
    if (choice = "suddendeath")
    {
        res.redirect("quizSuddenDeath")
    }
    
})

app.get("/quizTenRounds",(req,res)=>
{
    /* de quote ophalen

    let correct:Quote = fetchedQuote;
       

    */

    
     
})