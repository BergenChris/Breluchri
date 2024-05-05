import {Collection, MongoClient,ObjectId} from "mongodb";
import {Quote,Movie,Character,RootObjectQuote,RootObjectCharacter,RootObjectMovie} from "./interfaces/types";
import dotenv from "dotenv";
dotenv.config();



// hier zijn de const om verbinding te maken met met de DB
export const client = new MongoClient(process.env.MONGO_URI ?? "localhost://27017");
export const collectionQuotes:Collection<Quote> = client.db("LOTR").collection("quotes");
export const collectionMovies:Collection<Movie> = client.db("LOTR").collection("movies");
export const collectionCharacters:Collection<Character> = client.db("LOTR").collection("characters");






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
async function loadCharactersAndMovies()
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
    // we retourneren chars omdat de filtering hier mee gebeurd
    return chars;
}




async function filteredVersionOfCharacterAndMovies()
{
    //we loaden eerste beide om dan te filteren


    //hier filteren we enkel de films eruit
    const moviesFiltered:Movie[]|null = await collectionMovies.find<Movie>
    ({$nor:
        [    
            {name : "The Lord of the Rings Series"},
            {name : "The Hobbit Series"},
        ]}).toArray();
    await collectionMovies.deleteMany()
    await collectionMovies.insertMany(moviesFiltered);
    

    // hier kiezen we onze 20 karakters
    const charactersFiltered:Character[]|null = await collectionCharacters.find<Character>
    ({$or:
        [
            {name : "Gandalf" },
            {name : "Frodo Baggins"},
            {name : "Gollum"},
            {name : "Aragorn II Elessar"},
            {name : "Samwise Gamgee"},
            {name : "Gimli"},
            {name : "Galadriel"},
            {name : "Legolas"},
            {name : "Sauron"},
            {name : "Saruman"},
            {name : "Peregrin Took"},
            {name : "Meriadoc Brandybuck"},
            {name : "Bilbo Baggins"}, 
            {name : "Boromir"}, 
            {name : "Arwen"},
            {name : "Elrond"}, //16
            {name : "Théoden"},
            {name : "Treebeard"},
            {name : "Éowyn"},
            {name : "Faramir"}
        ]}).toArray();  
    await collectionCharacters.deleteMany();
    await collectionCharacters.insertMany(charactersFiltered);
    
    return charactersFiltered;
}





//hier schrijven we de functie die checkt of er al iets in de database zit, zoniet vullen we deze op met een array van objecten die erin horen, we roepen deze later op
async function quotesToDB() {


    // hier gaan we dan adh filtering karakters ook al die zijn quotes opldaden in array
    const quotes = await collectionQuotes.find({}).toArray();
    if (quotes.length == 0) 
    {
        console.log("DB leeg. DB vullen via API")
        // we gaan fetchen via de id van karakters.. deze halen we op uit de gefilterde versie en we zetten deze in een array van id(string) door ze te pushen bij een lege array

        let idCharacters:Character[]=await filteredVersionOfCharacterAndMovies();
        console.log(idCharacters.length);
        
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
    return [quotes]
}




        

                        //pagina specifiek






// deze maakt lijsten op door een quote te zoeken. dan in movie en karakter collection te zoeken naar de namen via de id
    // [correctQuote.dialog,movieList,movieListMixed,characterList,characterListMixed]
export async function dataForQuizQuestion()
{
    let quoteList:Quote[] = await collectionQuotes.find().toArray();
    let correctQuote:Quote= quoteList[Math.ceil(Math.random()*quoteList.length)-1]; 
    let correctMovie:Movie|null = await collectionMovies.findOne({_id:correctQuote.movie});
    let correctCharacter:Character|null = await collectionCharacters.findOne({_id:correctQuote.character}) 
    let charactersAll:Character[] = await collectionCharacters.find().toArray();
    let moviesAll:Movie[] = await collectionMovies.find().toArray();
    
    
    // checken of de fund niet 0 is 
    if (correctCharacter != null && correctMovie != null)
    {
        //na checken kunnen we lijsten aanmaken waar reeds op laats 3 het correcte is
        let movieList:string[]=["","",correctMovie.name];
        let characterList:string[]=["","",correctCharacter.name];
        //lus om karakters te vullen
        for(let i=0;i<2;i++)
        {
            let same:boolean=true;
            while(same)
            {
                let index:number= Math.ceil(Math.random()*charactersAll.length)-1;
                if (correctCharacter._id!=charactersAll[index]._id && characterList[i]!=charactersAll[index].name)
                {
                    same=false;
                    characterList[i]=charactersAll[index].name;
                }
            }
                    
        }  
        //lus om films te vullen
        for(let i=0;i<2;i++)
            {
                let same:boolean=true;
                while(same)
                {
                    let index:number= Math.ceil(Math.random()*moviesAll.length)-1;
                    if (correctMovie._id!=moviesAll[index]._id && movieList[i]!=moviesAll[index].name)
                    {
                        same=false;
                        movieList[i]=moviesAll[index].name;
                    }
                }
                        
            }  
    
        //aanmaak 2 nieuwe lijsten waar de volgorde random is
        let movieListMixed:string[]=["","",""];
        let indexMovie:number= Math.ceil(Math.random()*3)-1;
        for(let j=0;j<3;j++)
        {
            movieListMixed[j]=characterList[(j+indexMovie)%3];
        }
    
        let characterListMixed:string[]=["","",""];
        let indexchar:number= Math.ceil(Math.random()*3)-1;
        for(let j=0;j<3;j++)
        {
            characterListMixed[j]=characterList[(j+indexchar)%3];
        }
    
    // hier geven we dus alles mee wat nodig is per ronde, voor zowel 10 rounds als SD
    return [correctQuote.dialog,movieList,movieListMixed,characterList,characterListMixed];
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
        await deleteDBCollections();  // kan later weggelaten worden
        await loadCharactersAndMovies();
        await quotesToDB();
  
    

        process.on("SIGINT", exit);
    }
    catch (e)
    {
        console.log(e);
    }   
}

connect();