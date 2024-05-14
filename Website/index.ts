import express  from "express";
import ejs from "ejs";
import {connect} from "./database";
import { getSourceMapRange, resolveTypeReferenceDirective } from "typescript";
import { title } from "process";
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


app.get("/tenRounds",async (req,res)=>
    {
        
        let data:any = await dataForQuizQuestion();
        //[0] correctQuote
        //[1] correctMovie
        //[2] correctCharacter
        //[3] movieListMixed
        //[4] characterListMixed]
        
        res.render("tenRounds",
        {
            titlePage:"10 Rondes",
            quote:data[0],
            movie:data[1],
            character:data[2],
            movieListMixed:data[3],
            characterListMixed:data[4]
        })     
            
        
    })
app.get("/accountPage",async (req,res)=>
    {
        // let user:User=await getSourceMapRange();

        res.render("accountPage",
        {
            titlePage:"Account"
        })

    })

app.listen(app.get("port"), async () => {
    await connect();
    console.log( "[server] http://localhost:" + app.get("port"));
});
export{};







app.get("/quizPage",(req,res)=>
{
    res.render("quizPage")
})



app.get("/tenRounds",(req,res)=>{

    res.render("tenRounds")
})

app.get("/quizTenRounds",(req,res)=>
{
    
    res.render("quizTenRounds",
    {
        /*
        quote:quote,
        movies:movies,
        chars:characters
        */

    })
})

app.get("/quizSuddenDeath",(req,res)=>
{
    res.render("quizSuddenDeath",
    {
        /*
        quote:quote,
        movies:movies,
        chars:characters
        */
    })
})

app.get("/blacklist",(req,res)=>
{
    res.render("blacklist",
    {
        //quoteBL:quotebl
    })
    
})

app.get("/favourites",(req,res)=>
    {
        res.render("favourites",
        {
            //quoteBL:quotefav
        })
        
    })

app.get("/test",(req,res)=>
{
    res.render("test",
        {
            
        }
    )
})

// Verwerk het POST-verzoek van het formulier
app.post('/process-form', (req, res) => {
    // Ontvang de gegevens van het formulier uit het verzoek
    const { correctScore, characterScore, movieScore, chosenCharacter, chosenMovie, correctCharSelected, correctMovSelected } = req.body;
    // Render de 'score.ejs' pagina met de ontvangen gegevens
    res.render('score', { correctScore, characterScore, movieScore, chosenCharacter, chosenMovie, correctCharSelected, correctMovSelected });
});
