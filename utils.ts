

//Convertir BookModels En book

import type { Collection } from "mongodb";
import {autor, autorModel, book, bookModel} from "./types.ts";

export const convertBookModelToBook = async (bookModel:bookModel,autores:Collection<autorModel>):Promise<book> =>{

    const authors = await autores.find({ _id: { $in: [bookModel._id]} }).toArray()
    const autoresConvertidos =  await authors.map((u)=>convertAutorModelToAutor(u))

    return{
        autores: autoresConvertidos,
        copias: bookModel.copias,
        id: bookModel._id.toString(),
        titulo: bookModel.titulo
    }
}

export const convertAutorModelToAutor = (autorModel:autorModel):autor =>{

    return{
        _id:autorModel._id.toString(),
        biografia:autorModel.biografia,
        nombre: autorModel.nombre

    }
}