const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function checkAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ API Key bulunamadı! .env dosyasını kontrol et.");
    return;
  }

  console.log("🔍 Google'dan model listesi çekiliyor...");

  try {
    // Kütüphane yerine direkt Google sunucusuna soruyoruz (en garanti yöntem)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Google Hata Verdi:", data.error.message);
      return;
    }

    console.log("\n✅ SENİN API ANAHTARININ İZİN VERDİĞİ MODELLER:");
    console.log("------------------------------------------------");
    
    // Sadece sohbet (generateContent) özelliği olanları filtreleyelim
    const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    if (chatModels.length === 0) {
      console.log("⚠️ Hiçbir sohbet modeli bulunamadı. API Key'in yetkisi kısıtlı olabilir.");
    } else {
      chatModels.forEach(model => {
        // model.name genellikle 'models/gemini-pro' şeklinde gelir
        // biz sadece sondaki ismi alacağız
        console.log(`🔹 ${model.name.replace('models/', '')}`);
      });
      console.log("------------------------------------------------");
      console.log("👉 Yukarıdaki mavi isimlerden birini koduna yazarsan %100 çalışır.");
    }

  } catch (error) {
    console.error("❌ Bağlantı Hatası:", error);
  }
}

checkAvailableModels();