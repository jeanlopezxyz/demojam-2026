const templateService = require('../services/templateService');
const Joi = require('joi');

const createTemplateSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid(
    'order_created',
    'order_confirmed',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'payment_confirmed',
    'payment_failed',
    'refund_processed',
    'low_stock_alert',
    'welcome_email',
    'password_reset',
    'email_verification',
    'promotional',
    'system_alert'
  ).required(),
  channel: Joi.string().valid('email', 'sms', 'push', 'in_app').required(),
  version: Joi.string().default('1.0'),
  subject: Joi.string().when('channel', { is: 'email', then: Joi.required() }),
  content: Joi.object({
    html: Joi.string().when('channel', { is: 'email', then: Joi.required() }),
    text: Joi.string().required(),
    variables: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      description: Joi.string(),
      required: Joi.boolean().default(false),
      defaultValue: Joi.string()
    }))
  }).required(),
  settings: Joi.object({
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
    retryCount: Joi.number().integer().min(0).max(10).default(3),
    delayBetweenRetries: Joi.number().integer().min(0).default(300)
  }),
  tags: Joi.array().items(Joi.string()),
  metadata: Joi.object()
});

const updateTemplateSchema = Joi.object({
  name: Joi.string(),
  version: Joi.string(),
  isActive: Joi.boolean(),
  subject: Joi.string(),
  content: Joi.object({
    html: Joi.string(),
    text: Joi.string(),
    variables: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      description: Joi.string(),
      required: Joi.boolean().default(false),
      defaultValue: Joi.string()
    }))
  }),
  settings: Joi.object({
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
    retryCount: Joi.number().integer().min(0).max(10),
    delayBetweenRetries: Joi.number().integer().min(0)
  }),
  tags: Joi.array().items(Joi.string()),
  metadata: Joi.object()
});

const testTemplateSchema = Joi.object({
  templateId: Joi.string().required(),
  testData: Joi.object().required()
});

class TemplateController {
  async createTemplate(req, res) {
    try {
      const { error, value } = createTemplateSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      // Validate template syntax
      const validation = await templateService.validateTemplate(value);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Template syntax error',
          details: validation.error
        });
      }
      
      const template = await templateService.createTemplate(value);
      
      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: template
      });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create template'
      });
    }
  }
  
  async updateTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const { error, value } = updateTemplateSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      // Validate template syntax if content is being updated
      if (value.content || value.subject) {
        const validation = await templateService.validateTemplate(value);
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            message: 'Template syntax error',
            details: validation.error
          });
        }
      }
      
      const template = await templateService.updateTemplate(templateId, value);
      
      res.json({
        success: true,
        message: 'Template updated successfully',
        data: template
      });
    } catch (error) {
      console.error('Update template error:', error);
      const statusCode = error.message === 'Template not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update template'
      });
    }
  }
  
  async getTemplate(req, res) {
    try {
      const { type, channel } = req.params;
      const { version } = req.query;
      
      const template = await templateService.getTemplate(type, channel, version);
      
      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Get template error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to retrieve template'
      });
    }
  }
  
  async listTemplates(req, res) {
    try {
      const { type, channel, tags } = req.query;
      
      const filters = {};
      if (type) filters.type = type;
      if (channel) filters.channel = channel;
      if (tags) filters.tags = tags.split(',');
      
      const templates = await templateService.listTemplates(filters);
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('List templates error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve templates'
      });
    }
  }
  
  async deleteTemplate(req, res) {
    try {
      const { templateId } = req.params;
      
      // Soft delete by setting isActive to false
      const template = await templateService.updateTemplate(templateId, { isActive: false });
      
      res.json({
        success: true,
        message: 'Template deleted successfully',
        data: template
      });
    } catch (error) {
      console.error('Delete template error:', error);
      const statusCode = error.message === 'Template not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete template'
      });
    }
  }
  
  async testTemplate(req, res) {
    try {
      const { error, value } = testTemplateSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const result = await templateService.testTemplate(value.templateId, value.testData);
      
      res.json({
        success: true,
        message: 'Template test completed',
        data: result
      });
    } catch (error) {
      console.error('Test template error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to test template'
      });
    }
  }
  
  async validateTemplate(req, res) {
    try {
      const templateData = req.body;
      
      const validation = await templateService.validateTemplate(templateData);
      
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Validate template error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to validate template'
      });
    }
  }
  
  async seedDefaultTemplates(req, res) {
    try {
      await templateService.seedDefaultTemplates();
      
      res.json({
        success: true,
        message: 'Default templates seeded successfully'
      });
    } catch (error) {
      console.error('Seed templates error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to seed default templates'
      });
    }
  }
}

module.exports = new TemplateController();