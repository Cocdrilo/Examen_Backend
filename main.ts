import {autor, autorModel, book, bookModel} from "./types.ts";
import {MongoClient, ObjectId} from "npm:mongodb"
import {convertBookModelToBook} from "./utils.ts";

const url = Deno.env.get('MONGO_DB')

if(!url){
    console.error('Url inválida')
    Deno.exit(-1)
}

const client = new MongoClient(url)
await client.connect()

const db = await client.db('Library')

const bookCollection = db.collection<bookModel>('Libros')
const autorCollection = db.collection<autorModel>('Autores')


const handler = async (req:Request):Promise<Response> =>{
    const method = req.method
    const url = new URL(req.url)
    const path = url.pathname

    if(method === 'GET'){
        if (path === '/libros') {
            const titulo = url.searchParams.get('titulo')

            if (!titulo) {
                const bookModels = await bookCollection.find().toArray()
                const books = await Promise.all( bookModels.map( async (u)=>convertBookModelToBook(u,autorCollection)))

                return new Response(JSON.stringify(books),{status:200})
            }
            if (titulo) {
                const bookModels = await bookCollection.find({titulo:titulo}).toArray()
                const books = await Promise.all(bookModels.map(async (u)=>convertBookModelToBook(u,autorCollection)))
                console.log(books.length)
                if(books.length === 0){
                    return new Response('No se encontraron libros con este titulo',{status:404})
                }
                return new Response(JSON.stringify(books),{status:200})
            }
        }else if (path === '/libro'){
            const id = url.searchParams.get('id')
            console.log(id)
            if(id===null){
                return new Response('Bad Request')
            }
            const convertid = new ObjectId(id)
            const bookModels = await bookCollection.find({_id:convertid}).toArray()
            const books = await Promise.all(bookModels.map(async(u)=>convertBookModelToBook(u,autorCollection)))

            if(bookModels.length === 0){
                return new Response('No se encontraron libros con esta id',{status:404})
            }
            else{
                return new Response(JSON.stringify(books),{status:200})
            }


        }
    } else if(method === 'POST'){
        if(path === '/libro'){
            const libro = await req.json()
            if(!libro.titulo ||!libro.autores ||!libro.copias){
                return new Response('error: El título y los autores son campos requeridos',{status:400})
            }
            else{
                //Check Autores existen
                console.log(libro.autores)
                const comprobarAutores = libro.autores
                const checkAutores = await autorCollection.find({comprobarAutores}).toArray()
                console.log(checkAutores)
                if(libro.autores.length === 0){
                    const createdBook:bookModel = {
                      _id: new ObjectId,
                      titulo:libro.titulo,
                      copias: libro.copias,
                      autores: []
                    }

                    const añadir = await bookCollection.insertOne(createdBook)

                    return new Response('Libro Creado con Éxito',{status:201})
                }

                else if(checkAutores.length === 0){

                    return new Response('Autores no Existentes',{status:400})
                }
                else{
                    const autores = libro.autores
                    //Me falta convertir los autores para poder añadirselos bien

                    const createdBook:bookModel = {
                        _id: new ObjectId,
                        titulo:libro.titulo,
                        copias: libro.copias,
                        autores: autores
                    }

                    return new Response('Libro Creado con Éxito',{status:201})
                }
            }

        }else if(path === '/autor'){
            const autor = await req.json()
            if(!autor.nombre ||!autor.biografia ){
                return new Response('error: El nombre y la biografia son campos requeridos',{status:400})
            }
            else{
                const autorAñadir:autorModel = {
                  _id: new ObjectId,
                  nombre: autor.nombre,
                  biografia: autor.biografia
                }

                const añadir = autorCollection.insertOne(autorAñadir)

                return new Response('Usuario Creado con exito',{status:200})
            }
        }

    }if (method === 'DELETE'){
        if(path === '/libro'){
            const id = await req.json()
            if(id===null){
                return new Response('Bad Request',{status:400})
            }
            else{
                const convertid = new ObjectId(id)
                const bookModels = await bookCollection.find({_id:convertid}).toArray()
                const books = await Promise.all(bookModels.map(async(u)=>convertBookModelToBook(u,autorCollection)))

                if(bookModels.length === 0){
                    return new Response('No se encontraron libros con esta id',{status:404})
                }
                else{
                    const deleteBook = bookCollection.deleteOne(books.at(0))
                    return new Response('Libro borrado con exito',{status:200})
                }
            }
        }
    }

    return new Response('Endpoint Not Found',{status:401})
}


Deno.serve({port:8080},handler)