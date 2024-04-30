import {Collection, MongoClient} from "mongodb";
import {Quote,Movie,Character,RootObjectCharacter,RootObjectMovie,RootObjectQuote} from "./interfaces/types";
import dotenv from "dotenv";
dotenv.config();


//dummy data

let quotesAll:Quote[]= 
[
    {
        character:"2",
        movie:"6",
        dialog:"Frodo H Battle"
    },
    {
        character:"1",
        movie:"3",
        dialog:"Gandalf LOTR Returns"
    },
    {
        character:"3",
        movie:"1",
        dialog:"Smaug LOTR Fellow"
    }
]


let charactersAll:Character[] = 
[
    {
        name:"Gandalf",
        _id: "1"
    },
    {
        name:"Frodo",
        _id:"2"
    },
    {
        name:"Smaug",
        _id:"3"
    }
];



let moviesAll:Movie[] = 
[
    {
        name: "LOTR - The fellowship of the Ring",
        _id:"1"
    },
    {
        name: "LOTR - The Towers",
        _id:"2"
    },
    {
        name: "LOTR - The return of the King",
        _id:"3"
    },
    {
        name: "The Hobbit - an unexpected Journey",
        _id:"4"
    },
    {
        name: "The Hobbit - The desolation of Smaug",
        _id:"5"
    },
    {
        name: "The Hobbit - The battle of the five Armies",
        _id:"6"
    }
];


// hier de correcte manier om de Quote[] op te vullen via database.

export const client = new MongoClient(process.env.MONGO_URI ?? "localhost://27017");
export const collectionQuotes:Collection<RootObjectQuote[]> = client.db("LOTR").collection("quotes");
export const collectionFiltQuotes:Collection<Quote> = client.db("LOTR").collection("quotesFiltered");
export const collectionMovies:Collection<RootObjectMovie[]> = client.db("LOTR").collection("movies");
export const collectionCharacters:Collection<RootObjectCharacter[]> = client.db("LOTR").collection("characters");

// hier maken we verbinding met de DB

async function deleteDBCollQuotes()
{
    await collectionQuotes.deleteMany();

}

//hier checken we of er al iets in de database zit, zoniet vullen we deze op
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
        const dataQuotes:RootObjectQuote[] = await responseQuotes.json();
        //const dataMovies:Quote[] = moviesAll; // hier ook aanpassen als api werkt

        await collectionQuotes.deleteMany();
        await collectionQuotes.insertOne(dataQuotes);
        const responseMovies = await fetch("https://the-one-api.dev/v2/movie", {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const dataMovies:RootObjectMovie[] = await responseMovies.json();
        //const dataMovies:Quote[] = moviesAll; // hier ook aanpassen als api werkt

        await collectionMovies.deleteMany();
        await collectionMovies.insertOne(dataMovies);
        const responseChars = await fetch("https://the-one-api.dev/v2/character", {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const dataChars:RootObjectCharacter[]=await responseChars.json();
        //const characters:Character[] = charactersAll;
        await collectionCharacters.deleteMany();
        await collectionCharacters.insertOne(dataChars);

    }
    return quotes
}

async function filterQuotes()
{
    await loadQuotesFromApi();
    let filteredQuotes:Quote[]= await collectionQuotes.find<Quote>({ $or: [{character:"1"},{character:"2"},{character:"3"}]}).toArray();
    await collectionFiltQuotes.deleteMany();
    await collectionFiltQuotes.insertMany(filteredQuotes);
    return filteredQuotes;

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





export async function LoadNewQuestion() 
{


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
        await makeLists();
        process.on("SIGINT", exit);
    }
    catch (e)
    {
        console.log(e);
    }   
}

connect();