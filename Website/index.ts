import express  from "express";
import ejs from "ejs";
import {CreateDummieUser, Input10RScore, InputBlacklist, InputFavouriteQuote, InputSDScore, LoadUser, collectionUsers, connect,dataForQuizQuestion} from "./database";
import { User } from "./interfaces/types";




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



app.get("/login",async(req,res)=>
{
    await CreateDummieUser();
    res.render("login",
    {
        titlePage:"Login"
    });
    await LoadUser("dummie");

})


app.post("/login",async (req,res)=>
{
    await CreateDummieUser();
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


app.get("/quizPage",(req,res)=>{
        
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



app.get("/tenRounds", async (req, res) => {
    
   
            let data:any = await dataForQuizQuestion();
            // [correctQuote, movieListMixed, characterListMixed]
            round10R++;
            console.log("Round:", round10R);
            console.log("Score:", score10R);
    
 
                res.render("tenRounds", {
                    score: score10R,
                    titlePage: "10 Rondes",
                    round: round10R,
                    quote: data[0],
                    movieListMixed: data[1],
                    characterListMixed: data[2]
                });
   
            
       
    });
    
app.post("/tenRounds",  (req,res)=>
{
    let dataP = req.body;
    console.log("na post");
    console.log(dataP);
    if (dataP.favourite)
        {
            InputFavouriteQuote(dataP.quote,"dummie");
        }
    if (dataP.blacklist)
        {
            InputBlacklist(dataP.quote, dataP.blacklistReason, "dummie")
        }
    
    score10R = score10R + (dataP.chosenCharacter === "true" && dataP.chosenMovie === "true"? 1 : 0);
    if(round10R < 10)
        {
            
            res.redirect("tenRounds")    
        }
    else
    {
        Input10RScore(score10R,"dummie");
        res.render("result10R",
        {
            score:score10R
        });
    }
    
})


app.get("/suddenDeath",async (req,res)=>
    {
        
        
        let data:any = await dataForQuizQuestion();
        // [correctQuote, movieListMixed, characterListMixed];

            roundSD++;
            res.render("suddenDeath",
            {
                score:scoreSD,
                titlePage:"Sudden Death",
                round:roundSD,
                quote:data[0],
                movieListMixed:data[1],
                characterListMixed:data[2]
            })               
        })

        
    

app.post("/suddenDeath",(req,res)=>
{
    let data = req.body;
    console.log(data);
    if (data.favorite)
        {
            InputFavouriteQuote(data.quote,"dummie");
        }
    if (data.blacklist)
        {
            InputBlacklist(data.quote, data.blacklistReason, "dummie")
        }
    console.log(scoreSD);
    scoreSD = scoreSD + (data.chosenCharacter === "true" && data.chosenMovie === "true"? 1 : 0);
    console.log(scoreSD ===roundSD);
    if(roundSD === scoreSD)
        {
            res.redirect("suddenDeath");
        }
    else
    {
        InputSDScore(scoreSD,"dummie");
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
