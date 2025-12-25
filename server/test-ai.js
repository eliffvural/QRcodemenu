const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
  try {
    console.log("🔑 API Key deneniyor:", process.env.GEMINI_API_KEY ? "Mevcut" : "YOK!");
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Burada 'gemini-pro' kullanıyoruz, en kararlı modeldir.
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = "Bana tek kelimeyle 'Merhaba' de.";
    console.log("🤖 İstek gönderiliyor...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ BAŞARILI! Cevap:", text);
  } catch (error) {
    console.error("❌ HATA OLUŞTU:");
    console.error(error);
  }
}

testGemini();