import {Collection, MongoClient,ObjectId} from "mongodb";
import {Quote,Movie,Character,RootObjectQuote,RootObjectCharacter,RootObjectMovie,User, BlacklistQuote} from "./interfaces/types";
import dotenv from "dotenv";
import { userInfo } from "os";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import bcrypt from "bcrypt";
dotenv.config();

// hier zijn de const om verbinding te maken met met de DB
export const client = new MongoClient(process.env.MONGO_URI ?? "localhost://27017");
export const collectionQuotes:Collection<Quote> = client.db("LOTR").collection("quotes");
export const collectionMovies:Collection<Movie> = client.db("LOTR").collection("movies");
export const collectionCharacters:Collection<Character> = client.db("LOTR").collection("characters");
export const collectionUsers:Collection<User> = client.db("LOTR").collection("users");

export const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017";

const saltRounds : number = 10;

async function createInitialUser() {
    if (await collectionUsers.countDocuments() > 0) {
        return;
    }
    let email : string | undefined = process.env.ADMIN_EMAIL;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
    let name : string | undefined = process.env.ADMIN_NAME;
    let allQuotes : Quote[] = await collectionQuotes.find().toArray();
    if (email === undefined || password === undefined ||name === undefined) {
        throw new Error("Gegevens niet volledig");
    }
    await collectionUsers.insertOne({
        name: name,
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        score10Rounds:[],
        scoreSD:[],
        favourite:[],
        blacklist:[],
        quotesPerUser:allQuotes
    });
}

export async function createUser(email: string, password: string, name: string){
    if (email === undefined || password === undefined || name === undefined) {
        throw new Error("Gegevens niet volledig");
    }
    let allQuotes : Quote[] = await collectionQuotes.find().toArray();
    await collectionUsers.insertOne({
        name: name,
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        score10Rounds:[],
        scoreSD:[],
        favourite:[],
        blacklist:[],
        quotesPerUser:allQuotes
    });
}

export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("E-mail en wachtwoord verplicht");
    }
    let user : User | null = await collectionUsers.findOne<User>({email: email});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Wachtwoord niet correct");
        }
    } else {
        throw new Error("Gebruiker niet gevonden");
    }
}

export function getTopScores(scores: number[]) {
    return scores.sort((a, b) => b - a).slice(0, 3);
}

//de key om de api op te roepen
const apiKey = '2bV52o3FGbuxH6876ax5';

// hier maken we de DataBases leeg, zodat we van O kunnen starten
async function deleteDBCollections()
{
    await collectionQuotes.deleteMany();
    await collectionCharacters.deleteMany();
    await collectionMovies.deleteMany();



}

