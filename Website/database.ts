import {Collection, MongoClient} from "mongodb";
import {Quote,Movie,Character} from "./interfaces/types";


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
        id: "1"
    },
    {
        name:"Frodo",
        id:"2"
    },
    {
        name:"Smaug",
        id:"3"
    }
];



let moviesAll:Movie[] = 
[
    {
        name: "LOTR - The fellowship of the Ring",
        id:"1"
    },
    {
        name: "LOTR - The Towers",
        id:"2"
    },
    {
        name: "LOTR - The return of the King",
        id:"3"
    },
    {
        name: "The Hobbit - an unexpected Journey",
        id:"4"
    },
    {
        name: "The Hobbit - The desolation of Smaug",
        id:"5"
    },
    {
        name: "The Hobbit - The battle of the five Armies",
        id:"6"
    }
];


// hier de correcte manier om de Quote[] op te vullen via database.

export const client = new MongoClient("mongodb+srv://s004935:APHS2023@webo1.sjzote7.mongodb.net/");
export const collectionQuotes:Collection<Quote> = client.db("LOTR").collection("quotes");
export const collectionFiltQuotes:Collection<Quote> = client.db("LOTR").collection("quotesFiltered");
export const collectionMovies:Collection<Movie> = client.db("LOTR").collection("movies");
export const collectionCharacters:Collection<Character> = client.db("LOTR").collection("characters");

// hier maken we verbinding met de DB

async function deleteDBCollQuotes()
{
    await collectionQuotes.deleteMany();

}

//hier checken we of er al iets in de database zit, zoniet vullen we deze op
async function loadQuotesFromApi() {
    const quotes:Quote[] = await collectionQuotes.find({}).toArray();
    if (quotes.length == 0) {
        console.log("DB leeg. DB vullen via API")
        // const responseQuotes = await fetch("https://jsonplaceholder.typicode.com/users");  aanpassen
        const quotes:Quote[] = quotesAll; // hier ook aanpassen als api werkt
        await collectionQuotes.insertMany(quotes);
        // const responseMovies = await fetch("https://jsonplaceholder.typicode.com/users");
        const movies:Movie[] = moviesAll;
        await collectionMovies.deleteMany();
        await collectionMovies.insertMany(movies);
        // const responseChars = await fetch("https://jsonplaceholder.typicode.com/users");
        const characters:Character[] = charactersAll;
        await collectionCharacters.deleteMany();
        await collectionCharacters.insertMany(characters);

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
                    if (correctQuote.character!=charactersAll[index].id && quizList[i][0]!=charactersAll[index].name)
                        {
                            same=false;
                            quizList[i][j]=charactersAll[index].name;
                        }
                }
                else 
                {
                    if(correctQuote.movie!=moviesAll[index].id && moviesAll[index].name!=quizList[j][0])
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
        if (movie.id == correctQuote.movie)
        {
            quizList[1][2]=(movie.name);
        }
    }
    for(let char of charactersAll)
    {
        if (char.id == correctQuote.character)
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

