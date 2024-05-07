import express  from "express";
import ejs from "ejs";
import {connect,dataForQuizQuestion} from "./database";


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
