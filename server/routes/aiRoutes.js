const express = require('express');
const router = express.Router();
// Controller dosyasını çağırıyoruz
const aiController = require('../controllers/aiController');

// Frontend '/api/ai/chat' adresine POST attığında bu çalışacak
router.post('/chat', aiController.getChatResponse);

module.exports = router;