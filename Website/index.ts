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
    //await CreateDummieUser();
    res.render("login",
    {
        titlePage:"Login"
    });
    //await LoadUser("dummie");

})


app.post("/login", async(req, res) => {
    const email : string = req.body.email;
    const password : string = req.body.password;
    try {
        let user : User = await login(email, password);
        delete user.password; 
        req.session.user = user;
        res.redirect("/introPage")
    } catch (e : any) {
        res.redirect("/login");
    }
});


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

app.get("/introPage", secureMiddleware,(req,res)=>
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

app.post("/tenRounds", async (req, res) => {
    let dataP = req.body;
    console.log("na post");
    console.log(dataP);

    // Controleer de gekozen antwoorden
    let characterCorrect = dataP.chosenCharacter === "true";
    let movieCorrect = dataP.chosenMovie === "true";

    // Update de score op basis van de gekozen antwoorden
    score10R += (characterCorrect ? 0.5 : 0) + (movieCorrect ? 0.5 : 0);

    if (dataP.favourite === "true") {
        await InputFavouriteQuote(dataP.quote, req.session.user!.name);
    }
    if (dataP.blacklist === "true") {
        await InputBlacklist(dataP.quote, dataP.blacklistReason, req.session.user!.name);
    }

    if (round10R < 10) {
        res.redirect("tenRounds");
    } else {
        await Input10RScore(score10R, req.session.user!.name);  // Sla de score op in de database
        res.render("result10R", {
            score: score10R
        });
        // Reset score en ronde voor een nieuw spel
        score10R = 0;
        round10R = 0;
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
    let data:any = await dataForQuizQuestion();
            // [correctQuote, movieListMixed, characterListMixed]
            roundSD++;
            console.log("Round:", roundSD);
            console.log("Score:", scoreSD);
    
 
                res.render("suddenDeath", {
                    score: scoreSD,
                    titlePage: "Sudden Death",
                    round: scoreSD,
                    quote: data[0],
                    movieListMixed: data[1],
                    characterListMixed: data[2]
                });
   
});
    
app.post("/suddenDeath", async (req, res) => {
    let data = req.body;
    console.log(data);

    let characterCorrect = data.chosenCharacter === "true";
    let movieCorrect = data.chosenMovie === "true";

    if (data.favourite === "true") {
        await InputFavouriteQuote(data.quote, req.session.user!.name);
    }
    if (data.blacklist === "true") {
        await InputBlacklist(data.quote, data.blacklistReason, req.session.user!.name);
    }

    

    if (characterCorrect && movieCorrect) {
        scoreSD++;
        res.redirect("/suddenDeath");
    } else {
        await InputSDScore(scoreSD, req.session.user!.name);
        res.render("resultSD", {
            score: scoreSD
        });
        // Reset score en ronde voor een nieuw spel
        scoreSD = 0;
        roundSD = 0;
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