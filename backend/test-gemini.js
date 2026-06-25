import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY
});

async function test() {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "hi" }]
        });
        console.log(response.choices[0].message);
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
