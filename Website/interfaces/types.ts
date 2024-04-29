import { ObjectId } from "mongodb";

export interface Quote
 {
    dialog:string,
    character:string,
    movie:string
 }

 export interface Movie
 {
   name:string,
   id:string,
   _id?:ObjectId
 }

 export interface Character
 {
   name:string,
   id:string,
   _id?:ObjectId
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