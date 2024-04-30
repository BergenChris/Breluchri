import {Collection, MongoClient,ObjectId} from "mongodb";
import {Quote,Movie,Character,RootObjectCharacter,RootObjectMovie,RootObjectQuote} from "./interfaces/types";
import dotenv from "dotenv";
dotenv.config();





// hier maken we verbinding met de DB
export const client = new MongoClient(process.env.MONGO_URI ?? "localhost://27017");
export const collectionQuotes:Collection<Quote> = client.db("LOTR").collection("quotes");
export const collectionFiltQuotes:Collection<Quote> = client.db("LOTR").collection("quotesFiltered");
export const collectionMovies:Collection<Movie> = client.db("LOTR").collection("movies");
export const collectionCharacters:Collection<Character> = client.db("LOTR").collection("characters");

// hier maken we arrays aan
let moviesAll:Movie[]=[];
let charactersAll:Character[]=[];
let quotesAll:Quote[]=[];


async function deleteDBCollQuotes()
{
    await collectionQuotes.deleteMany();

}

//hier checken we of er al iets in de database zit, zoniet vullen we deze op met een array van objecten die erin horen
const apiKey = '2bV52o3FGbuxH6876ax5';
async function loadQuotesFromApi() {
    const quotes = await collectionQuotes.find({}).toArray();
    if (quotes.length == 0) 
    {
        console.log("DB leeg. DB vullen via API")
        const responseQuotes = await fetch("https://the-one-api.dev/v2/quote", {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const dataQuotes:RootObjectQuote = await responseQuotes.json();
        await collectionQuotes.deleteMany();
        let quotes:Quote[]=[];
        await dataQuotes.docs.forEach(e=>quotes.push(e));
        await collectionQuotes.insertMany(quotes);
        const responseMovies = await fetch("https://the-one-api.dev/v2/movie", {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const dataMovies:RootObjectMovie = await responseMovies.json();
        await collectionMovies.deleteMany();
        let movies:Movie[]=[];
        await dataMovies.docs.forEach(e=>movies.push(e));
        await collectionMovies.insertMany(movies);
        const responseChars = await fetch("https://the-one-api.dev/v2/character", {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const dataChars:RootObjectCharacter=await responseChars.json();
        let chars:Character[]=[];
        await collectionCharacters.deleteMany();
        await dataChars.docs.forEach(e => {chars.push(e)});
        await collectionCharacters.insertMany(chars);

    }
    return quotes
}

async function filterQuotes()
{
    await loadQuotesFromApi();
    quotesAll = await collectionQuotes.find<Quote>({ $and: 
    [{$or:
       [
        // character id zodat enkel deze in de array komen
        {character:"5cd99d4bde30eff6ebccfc15"},
        {character:"5cd99d4bde30eff6ebccfea0"},
        {character:"5cdbdecb6dc0baeae48cfa42"}
       ]},
    {$or:
      [        
        // movies id zodat enkel deze in de array komen
        {movie:"5cd95395de30eff6ebccde5c"},
        {movie:"5cd95395de30eff6ebccde5d"},
        {movie:"5cd95395de30eff6ebccde5a"},
        {movie:"5cd95395de30eff6ebccde5b"},
        {movie:"5cd95395de30eff6ebccde5a"},
        {movie:"5cd95395de30eff6ebccde59"}
      ]}
    ]}).toArray();
    await collectionFiltQuotes.deleteMany();
    await collectionFiltQuotes.insertMany(quotesAll);
    return quotesAll;

}


export async function getQuote()
{
    await filterQuotes();
    let quotes:Quote[] = await collectionFiltQuotes.find().toArray();
    let correct:Quote= quotes[Math.ceil(Math.random()*quotes.length)-1];  
    return correct;
}


export async function makeLists()
{
    let correctQuote:Quote = await getQuote();
    console.log(correctQuote.dialog);
    // maak array van movies zonder de series
    moviesAll = await collectionMovies.find({ $or:
    [
        {name:"The Unexpected Journey"},
        {name:"The Desolation of Smaug"},
        {name:"The Battle of the Five Armies"},
        {name:"The Two Towers"},
        {name:"The Fellowship of the Ring"},
        {name:"The Return of the King"}
        
    ]}).toArray();
    console.log(moviesAll);
    charactersAll = await collectionCharacters.find({$or:
    [
        {_id:"5cd99d4bde30eff6ebccfc15"},
        {_id:"5cd99d4bde30eff6ebccfea0"},
        {_id:"5cdbdecb6dc0baeae48cfa42"}
    ]}).toArray();
    console.log(charactersAll);
    let quizList:string[][]=[["","","",""],["","",""]];       
    for(let i=0;i<2;i++)
    {
        for(let j=0;j<2;j++)
        {
            let same:boolean=true;
            while(same)
            {
                let index:number= Math.ceil(Math.random()*3)-1;
                if (i==0)
                {
                    if (correctQuote.character!=charactersAll[index]._id && quizList[i][0]!=charactersAll[index].name)
                        {
                            same=false;
                            quizList[i][j]=charactersAll[index].name;
                        }
                }
                else 
                {
                    if(correctQuote.movie!=moviesAll[index]._id && moviesAll[index].name!=quizList[j][0])
                        {
                            same=false;
                            quizList[i][j]=moviesAll[index].name;
                        }
                }
            }
            

        }     
    }

    
    for(let movie of moviesAll)
    {
        if (movie._id == correctQuote.movie)
        {
            quizList[1][2]=(movie.name);
        }
    }
    for(let char of charactersAll)
    {
        if (char._id == correctQuote.character)
        {
            quizList[0][2]=(char.name);
        }
    }
    let list:string[][]=[["","",""],["","",""]];
    
    for(let i=0;i<2;i++)
    {
        let index:number= Math.ceil(Math.random()*3)-1;
        for(let j=0;j<3;j++)
        {
            list[i][j]=quizList[i][(j+index)%3];
        }
    }
    quizList[0][3]=correctQuote.dialog;
    
    return [list,quizList];
    
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
        await deleteDBCollQuotes();
        process.on("SIGINT", exit);
    }
    catch (e)
    {
        console.log(e);
    }   
}

connect();