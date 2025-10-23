# CSV Dosyası Formatı

Bu klasör, besin verilerini içeren CSV dosyasını barındırır.

## Dosya Adı
`food_data.csv`

## CSV Sütun Formatı
Aşağıdaki sütunlardan en az birini içermelidir:

### Besin Değerleri (Zorunlu)
- `food_item` veya `Food Item` veya `name` - Yiyecek adı
- `calories` veya `Calories` veya `cal` - Kalori (100g başına)
- `protein` veya `Protein` veya `protein_g` - Protein (gram)
- `fat` veya `Fat` veya `fat_g` - Yağ (gram)
- `carbs` veya `Carbs` veya `carbohydrates` veya `carbohydrate_g` - Karbonhidrat (gram)

### Ek Besin Değerleri (Opsiyonel)
- `fiber` veya `Fiber` veya `fiber_g` - Lif (gram)
- `sugar` veya `Sugar` veya `sugar_g` - Şeker (gram)
- `sodium` veya `Sodium` veya `sodium_mg` - Sodyum (mg)
- `serving_size` veya `Serving Size` veya `serving` - Porsiyon boyutu

## Örnek CSV Formatı
```csv
food_item,calories,protein,fat,carbs,fiber,sugar,sodium,serving_size
Chicken Breast,165,31,3.6,0,0,0,74,100g
Brown Rice,111,2.6,0.9,23,1.8,0.4,5,100g
Broccoli,34,2.8,0.4,7,2.6,1.5,33,100g
```

## Kullanım
```bash
# Seed script'ini çalıştır
node seedNutrients.js
```

## Notlar
- Script, farklı sütun adlarını otomatik olarak eşleştirir
- Geçersiz veya boş veriler atlanır
- Mevcut NutrientData koleksiyonu temizlenir ve yeniden doldurulur
