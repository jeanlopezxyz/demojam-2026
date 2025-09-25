const axios = require('axios');
const services = require('../config/services');

const checkServiceHealth = async (serviceName, serviceConfig) => {
  try {
    const response = await axios.get(`${serviceConfig.url}/health`, {
      timeout: 5000
    });
    return {
      service: serviceName,
      status: 'healthy',
      url: serviceConfig.url,
      response: response.data
    };
  } catch (error) {
    return {
      service: serviceName,
      status: 'unhealthy',
      url: serviceConfig.url,
      error: error.message
    };
  }
};

const getAllServicesHealth = async () => {
  const healthChecks = Object.entries(services).map(([name, config]) =>
    checkServiceHealth(name, config)
  );
  
  const results = await Promise.all(healthChecks);
  
  const healthyServices = results.filter(r => r.status === 'healthy').length;
  const totalServices = results.length;
  
  return {
    gateway: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    services: results,
    summary: {
      total: totalServices,
      healthy: healthyServices,
      unhealthy: totalServices - healthyServices,
      overallStatus: healthyServices === totalServices ? 'healthy' : 'degraded'
    }
  };
};

module.exports = {
  checkServiceHealth,
  getAllServicesHealth
};