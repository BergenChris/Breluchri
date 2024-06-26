import express  from "express";
import ejs from "ejs";
import {createUser, login,CreateDummieUser, Input10RScore, InputBlacklist, InputFavouriteQuote, InputSDScore, LoadUser, collectionUsers, connect,dataForQuizQuestion, removeFavourite,getTopScores} from "./database";
import { User } from "./interfaces/types";
import session from "./session";
import { secureMiddleware } from "./middleware/secureMiddleware";
import { loginMiddleware } from "./middleware/loginMiddleware";
import { flashMiddleware } from "./middleware/flashMiddleware";
import * as fs from "fs";



const app = express();

app.set("view engine", "ejs");
app.set("port", 3000);
app.use(session);
app.use(flashMiddleware);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get("/404",(req,res)=>{
    res.render("404");
})


app.get("/",(req,res)=>
{

    res.render("index");
})



app.get("/login",loginMiddleware,async(req,res)=>
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


app.post("/logout", secureMiddleware, async(req, res) => {
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


app.get("/quizPage",secureMiddleware,(req,res)=>{
        
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



app.get("/resetTenRounds",secureMiddleware, (req, res) => {
    score10R = 0;
    round10R = 0;
    res.redirect("/tenRounds");
});



app.get("/tenRounds",secureMiddleware, async (req, res) => {
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
            score: score10R,
            titlePage:"Score 10 Rondes"
        });
        // Reset score en ronde voor een nieuw spel
        score10R = 0;
        round10R = 0;
    }
});



app.get("/resetSuddenDeath",secureMiddleware, (req, res) => {
    scoreSD = 0;
    roundSD = 0;
    res.redirect("/suddenDeath");
});



app.get("/suddenDeath",secureMiddleware, async (req, res) => {
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
            score: scoreSD,
            titlePage:"Score Sudden Death"
        });
        // Reset score en ronde voor een nieuw spel
        scoreSD = 0;
        roundSD = 0;
    }
});


app.get("/accountPage", secureMiddleware, async (req,res)=>
    {
        let score10R = getTopScores(req.session.user!.score10Rounds);
        let scoreSD = getTopScores(req.session.user!.scoreSD);
        res.render("accountPage",
        {
            titlePage:"Account",
            sdScores: scoreSD,
            r10Scores: score10R
        })

    })


app.get("/blacklist", secureMiddleware,(req,res)=>
{
    let blacklist = req.session.user?.blacklist;
    res.render("blacklist",
    {
        titlePage:"Blacklist",
        blacklist: blacklist
    })   
})

app.post('/blacklist/update', (req, res) => {
    let blacklist = req.session.user!.blacklist;
    const quoteToUpdate = req.body.quote;
    const newReason = req.body.reason;
    blacklist = blacklist.map(item => {
        if (item.quote.dialog === quoteToUpdate) {
            item.reason = newReason;
        }
        return item;
    });
    res.redirect('/blacklist');
});

app.post('/blacklist/remove', (req, res) => {
    let blacklist = req.session.user!.blacklist;
    const quoteToRemove = req.body.quote;
    blacklist = blacklist.filter(item => item.quote.dialog !== quoteToRemove);
    res.redirect('/blacklist');
});

app.get("/favourites", secureMiddleware,async (req,res)=>
    {
        let user = req.session.user;
        await collectionUsers.find({user : user});
        
        let favourites = user?.favourite;
    
        res.render("favourites",
        {
            titlePage:"Favoriete Quotes",
            favourites: favourites
        })
        
})

app.post('/favourites/remove', async (req, res) => {
    let user = req.session.user;
    const quoteToRemove = req.body.quote;
    await removeFavourite(quoteToRemove, user!);
    res.redirect('/favourites');
});

app.post('/favourites/print', (req, res) => {
    let favourites = req.session.user!.favourite;
    const content = favourites.map(item => `${item.dialog} - ${item.character}`).join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename=favorieten.txt');
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
});


app.listen(app.get("port"), async () => {
    await connect();
    console.log( "[server] http://localhost:" + app.get("port"));
});
export{};


