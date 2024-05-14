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
    movie:string,
    reasonBL?:string
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
   email:string,
   score10Rounds:number[],
   scoreSD:number[],
   favourite:Quote[],
   blacklist:BlacklistQuote[]
    
 }
 export interface BlacklistQuote
 {
   quote:Quote,
   reason:string
 }