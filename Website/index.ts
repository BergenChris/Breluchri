import express  from "express";
import ejs from "ejs";
import {connect} from "./database";
const { dataForQuizQuestion } = require("./database");

const app = express();

app.set("view engine", "ejs");
app.set("port", 3000);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/",async (req,res)=>
    {
        let data:any = await dataForQuizQuestion();
        //[0] correctQuote
        //[1] correctMovie
        //[2] correctCharacter
        //[3] movieListMixed
        //[4] characterListMixed]
        
        res.render("test",
        {
            quote:data[0],
            movie:data[1],
            character:data[2],
            movieListMixed:data[3],
            characterListMixed:data[4]
        })     
            
        
    })

app.post("/",async (req,res)=>
{
            
        res.redirect("/")
            
})

// Endpoint om een vraag op te halen
app.get("/quiz/question", async (req, res) => {
    try {
        const quizData = await dataForQuizQuestion();
        res.json({
            question: quizData[0].dialog, // Bijvoorbeeld, haal de dialoog van het personage op als vraag
            options: quizData.slice(1, 4).map((item: any) => item.name) // Bijvoorbeeld, gebruik personagenamen als opties
        });
    } catch (error) {
        console.error("Error fetching question data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Endpoint om een antwoord te verwerken
app.post("/quiz/answer", (req, res) => {
    const { answer } = req.body;
    // Voer de logica uit om het antwoord te controleren (bijvoorbeeld, vergelijk het met het correcte antwoord)
    const correct = true; // Vervang dit met je echte logica om het antwoord te controleren
    res.json({ correct });
});

app.listen(app.get("port"), async () => {
    await connect();
    console.log( "[server] http://localhost:" + app.get("port"));
});
export{};


// const user =   hier wordt de user gedeclareerd op loging pagina ingeladen 


/*

app.get("/",async (req,res)=>
{
   
    res.render("test",
    {
        correct:correct,
        moviesQuiz:moviesQuiz,
        charsQuiz:charsQuiz

    })
})





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
    
    res.render("quizTenRounds",
    {
        quote:quote,
        movies:movies,
        chars:characters

    })
})

app.get("/quizSuddenDeath",(req,res)=>
{
    res.render("quizSuddenDeath",
    {
        quote:quote,
        movies:movies,
        chars:characters
    })
})

app.get("/blacklist",(req,res)=>
{
    res.render("blacklist",
    {
        quoteBL:quotebl
    })
    
})

app.get("/favourites",(req,res)=>
    {
        res.render("favourites",
        {
            quoteBL:quotefav
        })
        
    })

app.get("/test",(req,res)=>
{
    res.render("test",
        {
            
        }
    )
})

*/
