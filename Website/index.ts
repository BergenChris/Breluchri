import express  from "express";
import ejs from "ejs";
import {createUser, login,CreateDummieUser, Input10RScore, InputBlacklist, InputFavouriteQuote, InputSDScore,  connect,dataForQuizQuestion} from "./database";
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

    res.redirect("/login");
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
    
    console.log("na post");
    console.log(req.body.quoteDialog);
    console.log(req.body.quoteMovie);
    console.log(req.body.quoteCharacter);
    console.log(req.body.selectedMovie);
    console.log(req.body.selectedCharacter);

    

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
    
 
                res.render("tenRounds", {
                    score: score10R,
                    titlePage: "10 Rondes",
                    round: round10R,
                    quote: data[0],
                    movieListMixed: data[1],
                    characterListMixed: data[2]
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