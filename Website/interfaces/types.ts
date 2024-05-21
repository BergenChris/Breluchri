import { ObjectId } from "mongodb"

export interface RootObjectQuote
{
   docs:Quote[]
}
export interface RootObjectMovie
{
   docs:Movie[]
}
export interface RootObjectCharacter
{
   docs:Character[]
}



export interface Quote
 {
    dialog:string,
    character:string,
    movie:string
 }

 export interface Movie
 {
   name:string,
   _id:string
   
 }

 export interface Character
 {
   
   name:string,
   _id:string,
   wikiUrl:string

   
 }

 export interface User
 {
    name:string,
    password:string,
    _id:ObjectId,
    score:Score,
    favourite:Quote[],
    blacklist:Quote[],
 }

 export interface Score
 {
   _id:ObjectId, 
   sd:number,
   tr:number,
 }