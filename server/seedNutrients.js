// Seed script for NutrientData - CSV verilerini MongoDB'ye yükler
// Kullanım: node seedNutrients.js

const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const dotenv = require('dotenv');

// Environment variables yükle
dotenv.config();

// NutrientData modelini import et
const NutrientData = require('./models/NutrientData');

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      dbName: process.env.MONGO_DB || undefined 
    });
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    process.exit(1);
  }
};

// CSV verilerini oku ve NutrientData'ya kaydet
const seedNutrientData = async () => {
  try {
    console.log('🔄 NutrientData koleksiyonu temizleniyor...');
    await NutrientData.deleteMany({});
    console.log('✅ NutrientData koleksiyonu temizlendi');

    const csvFilePath = path.join(__dirname, 'data', 'food_data.csv');
    
    // CSV dosyasının varlığını kontrol et
    if (!fs.existsSync(csvFilePath)) {
      console.error(`❌ CSV dosyası bulunamadı: ${csvFilePath}`);
      console.log('💡 Lütfen ./data/food_data.csv dosyasının var olduğundan emin olun');
      process.exit(1);
    }

    console.log('📖 CSV dosyası okunuyor...');
    
    const nutrientDataArray = [];
    let rowCount = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          
          // CSV sütunlarını NutrientData modeli alanlarıyla eşleştir
          const nutrientData = {
            food_item: row.food_item || row['Food Item'] || row.name || '',
            calories: parseFloat(row.calories || row.Calories || row.cal || 0),
            protein: parseFloat(row.protein || row.Protein || row.protein_g || 0),
            fat: parseFloat(row.fat || row.Fat || row.fat_g || 0),
            carbs: parseFloat(row.carbs || row.Carbs || row.carbohydrates || row.carbohydrate_g || 0),
            fiber: parseFloat(row.fiber || row.Fiber || row.fiber_g || 0),
            sugar: parseFloat(row.sugar || row.Sugar || row.sugar_g || 0),
            sodium: parseFloat(row.sodium || row.Sodium || row.sodium_mg || 0),
            serving_size: row.serving_size || row['Serving Size'] || row.serving || '100g'
          };

          // Geçerli veri kontrolü
          if (nutrientData.food_item && nutrientData.food_item.trim() !== '') {
            nutrientDataArray.push(nutrientData);
          }

          // Her 1000 satırda bir ilerleme göster
          if (rowCount % 1000 === 0) {
            console.log(`📊 ${rowCount} satır işlendi...`);
          }
        })
        .on('end', async () => {
          try {
            console.log(`📊 Toplam ${rowCount} satır okundu, ${nutrientDataArray.length} geçerli kayıt bulundu`);
            
            if (nutrientDataArray.length === 0) {
              console.log('⚠️  Kaydedilecek veri bulunamadı');
              resolve();
              return;
            }

            console.log('💾 Veriler MongoDB\'ye kaydediliyor...');
            
            // Toplu ekleme işlemi
            const result = await NutrientData.insertMany(nutrientDataArray, { 
              ordered: false // Hatalı kayıtları atla
            });
            
            console.log(`✅ ${result.length} kayıt başarıyla eklendi`);
            console.log('🎉 Seed işlemi tamamlandı!');
            
            resolve();
          } catch (error) {
            console.error('❌ Veri kaydetme hatası:', error.message);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('❌ CSV okuma hatası:', error.message);
          reject(error);
        });
    });

  } catch (error) {
    console.error('❌ Seed işlemi hatası:', error.message);
    throw error;
  }
};

// Ana fonksiyon
const main = async () => {
  try {
    console.log('🚀 NutrientData seed işlemi başlatılıyor...');
    
    await connectDB();
    await seedNutrientData();
    
    console.log('✅ Seed işlemi başarıyla tamamlandı');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seed işlemi başarısız:', error.message);
    process.exit(1);
  }
};

// Script çalıştırıldığında ana fonksiyonu çağır
if (require.main === module) {
  main();
}

module.exports = { seedNutrientData, connectDB };
