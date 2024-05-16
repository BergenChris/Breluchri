import {Collection, MongoClient,ObjectId} from "mongodb";
import {Quote,Movie,Character,RootObjectQuote,RootObjectCharacter,RootObjectMovie,User, BlacklistQuote} from "./interfaces/types";
import dotenv from "dotenv";
import { userInfo } from "os";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
dotenv.config();

// hier zijn de const om verbinding te maken met met de DB
export const client = new MongoClient(process.env.MONGO_URI ?? "localhost://27017");
export const collectionQuotes:Collection<Quote> = client.db("LOTR").collection("quotes");
export const collectionMovies:Collection<Movie> = client.db("LOTR").collection("movies");
export const collectionCharacters:Collection<Character> = client.db("LOTR").collection("characters");
export const collectionUsers:Collection<User> = client.db("LOTR").collection("users");


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
        ({$nor:
            [    
                {name : "The Lord of the Rings Series"},
                {name : "The Hobbit Series"},
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
    if (data.length < 2032)
    {
        console.log("Quotes ontbraken/onvolledig");
        // alles uit de collection halen om erna te vullen
        await collectionQuotes.deleteMany();

        // we gaan fetchen via de id van karakters.. deze halen we op uit de gefilterde versie en we zetten deze in een array van id(string) door ze te pushen bij een lege array
        let idCharacters:Character[]=await collectionCharacters.find().toArray();

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
            let correctMovie: Movie | null = await collectionMovies.findOne({ _id: correctQuote.movie });
            let correctCharacter: Character | null = await collectionCharacters.findOne({ _id: correctQuote.character });
            let charactersAll: Character[] = await collectionCharacters.find().toArray();
            let moviesAll: Movie[] = await collectionMovies.find().toArray();
    
            // Controleren of correctMovie en correctCharacter niet null zijn
            if (correctCharacter != null && correctMovie != null) {
                // Array's initialiseren voor de namen van films en karakters
                let movieList: string[] = [correctMovie.name, "", ""];
                let characterList: string[] = [correctCharacter.name, "", ""];
    
                // Lus om karakters te vullen
                for (let i = 0; i < 2; i++) {
                    let same: boolean = true;
                    while (same) {
                        let index: number = Math.ceil(Math.random() * charactersAll.length) - 1;
                        if (charactersAll[index]._id != correctCharacter._id && charactersAll[index].name != characterList[i]) {
                            same = false;
                            characterList[i + 1] = charactersAll[index].name;
                        }
                    }
                }
    
                // Lus om films te vullen
                for (let i = 0; i < 2; i++) {
                    let same: boolean = true;
                    while (same) {
                        let index: number = Math.ceil(Math.random() * moviesAll.length) - 1;
                        if (moviesAll[index]._id != correctMovie._id && moviesAll[index].name != movieList[i]) {
                            same = false;
                            movieList[i + 1] = moviesAll[index].name;
                        }
                    }
                }
    
                // Aanmaak van 2 nieuwe array's waar de volgorde random is
                let movieListMixed: string[] = ["", "", ""];
                let indexMovie: number = Math.ceil(Math.random() * 3) - 1;
                for (let j = 0; j < 3; j++) {
                    movieListMixed[j] = movieList[(j + indexMovie) % 3];
                }
    
                let characterListMixed: string[] = ["", "", ""];
                let indexchar: number = Math.ceil(Math.random() * 3) - 1;
                for (let j = 0; j < 3; j++) {
                    characterListMixed[j] = characterList[(j + indexchar) % 3];
                }
    
                // Console.log van de juiste quote, film en karakter
                console.log("quote: " + correctQuote.dialog, "\njuiste film: " + correctMovie.name, "\njuist karakter: " + correctCharacter.name);
                
                // Return van alle relevante gegevens voor de quizronde
                return [correctQuote, correctMovie, correctCharacter, movieListMixed, characterListMixed];
            } else {
                console.log("Fout bij vinden karakter/film");
            }
        } else {
            console.log("Geen quotes gevonden in de database. Vul de database met quotes voordat je de quiz start.");
            // Eventueel extra stappen om de database te vullen met quotes...
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


export async function InputFavouriteQuote(quoteF: string, user: string)
{
    let quote:Quote|null= await collectionQuotes.findOne({dialog:quoteF});
    if (quote){
        let double:User|null = await collectionUsers.findOne({name:user,favourite:quote});
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
                $push:{favourite:quote}
            })
        }
        return true;
    }
    else {
        return false;
    }
}


export async function InputBlacklist(quoteBL: string, reasonBL:string, user: string)
{
    let quote:Quote|null= await collectionQuotes.findOne({dialog:quoteBL});
    
    if (quote){
        let blacklistQuote:BlacklistQuote={
            quote:quote,
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
                quotesPerUser:quote
            })
        }
        return true;
    }
    else {
        return false;
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

