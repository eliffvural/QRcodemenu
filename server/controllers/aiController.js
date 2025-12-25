const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Key kontrolü
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ HATA: GEMINI_API_KEY .env dosyasında bulunamadı!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getChatResponse = async (req, res) => {
  try {
    const { message, menuContext } = req.body;

    console.log("📩 Frontend'den mesaj geldi:", message);

    // Menü verisi kontrolü
    if (!menuContext || menuContext.length === 0) {
        // Eğer menü boşsa hata vermek yerine genel cevap verelim
        console.warn("⚠️ Uyarı: Menü verisi boş geldi.");
    }

    // 1. ADIM: menuText değişkenini BURADA, fonksiyonun içinde oluşturuyoruz
    const menuText = menuContext ? menuContext.map(item => 
      `- ${item.name} (${item.price} TL): ${item.description || 'Açıklama yok'} [ID: ${item._id}]`
    ).join("\n") : "Menü bilgisi yok.";

    // 2. ADIM: Model Ayarları
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });    // 3. ADIM: Prompt'u BURADA, menuText oluştuktan SONRA tanımlıyoruz
    const prompt = `
      Sen Marithen Restoran'ın dijital garsonusun.
      Aşağıdaki menüyü kullanarak müşteriye cevap ver.
      Eğer müşteri bir ürün isterse cevabına {ADD:URUN_ID} ekle.
      
      MENÜ:
      ${menuText}

      MÜŞTERİ: "${message}"
      
      GARSON CEVABI:
    `;

    console.log("🤖 Gemini'ye soruluyor...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Gemini Cevap Verdi:", text);

    res.json({ reply: text });

  } catch (error) {
    console.error("❌ BEKLENMEYEN HATA:", error);
    res.status(500).json({ 
        reply: "Üzgünüm, şu an bağlantımda bir sorun var. 😔", 
        errorDetails: error.message 
    });
  }
};

module.exports = { getChatResponse };