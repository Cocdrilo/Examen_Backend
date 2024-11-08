import {ObjectId} from "npm:mongodb"

export type bookModel = {
    _id:ObjectId
    titulo:string
    copias:number
    autores:ObjectId[]
}

export type book ={
    id:string
    titulo:string
    copias:number
    autores:autor[]
}

export type autorModel = {
    _id:ObjectId
    nombre:string
    biografia:string
}

export type autor = {
    _id:string
    nombre:string
    biografia:string
}
