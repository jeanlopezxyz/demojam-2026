const handlebars = require('handlebars');
const NotificationTemplate = require('../models/NotificationTemplate');

class TemplateService {
  constructor() {
    this.registerHelpers();
  }
  
  registerHelpers() {
    // Register Handlebars helpers for common operations
    handlebars.registerHelper('formatCurrency', function(amount, currency = 'USD') {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      });
      return formatter.format(amount);
    });
    
    handlebars.registerHelper('formatDate', function(date, format = 'long') {
      const options = {
        long: { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        },
        short: { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        },
        dateOnly: { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }
      };
      
      return new Date(date).toLocaleDateString('en-US', options[format] || options.long);
    });
    
    handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });
    
    handlebars.registerHelper('gt', function(a, b) {
      return a > b;
    });
    
    handlebars.registerHelper('lt', function(a, b) {
      return a < b;
    });
    
    handlebars.registerHelper('uppercase', function(text) {
      return text.toUpperCase();
    });
    
    handlebars.registerHelper('capitalize', function(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    });
  }
  
  async renderTemplate(template, data) {
    try {
      const compiledSubject = template.subject ? handlebars.compile(template.subject) : null;
      const compiledHtml = template.content.html ? handlebars.compile(template.content.html) : null;
      const compiledText = handlebars.compile(template.content.text);
      
      // Add default data
      const templateData = {
        ...data,
        currentYear: new Date().getFullYear(),
        companyName: process.env.COMPANY_NAME || 'Your Store',
        supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL,
        websiteUrl: process.env.WEBSITE_URL || 'https://yourstore.com',
        unsubscribeUrl: this.generateUnsubscribeUrl(data.userId, template.type)
      };
      
      return {
        subject: compiledSubject ? compiledSubject(templateData) : '',
        html: compiledHtml ? compiledHtml(templateData) : '',
        text: compiledText(templateData)
      };
      
    } catch (error) {
      console.error('Template rendering error:', error);
      throw new Error(`Failed to render template: ${error.message}`);
    }
  }
  
  async createTemplate(templateData) {
    try {
      // Validate template syntax
      await this.validateTemplate(templateData);
      
      const template = new NotificationTemplate(templateData);
      await template.save();
      
      return template;
      
    } catch (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }
  
  async updateTemplate(templateId, updateData) {
    try {
      // Validate template syntax if content is being updated
      if (updateData.content || updateData.subject) {
        await this.validateTemplate(updateData);
      }
      
      const template = await NotificationTemplate.findByIdAndUpdate(
        templateId,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      return template;
      
    } catch (error) {
      throw new Error(`Failed to update template: ${error.message}`);
    }
  }
  
  async getTemplate(type, channel, version = null) {
    try {
      const query = { type, channel, isActive: true };
      if (version) {
        query.version = version;
      }
      
      const template = await NotificationTemplate.findOne(query)
        .sort({ version: -1 }); // Get latest version if no specific version requested
      
      if (!template) {
        throw new Error(`Template not found for ${type}/${channel}`);
      }
      
      return template;
      
    } catch (error) {
      throw new Error(`Failed to get template: ${error.message}`);
    }
  }
  
  async listTemplates(filters = {}) {
    try {
      const query = { isActive: true };
      
      if (filters.type) query.type = filters.type;
      if (filters.channel) query.channel = filters.channel;
      if (filters.tags) query.tags = { $in: filters.tags };
      
      const templates = await NotificationTemplate.find(query)
        .sort({ type: 1, channel: 1, version: -1 });
      
      return templates;
      
    } catch (error) {
      throw new Error(`Failed to list templates: ${error.message}`);
    }
  }
  
  async validateTemplate(templateData) {
    try {
      // Validate Handlebars syntax
      if (templateData.subject) {
        handlebars.compile(templateData.subject);
      }
      
      if (templateData.content) {
        if (templateData.content.html) {
          handlebars.compile(templateData.content.html);
        }
        
        if (templateData.content.text) {
          handlebars.compile(templateData.content.text);
        }
      }
      
      return { valid: true };
      
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
  
  async testTemplate(templateId, testData) {
    try {
      const template = await NotificationTemplate.findById(templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      const rendered = await this.renderTemplate(template, testData);
      
      return {
        template: {
          name: template.name,
          type: template.type,
          channel: template.channel
        },
        rendered,
        testData
      };
      
    } catch (error) {
      throw new Error(`Template test failed: ${error.message}`);
    }
  }
  
  generateUnsubscribeUrl(userId, type) {
    const baseUrl = process.env.FRONTEND_URL || 'https://yourstore.com';
    return `${baseUrl}/unsubscribe?user=${userId}&type=${type}`;
  }
  
  async seedDefaultTemplates() {
    const defaultTemplates = [
      {
        name: 'order-confirmation',
        type: 'order_created',
        channel: 'email',
        subject: 'Order Confirmation - Order #{{orderNumber}}',
        content: {
          html: `
            <h1>Thank you for your order!</h1>
            <p>Hi {{customerName}},</p>
            <p>We've received your order and are preparing it for shipment.</p>
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> {{orderNumber}}</p>
            <p><strong>Total:</strong> {{formatCurrency totalAmount currency}}</p>
            <p><strong>Estimated Delivery:</strong> {{formatDate estimatedDeliveryDate}}</p>
            <p>We'll send you another email when your order ships.</p>
          `,
          text: `Thank you for your order! Order #{{orderNumber}} - Total: {{formatCurrency totalAmount currency}}`
        }
      },
      {
        name: 'order-shipped',
        type: 'order_shipped',
        channel: 'email',
        subject: 'Your order has shipped! - Order #{{orderNumber}}',
        content: {
          html: `
            <h1>Your order is on its way!</h1>
            <p>Hi {{customerName}},</p>
            <p>Great news! Your order #{{orderNumber}} has shipped.</p>
            {{#if trackingNumber}}
            <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
            {{/if}}
            <p><strong>Estimated Delivery:</strong> {{formatDate estimatedDeliveryDate}}</p>
          `,
          text: `Your order #{{orderNumber}} has shipped! {{#if trackingNumber}}Tracking: {{trackingNumber}}{{/if}}`
        }
      },
      {
        name: 'payment-confirmed',
        type: 'payment_confirmed',
        channel: 'email',
        subject: 'Payment Confirmed - {{formatCurrency amount currency}}',
        content: {
          html: `
            <h1>Payment Confirmed</h1>
            <p>Hi {{customerName}},</p>
            <p>We've successfully processed your payment of {{formatCurrency amount currency}}.</p>
            <p><strong>Transaction ID:</strong> {{transactionId}}</p>
            <p>Thank you for your business!</p>
          `,
          text: `Payment of {{formatCurrency amount currency}} confirmed. Transaction ID: {{transactionId}}`
        }
      }
    ];
    
    for (const templateData of defaultTemplates) {
      try {
        const existingTemplate = await NotificationTemplate.findOne({
          name: templateData.name,
          channel: templateData.channel
        });
        
        if (!existingTemplate) {
          await this.createTemplate(templateData);
          console.log(`Created default template: ${templateData.name}`);
        }
      } catch (error) {
        console.error(`Failed to create default template ${templateData.name}:`, error);
      }
    }
  }
}

module.exports = new TemplateService();