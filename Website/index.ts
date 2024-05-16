import express  from "express";
import ejs from "ejs";
import {InputBlacklist, InputFavouriteQuote, connect} from "./database";
import { getSourceMapRange, getTsBuildInfoEmitOutputFilePath, resolveTypeReferenceDirective } from "typescript";
import { title } from "process";
import { Quote } from "./interfaces/types";
const { dataForQuizQuestion } = require("./database");

const app = express();

app.set("view engine", "ejs");
app.set("port", 3000);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/",(req,res)=>
{

    res.render("index");
})

app.get("/login",(req,res)=>
{
    res.render("login",
    {
        titlePage:"Login"
    });
})

app.post("/login",(req,res)=>
{
    // checken of je ingelogd bent
    res.redirect("quizPage");
})

app.get("/introPage",(req,res)=>
{
    res.render("introPage",
    {
        titlePage:"intro"
    });
})

// quizgedeelte

export let score10R:number=0;
export let scoreSD:number=0;
export let round10R:number=0;
export let roundSD:number=0;


app.get("/quizPage",(req,res)=>
    {
        
        scoreSD=0;
        roundSD=0;
        score10R=0;
        round10R=0;
        res.render("quizPage",
            {
                titlePage:"Kies de Quiz",
            }
        )
    })



app.get("/tenRounds",async (req,res)=>
    {
        
        let data:any = await dataForQuizQuestion();
        //[0] correctQuote
        //[1] correctMovie
        //[2] correctCharacter
        //[3] movieListMixed
        //[4] characterListMixed]
        round10R++;
        if(round10R<=10){
            res.render("tenRounds",{
                titlePage:"10 Rondes",
                round:round10R,
                quote:data[0],
                movie:data[1],
                character:data[2],
                movieListMixed:data[3],
                characterListMixed:data[4]
            })     
        }
        else{
            res.redirect("quizPage");
        }

        
    })

app.post("/tenRounds",async (req,res)=>
{
    let data = req.body;
    console.log(data.quote);
    console.log(data.favorite);
    console.log(data.blacklistReason);
    console.log(data.blacklist);
    console.log(data.chosenCharacter);
    console.log(data.chosenMovie);
    if (data.favorite)
        {
            InputFavouriteQuote(data.quote,"dummie");
        }
    if (data.blacklist)
        {
            InputBlacklist(data.quote, data.blacklistReason, "dummie")
        }
    
    score10R = score10R + (data.chosenCharacter === true? 0.5 : 0)+(data.chosenMovie === true? 0.5 : 0);
    if(round10R <10)
        {
            
            res.redirect("tenRounds")    
        }
    else
    {
  
        res.render("result10R",
        {
            score:score10R
        });
    }
    
})


app.get("/suddenDeath",async (req,res)=>
    {
        
        let data:any = await dataForQuizQuestion();
        //[0] correctQuote
        //[1] correctMovie
        //[2] correctCharacter
        //[3] movieListMixed
        //[4] characterListMixed]
        console.log(scoreSD);
        console.log(roundSD);
        if (scoreSD === roundSD){
            roundSD++;
            res.render("suddenDeath",
            {
                titlePage:"Sudden Death",
                round:roundSD,
                quote:data[0],
                movie:data[1],
                character:data[2],
                movieListMixed:data[3],
                characterListMixed:data[4]
            })               
        }
        else{

            res.redirect("quizPage")
        }
        
    })

app.post("/suddenDeath",(req,res)=>
{
    let data = req.body;
    console.log(data.quote);
    console.log(data.favorite);
    console.log(data.blacklistReason);
    console.log(data.blacklist);
    console.log(data.chosenCharacter);
    console.log(data.chosenMovie);
    if (data.favorite)
        {
            InputFavouriteQuote(data.quote,"dummie");
        }
    if (data.blacklist)
        {
            InputBlacklist(data.quote, data.blacklistReason, "dummie")
        }

    scoreSD = scoreSD + (data.chosenCharacter === "true"? 0.5 : 0)+(data.chosenMovie === "true"? 0.5 : 0);
    if(roundSD === scoreSD)
        {
            res.redirect("suddenDeath");
        }
    else
    {
        res.render("resultSD",
        {
            score:scoreSD
        });
    }
    
})


app.get("/accountPage",async (req,res)=>
    {
        // let user:User=await getSourceMapRange();

        res.render("accountPage",
        {
            titlePage:"Account"
        })

    })





app.get("/quizSuddenDeath",(req,res)=>
{
    res.render("quizSuddenDeath",
    {
        titlePage:"Sudden Death"
    })
})

app.get("/blacklist",(req,res)=>
{
    res.render("blacklist",
    {
        titlePage:"Blacklisy"
    })
    
})

app.get("/favourites",(req,res)=>
    {
        res.render("favourites",
        {
            titlePage:"Favoriete Quotes"
        })
        
    })





app.listen(app.get("port"), async () => {
    await connect();
    console.log( "[server] http://localhost:" + app.get("port"));
});
export{};
