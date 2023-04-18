const express =require("express")
require("dotenv").config()
const mongoose=require("mongoose")
const  bodyParser = require('body-parser')
const port=3008;
const cors=require("cors")
const app=express()
console.log()
app.use(express.json())
app.use(cors())
const uri="mongodb+srv://iamsrinath5255:srinath5255@cluster0.vztzmdl.mongodb.net/?retryWrites=true&w=majority"
const {TextLoader} =require("langchain/document_loaders/fs/text")
const { RecursiveCharacterTextSplitter } =require("langchain/text_splitter")
const { PineconeClient} = require("@pinecone-database/pinecone")
const { OpenAIEmbeddings } =require("langchain/embeddings/openai")
const { PineconeStore } =require("langchain/vectorstores/pinecone")
const { OpenAI } =require("langchain/llms/openai")
const { VectorDBQAChain } =require("langchain/chains")

// mongodb connection

 async function connectDb(){
    try{
        await mongoose.connect(uri)
        console.log("db connected")
    }
    catch(error){
        console.log(error)
    }
}
connectDb()


 async function loadDocument(question){
  const loader = new TextLoader("./content.txt");
  const docs = await loader.load();
  const texts=docs[0].pageContent
  
  const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 10,
      chunkOverlap: 1,
      });
  
    const output = await splitter.createDocuments([texts]);
 
  
    const client = new PineconeClient();
    await client.init({
    apiKey:process.env.PINECONE_API_KEY,
    environment: "us-west4-gcp",
    });

    const pineconeIndex = client.Index("first");
    console.log("client creation done")
 


await PineconeStore.fromTexts( output, new OpenAIEmbeddings({openAIApiKey:process.env.OPENAI_API_KEY}),{pineconeIndex,});
console.log("after pineconestore creation")



//    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({openAIApiKey:"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"}),{pineconeIndex});
  
//     const model = new OpenAI({ openAIApiKey:process.env.OPENAI_API_KEY, temperature: 0.9 });   
//     const chain = VectorDBQAChain.fromLLM(model, vectorStore, {k: 1,returnSourceDocuments: true,});
//     const response = await chain.call({ query: question });

//     return response.text;
   
 }




    // app.post("/",async(req,res)=>{
    //     const {question}=req.body
    //     const finalAns=await loadDocument(question)
    //     res.status(200).json({answer:finalAns})
    // })
   
 
    loadDocument()
  





app.listen(port,()=>{console.log(`server is started at ${port}`)})