import {MongoClient} from "mongodb";
import {Quote,Movie,Character,User,Score} from "./types"

//dummy data

export let quote:Quote[]= 
[
    {
        character:"2",
        movie:"6",
        dialog:"TestFrodoHobbitBattle"
    },
    {
        character:"1",
        movie:"3",
        dialog:"TestGandalfReturn"
    },
    {
        character:"3",
        movie:"1",
        dialog:"TestSmaugFellow"
    }
]


export let characters:Character[] = 
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
    }];



export let movies:Movie[] = 
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


export let difficulty:number[]=[1,2,3];

//quote.dialog = quote string
//quote.character = id string char
//quote.movie = id string movie

//movie.name = title string
//movie._id = id quote.movie

//character._id = id string char
//character.name = string character

// hier de correcte manier om de Quote[] op te vullen via database en filtering.

const uri = ""; // Fill in your MongoDB connection string here
const client = new MongoClient(uri);
const collection = client.db("").collection("");

//aanmaak arrays voor opgeslagen quotes
export let quotebl:Quote[]=[];
export let quotefav:Quote[]=[];

//aanmaak user[]
let users:User[]=[]


async function main() 
{
    try
    {
        await client.connect();
        await collection.deleteMany();
        let quotesdif1:Quote[] = await collection.find<Quote>({ $or: [{character:"1"},{character:"2"},{character:"3"}]}).toArray();
        /*
        hier maken we de array van quotes eventueel groter
        */
        let quotesdif2:Quote[] = [] 
        /*await client.db("").collection("character").find<Quote>({ &or character:"1", character:"2"},{character:"3"}/).toArray();*/
        let quotesdif3:Quote[] = []
        /*await client.db("").collection("character").find<Quote>({character:"id char"}).toArray();
        */
        let quotes:Quote[]=quotesdif1.concat(quotesdif2).concat(quotesdif3);
        let correct:Quote = quotes[Math.floor(Math.random()*quotes.length)];
        let i:number=1;
        let chars:string[]=[];
        let movies:string[]=[];
        let sameChar:boolean=true;
        let index:number=0;
        for(let i=0;i<2;i++)
        {
            while(sameChar)
            {
                index= Math.floor(Math.random()*difficulty[i]*10);
                if (correct.character!=characters[index])
                {
                    sameChar=false;
                }
        
            }
            chars.push(characters[index])
            let sameMovie:boolean=true;
            while(sameMovie)
            {
                index = Math.floor(Math.random()*difficulty[i]*10);
                if(correct.movie!=movies[index])
                    {
                        sameMovie=false;
                    }
            }
            movies.push(movies[index])
        }  

    }
    catch (e)
    {
        console.log(e);
    }   
    finally
    {
        await client.close();
    } 
}
main();


