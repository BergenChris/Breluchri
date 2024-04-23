import express from "express";
import ejs from "ejs";
import { isQuestionOrExclamationToken } from "typescript";
import {Quote} from "./types";
import {quote,characters,movies,difficulty} from "./database"


const app = express();

app.set("view engine","ejs");
app.set("port",3000);

app.use(express.static("public"));
app.use(express.urlencoded({extended : false}));
app.use(express.json());



// const user =   hier wordt de user gedeclareerd op loging pagina ingeladen 




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
    let correct:Quote = quote;
    let i:number=1;
    let chars:string[]=[];
    let movies:string[]=[];
    let sameChar:boolean=true;
    let index:number=0;
    for(let i=0;i<2;i++)
    {
        while(sameChar)
            {
                index= Math.floor(Math.random()*difficulty[i]*10);
                if (correct.character!=characters[index])
                {
                    sameChar=false;
                }
        
            }
            chars.push(characters[index])
            let sameMovie:boolean=true;
            while(sameMovie)
            {
                index = Math.floor(Math.random()*difficulty[i]*10);
                if(correct.movie!=movies[index])
                    {
                        sameMovie=false;
                    }
            }
            movies.push(movies[index])
    }  

    res.render("quizTenRounds",
    {
        quote:quote,
        movies:movies,
        chars:chars

    })
})

