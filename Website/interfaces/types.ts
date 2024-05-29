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
 }

 export interface Movie
 {
   name:string,
   _id:ObjectId
   
 }

 export interface Character
 {
   
   name:string,
   _id:ObjectId,
   wikiUrl:string

   
 }

 export interface User
 {
   
   name:string,
   password?:string,
   email:string,
   score10Rounds:number[],
   scoreSD:number[],
   favourite:Quote[],
   blacklist:BlacklistQuote[],
   quotesPerUser:Quote[]
    
 }
 
 export interface BlacklistQuote
 {
   quote:string,
   character:string,
   reason:string
 }

 export interface FlashMessage {
  type: "error" | "success"
  message: string;
  }