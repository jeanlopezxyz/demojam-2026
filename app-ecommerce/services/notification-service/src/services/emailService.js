const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }
  
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT) || 50
      });
      
      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('SMTP connection failed:', error);
        } else {
          console.log('SMTP server is ready to take our messages');
        }
      });
      
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }
  
  async sendEmail(emailData) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'Your Store',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER
        },
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        attachments: emailData.attachments || []
      };
      
      // Add optional fields
      if (emailData.cc) mailOptions.cc = emailData.cc;
      if (emailData.bcc) mailOptions.bcc = emailData.bcc;
      if (emailData.replyTo) mailOptions.replyTo = emailData.replyTo;
      
      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
      
    } catch (error) {
      console.error('Email send error:', error);
      
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
  
  async sendBulkEmails(emailsData) {
    const results = [];
    const batchSize = parseInt(process.env.BATCH_SIZE) || 100;
    
    // Process emails in batches to avoid overwhelming the SMTP server
    for (let i = 0; i < emailsData.length; i += batchSize) {
      const batch = emailsData.slice(i, i + batchSize);
      const batchPromises = batch.map(emailData => this.sendEmail(emailData));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map(result => 
          result.status === 'fulfilled' ? result.value : { success: false, error: result.reason.message }
        ));
        
        // Add delay between batches to respect rate limits
        if (i + batchSize < emailsData.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error('Batch email error:', error);
        results.push(...batch.map(() => ({ success: false, error: error.message })));
      }
    }
    
    return results;
  }
  
  async testConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  generateUnsubscribeLink(userId, type = 'all') {
    // In a real implementation, this would generate a secure unsubscribe link
    const baseUrl = process.env.FRONTEND_URL || 'https://yourstore.com';
    return `${baseUrl}/unsubscribe?user=${userId}&type=${type}`;
  }
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  async getDeliveryStatus(messageId) {
    // This would typically integrate with your email provider's API
    // to get delivery status, opens, clicks, etc.
    console.log(`Getting delivery status for message: ${messageId}`);
    return {
      messageId,
      status: 'sent',
      timestamp: new Date()
    };
  }
}

module.exports = new EmailService();