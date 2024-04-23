import {MongoClient} from "mongodb";
import {Quote,Movie,Character} from "./types"

//dummy data

export let quote:Quote= 
{
    character:"Frodo",
    movie:"LOTR - The fellowship of the Ring",
    dialog:""

}

export let characters:string[] = ["Gandalf","Frodo","Bilbo","Smaug"];


export let movies:string[] = ["LOTR - The fellowship of the Ring","LOTR - The Towers","LOTR - The return of the King","The Hobbit - an unexpected Journey","The Hobbit - The desolation of Smaug","The Hobbit - The battle of the five Armies"];


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


async function main() 
{
    try
    {
        await client.connect();
        await client.db("  ").collection("").deleteMany();
        let quotes:Quote[] = await client.db("").collection("character").find<Quote>({character:"id char"},/*hier alle characters die we willen hebben*/).toArray();
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