//we gaan 20 karakters nemen uit de LOTR reeks, we halen dus eerst de json van character binnen en ook ineens de Movies
async function loadCharacters()
{
    let data=await collectionCharacters.find().toArray();
    if (data.length ==0)
    {
        // karakters
        const responseChars = await fetch("https://the-one-api.dev/v2/character", 
        {
            headers: 
            {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        //deze komt in een rootobject binnen genaamd docs. we gaan hier dus een foreach loop doen om ze dan in een eigen array te krijgen en deze toe te voegen aan de DB
        const dataChars:RootObjectCharacter=await responseChars.json();
        let chars:Character[]=[];
        await dataChars.docs.forEach(e => {chars.push(e)});
        await collectionCharacters.insertMany(chars);
        return chars;
    }
    else
    {
        return true;
    }
}
async function loadMovies() 
{
    let data=await collectionMovies.find().toArray();
    if (data.length ==0)
    {
        // films
        const responseMovies = await fetch("https://the-one-api.dev/v2/movie", 
        {
            headers: 
                {
                    'Authorization': `Bearer ${apiKey}`
                }
        });
        const dataMovies:RootObjectMovie = await responseMovies.json();
        let movies:Movie[]=[];
        await dataMovies.docs.forEach(e=>movies.push(e));
        await collectionMovies.insertMany(movies);
        return movies;
    }
    else
    {
        return true;
    }
}
async function updateMovies()
{
    await loadMovies();
    let data=await collectionMovies.find().toArray();
    if (data.length >6)
    {
        //hier filteren we enkel de films eruit
        const moviesFiltered:Movie[]|null = await collectionMovies.find<Movie>
        ({$or:
            [    
                {name : "The Two Towers"},
                {name : "The Fellowship of the Ring"},
                {name : "The Return of the King"},
            ]}).toArray();
        await collectionMovies.deleteMany()
        await collectionMovies.insertMany(moviesFiltered);
        console.log("Films ontbraken")
        return moviesFiltered;
    }
    else 
    {
        console.log("Films reeds ingeladen")
        return true;
    }
    
}
async function updateCharacter()
{
    await loadCharacters();
    let characters=await collectionCharacters.find().toArray();
    if (characters.length > 20) {
        // hier kiezen we onze 20 karakters
        const charactersFiltered: Character[] | null = await collectionCharacters.find<Character>({
            $or: [
                { name: "Gandalf" },
                { name: "Frodo Baggins" },
                { name: "Gollum" },
                { name: "Aragorn II Elessar" },
                { name: "Samwise Gamgee" },
                { name: "Gimli" },
                { name: "Galadriel" },
                { name: "Legolas" },
                { name: "Sauron" },
                { name: "Saruman" },
                { name: "Peregrin Took" },
                { name: "Meriadoc Brandybuck" },
                { name: "Bilbo Baggins" },
                { name: "Boromir" },
                { name: "Arwen" },
                { name: "Elrond" },
                { name: "Théoden" },
                { name: "Treebeard" },
                { name: "Éowyn" },
                { name: "Faramir" }
            ]
        }).toArray();
        
        await collectionCharacters.deleteMany();
        await collectionCharacters.insertMany(charactersFiltered);
        console.log("Karakters ontbraken");
        return charactersFiltered;
    }
    else 
    {
        console.log("Karakters reeds ingeladen");
        return true;
    }
}


async function uploadQuotes()
{
    let data=await collectionQuotes.find().toArray();
    if (data.length === 0)
    {
        console.log("Quotes ontbraken/onvolledig");
        // alles uit de collection halen om erna te vullen
        await collectionQuotes.deleteMany();

        // we gaan fetchen via de id van karakters.. deze halen we op uit de gefilterde versie en we zetten deze in een array van id(string) door ze te pushen bij een lege array
        let idCharacters:Character[]=await collectionCharacters.find().toArray();
        let idMovies:Movie[]=await collectionMovies.find().toArray();

        // deze array gaan we dan gebruiken om alle fetches te doen met de juiste id, dus moesten we id's toevoegen in de filteringswijze dan komen deze automatisch hierbij.
        // alle quotes van bepaald karakter binnenhalen en deze plakken we allemaal aan elkaar (idKarakters=allId[0])
        for (let id of idCharacters)
        {           
            console.log(id.name);
            const responseQuotes = await fetch("https://the-one-api.dev/v2/character/"+id._id+"/quote", 
            {
                headers: 
                {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            const dataQuotes:RootObjectQuote = await responseQuotes.json();
        
            // we vullen de collectie met alle quotes die in de docs zitten door er een foreach lus over te runnen
            let quotesList:Quote[]=[];
            dataQuotes.docs.forEach(e=>quotesList.push(e))
            quotesList = quotesList.map((quote)=>
                {
                    quote.character = id.name
                    for (let movie of idMovies)
                        {
                            if (quote.movie === movie._id.toString())
                                {
                                    quote.movie = movie.name;
                                }
                        }
                    return quote
                })
            await collectionQuotes.insertMany(quotesList);    
        }    
        

    }
    return data;
}

//hier schrijven we de functie die checkt of er al iets in de database zit, zoniet vullen we deze op met een array van objecten die erin horen, we roepen deze later op
async function loadToDB() 
{


    // hier gaan we dan adh filtering karakters ook al die zijn quotes opldaden in array
    let quotes = await collectionQuotes.find().toArray();
    let movies= await collectionMovies.find().toArray();
    let characters = await collectionCharacters.find().toArray();
    if (quotes.length <2032  || movies.length == 0 || characters.length == 0) 
    {
        console.log("Er ontbreekt data in de Databank, even nakijken")
        //we roepen beide uitgeschreven updatefuncties aan
        await updateMovies();
        await updateCharacter();
        await uploadQuotes();  
    }
    else 
    {
        console.log("Databank is volledig")
    }
    return quotes;
}
                        // user specifiek



let currentUser:User|null;

export async function LoadUser(user:string){
    if (!user){
        currentUser= await collectionUsers.findOne({name:"dummie"})
    }
    else{
        currentUser=await collectionUsers.findOne({name:user})
    }
}



                        //pagina specifiek 


// deze maakt lijsten op door een quote te zoeken. dan in movie en karakter collection te zoeken naar de namen via de id
    // [correctQuote.dialog,movieList,movieListMixed,characterList,characterListMixed]
    export async function dataForQuizQuestion() {

        // de quotes laden per user (blacklist eruit)
        let quoteList:Quote[]=[];
        if (currentUser){
            console.log("userQuotes");
            currentUser.quotesPerUser.forEach(e=>quoteList.push(e));
        }
        else
        {
           console.log("allQuotes");
            quoteList = await collectionQuotes.find().toArray();
        }
    
        // Controleer of de quoteList niet leeg is
        if (quoteList.length > 0) {
            let correctQuote: Quote = quoteList[(Math.floor(Math.random() * quoteList.length))] ;
            let charactersAll: Character[] = await collectionCharacters.find().toArray();
            let moviesAll: Movie[] = await collectionMovies.find().toArray();
            // Array's initialiseren voor de karakters
         
            let characterList: string[] = [correctQuote.character, "", ""];

            // Lus om karakters te vullen
            for (let i = 0; i < 2; i++) {
                let same: boolean = true;
                while (same) {
                    let index: number = Math.ceil(Math.random() * charactersAll.length) - 1;
                    if (charactersAll[index].name != correctQuote.character && charactersAll[index].name != characterList[i]) {
                        same = false;
                        characterList[i + 1] = charactersAll[index].name;
                    }
                }
            }

            // Lijst van films (slechts 3 films)
            let movieList:string[]=[];
            for (let i = 0; i < 3; i++) {
                movieList[i]=moviesAll[i].name;
            }

            // Aanmaak van nieuwe array character waar de volgorde random is

            let characterListMixed: string[] = ["", "", ""];
            let indexchar: number = Math.ceil(Math.random() * 3) - 1;
            for (let j = 0; j < 3; j++) {
                characterListMixed[j] = characterList[(j + indexchar) % 3];
            }

            // Console.log van de juiste quote, film en karakter
            console.log("quote: " + correctQuote.dialog, "\njuiste film: " + correctQuote.movie, "\njuist karakter: " + correctQuote.character);
            
            // Return van alle relevante gegevens voor de quizronde
            return [correctQuote, movieList, characterListMixed];
        } else {
            console.log("Fout bij vinden karakter/film");
        }
    
       
                
        
}





//     User aanmaken

export async function CreateDummieUser()
{
    let allQuotes:Quote[]=await collectionQuotes.find().toArray();
    let dummie:User=
    {
        name: "dummie" ,
        password: "password",
        email: "dummie@ap.be",
        score10Rounds:[1,4,10],
        scoreSD:[2,5,9],
        favourite:[],
        blacklist:[],
        quotesPerUser:allQuotes
    }
    collectionUsers.deleteMany();
    await collectionUsers.insertOne(dummie);


}


export async function InputFavouriteQuote(quote: Quote, user: string)
{
    let quoteResponce:Quote|null= await collectionQuotes.findOne(quote);
    if (quoteResponce){
        let double:User|null = await collectionUsers.findOne(quoteResponce);
        if (double)
            {
                console.log("quote reeds als favoriet opgeslagen")
            }
        else
        {
            await collectionUsers.findOneAndUpdate({
                name:user
            },
            {
                $push:{favourite:quoteResponce}
            })
        }
        return true;
    }
    else {
        return false;
    }
}


export async function InputBlacklist(quote:Quote, reasonBL:string, user: string)
{
    let quoteResponce:Quote|null= await collectionQuotes.findOne(quote);
    
    if (quoteResponce){
        let blacklistQuote:BlacklistQuote={
            quote:quoteResponce,
            reason:reasonBL
        }
        let double:User|null = await collectionUsers.findOne({name:user,blacklist:blacklistQuote});
        if (double)
            {
                console.log("fout in de code/logica/mocht niet getoond worden");
            }
        else
        {
            await collectionUsers.findOneAndUpdate({
                name:user
            },
            {
                $push:{blacklist:blacklistQuote}
            })
            await collectionUsers.deleteOne({
                name:user,
                quotesPerUser:quoteResponce
            })
        }
        return true;
    }
    else {
        return false;
    }
}

export async function dummyFavourites() {

        let quote:Quote[] = await collectionQuotes.find().limit(3).toArray();
        if(quote){
            await collectionUsers.findOneAndUpdate({name: "Lucas"},{
            $set:{favourite:quote}
        });
        }
}


export async function Input10RScore(score: number, user: string){
    let userInput:User|null = await collectionUsers.findOne({name:user});
    if (userInput){
        await collectionUsers.findOneAndUpdate({
            name:user
        },
        {
            $push:{score10Rounds:score}
        })
    }
}

export async function InputSDScore(score: number, user: string){
    let userInput:User|null = await collectionUsers.findOne({name:user});
    if (userInput){
        await collectionUsers.findOneAndUpdate({
            name:user
        },
        {
            $push:{scoreSD:score}
        })
    }
}

export async function removeFavourite(quote: Quote, user: User){
    let favourite = user.favourite;
    let index = favourite.indexOf(quote);
    favourite = favourite.splice(index, 1);
    await collectionUsers.updateOne({ name: user.name }, { $set: { favourite: favourite } });
    let quotesUser = user.quotesPerUser;
    quotesUser.push(quote);
    await collectionUsers.updateOne({ name: user.name }, { $set: { quotesPerUser: quotesUser } });
}



async function exit() {
    try {
        await client.close();
        console.log("Verbinding met DB verbroken");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

export async function connect() 
{
    try
    {
        await client.connect();
        console.log("Verbonden met DB");
        await createInitialUser();
        await dummyFavourites();
        // await deleteDBCollections();  // kan later weggelaten worden
    
        
        await loadToDB();
        console.log("quiz");
    

        process.on("SIGINT", exit);
    }
    catch (e)
    {
        console.log(e);
    }   
}