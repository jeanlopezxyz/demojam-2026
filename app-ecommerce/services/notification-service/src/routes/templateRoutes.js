const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

// Template CRUD operations
router.post('/', templateController.createTemplate);
router.get('/', templateController.listTemplates);
router.get('/:type/:channel', templateController.getTemplate);
router.put('/:templateId', templateController.updateTemplate);
router.delete('/:templateId', templateController.deleteTemplate);

// Template operations
router.post('/test', templateController.testTemplate);
router.post('/validate', templateController.validateTemplate);
router.post('/seed-defaults', templateController.seedDefaultTemplates);

module.exports = router;