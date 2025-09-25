const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.initializeClient();
  }
  
  initializeClient() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log('Twilio client initialized successfully');
      } else {
        console.warn('Twilio credentials not provided - SMS service disabled');
      }
    } catch (error) {
      console.error('Failed to initialize Twilio client:', error);
    }
  }
  
  async sendSMS(smsData) {
    try {
      if (!this.client) {
        throw new Error('SMS service not initialized');
      }
      
      if (!this.phoneNumber) {
        throw new Error('Twilio phone number not configured');
      }
      
      // Validate phone number format
      if (!this.validatePhoneNumber(smsData.to)) {
        throw new Error('Invalid phone number format');
      }
      
      // Ensure phone number includes country code
      const formattedPhone = this.formatPhoneNumber(smsData.to);
      
      const message = await this.client.messages.create({
        body: smsData.body,
        from: this.phoneNumber,
        to: formattedPhone,
        // Optional: add media URLs for MMS
        mediaUrl: smsData.mediaUrl || undefined
      });
      
      return {
        success: true,
        messageId: message.sid,
        status: message.status,
        to: message.to,
        from: message.from
      };
      
    } catch (error) {
      console.error('SMS send error:', error);
      
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
  
  async sendBulkSMS(smsDataArray) {
    const results = [];
    const rateLimit = parseInt(process.env.SMS_RATE_LIMIT) || 10;
    
    // Process SMS in batches to respect rate limits
    for (let i = 0; i < smsDataArray.length; i += rateLimit) {
      const batch = smsDataArray.slice(i, i + rateLimit);
      const batchPromises = batch.map(smsData => this.sendSMS(smsData));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map(result => 
          result.status === 'fulfilled' ? result.value : { success: false, error: result.reason.message }
        ));
        
        // Add delay between batches to respect rate limits
        if (i + rateLimit < smsDataArray.length) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
        
      } catch (error) {
        console.error('Batch SMS error:', error);
        results.push(...batch.map(() => ({ success: false, error: error.message })));
      }
    }
    
    return results;
  }
  
  async getMessageStatus(messageId) {
    try {
      if (!this.client) {
        throw new Error('SMS service not initialized');
      }
      
      const message = await this.client.messages(messageId).fetch();
      
      return {
        messageId: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        price: message.price,
        priceUnit: message.priceUnit,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
      
    } catch (error) {
      console.error('Get message status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  validatePhoneNumber(phoneNumber) {
    // Basic phone number validation
    // Should start with + and contain only digits and spaces/dashes
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanNumber);
  }
  
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters except the leading +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If it doesn't start with +, assume it's a US number and add +1
    if (!cleaned.startsWith('+')) {
      // If it's 10 digits, assume US number
      if (cleaned.length === 10) {
        cleaned = '+1' + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = '+' + cleaned;
      } else {
        // For other cases, you might want to handle based on your business logic
        cleaned = '+' + cleaned;
      }
    }
    
    return cleaned;
  }
  
  async testConnection() {
    try {
      if (!this.client) {
        throw new Error('SMS service not initialized');
      }
      
      // Test by fetching account details
      const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      
      return {
        success: true,
        message: 'Twilio connection successful',
        accountSid: account.sid,
        status: account.status
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async getAccountUsage(startDate, endDate) {
    try {
      if (!this.client) {
        throw new Error('SMS service not initialized');
      }
      
      const usage = await this.client.usage.records.list({
        category: 'sms',
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: endDate || new Date()
      });
      
      return {
        success: true,
        usage: usage.map(record => ({
          category: record.category,
          description: record.description,
          count: record.count,
          price: record.price,
          priceUnit: record.priceUnit,
          startDate: record.startDate,
          endDate: record.endDate
        }))
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  generateOptOutMessage() {
    return 'Reply STOP to unsubscribe from SMS notifications.';
  }
  
  handleOptOut(phoneNumber) {
    // In a real implementation, you would update the user's preferences
    // to disable SMS notifications
    console.log(`Processing opt-out for phone number: ${phoneNumber}`);
    return {
      success: true,
      message: 'Phone number has been opted out'
    };
  }
}

module.exports = new SMSService();