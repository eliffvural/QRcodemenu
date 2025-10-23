// AI API Routes - Yapay zeka önerileri için endpoint'ler

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/suggest/:restaurantId - Restoran için menü önerisi al
router.post('/suggest/:restaurantId', aiController.getMenuSuggestion);

// POST /api/ai/analyze/:restaurantId - Restoran menüsünü analiz et
router.post('/analyze/:restaurantId', aiController.analyzeMenu);

// POST /api/ai/optimize/:restaurantId - Menü optimizasyonu önerisi
router.post('/optimize/:restaurantId', aiController.optimizeMenu);

// POST /api/ai/nutrition/:restaurantId - Beslenme analizi
router.post('/nutrition/:restaurantId', aiController.getNutritionAnalysis);

// POST /api/ai/pricing/:restaurantId - Fiyat optimizasyonu
router.post('/pricing/:restaurantId', aiController.getPricingSuggestion);

module.exports = router;
