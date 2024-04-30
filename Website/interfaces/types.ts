export interface Quote
 {
    dialog:string,
    character:string,
    movie:string
 }

 export interface Movie
 {
   name:string,
   _id?:string
 }

 export interface Character
 {
   name:string,
   _id?:string
 }

 export interface User
 {
    name:string,
    id:string,
    score:Score
 }

 export interface Score
 {
    sd:number,
    tr:number
 }