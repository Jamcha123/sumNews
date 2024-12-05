import express from 'express'; 
import fs from 'fs'; 
import cors from 'cors'; 
import http from 'http'; 
import axios from 'axios'; 
import * as cheerio from 'cheerio'; 
import openai from 'openai'; 

const app = express(); 
app.use(cors({origin: true, credentials: true, methods: "GET"})); 
app.use(express.static("public")); 

const serve = (e) => {
    app.get("/", (req, res) => {
        res.writeHead(200, {'content-type': "text/html"}); 
        res.write(e)
        res.end()
    })
    app.listen(8080, () => console.log("http://127.0.0.1:8080"))
}

const ai = new openai({apiKey: "<secret-key>"})

const items1 = async (e) => {
    const response = await ai.chat.completions.create({
        model: "gpt-4o", 
        messages: [{
            role: "user", 
            content: "explain this news title, " + e
        }]
    })
    return response.choices[0].message["content"]; 
}

const items2 = (web_url) => {
    axios.get(web_url, {
        url: web_url, 
        method: "get", 
        responseType: "document"
    }).then((value) => {
        const $ = cheerio.load(value["data"]); 
        const text = $("h2:first").text()

        const summary = items1(text); 
        summary.then((data) => {
            serve(data)
        })
    })
}
items2("https://ground.news")