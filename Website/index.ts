import express  from "express";
import ejs from "ejs";
import {createUser, login,CreateDummieUser, Input10RScore, InputBlacklist, InputFavouriteQuote, InputSDScore, LoadUser, collectionUsers, connect,dataForQuizQuestion} from "./database";
import { User } from "./interfaces/types";
import { secureMiddleware } from "./middleware/secureMiddleware";
import session from "./session";



const app = express();

app.set("view engine", "ejs");
app.set("port", 3000);
app.use(session);

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


app.get("/recover", (req, res) => {
    res.render("recover",
        {
        titlePage:"Wachtwoord vergeten"
        }
    );
});

app.post('/recover', (req, res) => {
    const { email } = req.body;

    
    console.log(`Mail verzonden naar ${email}`);
    res.status(200).send("Gelukt");
});

app.get("/logout", async(req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});


app.get("/register", (req, res) => {
    res.render("register",
        {
        titlePage:"registreren"
        }
    );
});

app.post("/register", async(req, res) => {
    const {email} = req.body;
    const {name} = req.body;
    const {password} = req.body;
    console.log(email, name, password);
    await createUser(email, name, password);
    res.redirect("/login")  

});

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
});


app.get("/resetTenRounds", (req, res) => {
    score10R = 0;
    round10R = 0;
    res.redirect("/tenRounds");
});



app.get("/tenRounds", async (req, res) => {
    if (round10R === 0) {
        score10R = 0; // Reset the score when the round counter is zero
    }
   
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

app.post("/tenRounds", (req, res) => {
    let dataP = req.body;
    console.log("na post");
    console.log(dataP);

    
    let characterCorrect = dataP.chosenCharacter === "true";
    let movieCorrect = dataP.chosenMovie === "true";

    // Update de score
    score10R += (characterCorrect ? 0.5 : 0) + (movieCorrect ? 0.5 : 0);


    if (dataP.favourite === "true") {
        InputFavouriteQuote(dataP.quote, "dummie");
    }
    if (dataP.blacklist === "true") {
        InputBlacklist(dataP.quote, dataP.blacklistReason, "dummie");
    }

    if (round10R < 10) {
        res.redirect("tenRounds");
    } else {
        Input10RScore(score10R, "dummie");
        res.render("result10R", {
            score: score10R
        });
    }
});

app.get("/resetSuddenDeath", (req, res) => {
    scoreSD = 0;
    roundSD = 0;
    res.redirect("/suddenDeath");
});



app.get("/suddenDeath", async (req, res) => {
    if (roundSD === 0) {
        scoreSD = 0; 
    }
    let data: any = await dataForQuizQuestion();
    roundSD++;
    res.render("suddenDeath", {
        titlePage: "Sudden Death",
        round: roundSD,
        score: scoreSD,
        quote: data[0],
        movie: data[1],
        character: data[2],
        movieListMixed: data[3],
        characterListMixed: data[4]
    });
});
    
app.post("/suddenDeath", (req, res) => {
    let data = req.body;
    console.log(data);

    if (data.favourite === "true") {
        InputFavouriteQuote(data.quote, "dummie");
    }
    if (data.blacklist === "true") {
        InputBlacklist(data.quote, data.blacklistReason, "dummie");
    }

    let correctCharacter = data.chosenCharacter === "true";
    let correctMovie = data.chosenMovie === "true";

    if (correctCharacter && correctMovie) {
        scoreSD++;
        res.redirect("/suddenDeath");
    } else {
        InputSDScore(scoreSD, "dummie");
        res.render("resultSD", {
            score: scoreSD
        });
    }
});


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
        titlePage:"Blacklist"
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
