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

app.get("/quizPage",(req,res)=>
    {
        res.render("quizPage",
            {
                titlePage:"Kies de Quiz",
            }
        )
    })


let score:number=0;
let round:number=0;

app.get("/tenRounds",async (req,res)=>
    {
        
        let data:any = await dataForQuizQuestion();
        //[0] correctQuote
        //[1] correctMovie
        //[2] correctCharacter
        //[3] movieListMixed
        //[4] characterListMixed]
        round++;
        res.render("tenRounds",
        {
            titlePage:"10 Rondes",
            round:round,
            quote:data[0],
            movie:data[1],
            character:data[2],
            movieListMixed:data[3],
            characterListMixed:data[4]
        })     
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
    
    score = score + (data.chosenCharacter === true? 0.5 : 0)+(data.chosenMovie === true? 0.5 : 0);
    if(round <10)
        {
            
            res.redirect("tenRounds")    
        }
    else
    {
        score=0;
        round=1;
        res.render("result10R",
        {
            score:score
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
        round++;
        res.render("suddenDeath",
        {
            titlePage:"Sudden Death",
            round:round,
            quote:data[0],
            movie:data[1],
            character:data[2],
            movieListMixed:data[3],
            characterListMixed:data[4]
        })     
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
    
    score = score + (data.chosenCharacter === true? 0.5 : 0)+(data.chosenMovie === true? 0.5 : 0);
    if(round === score)
        {
            res.redirect("suddenDeath");
        }
    else
    {
        score=0;
        round=1;
        res.render("resultSD",
        {
            score:score
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
