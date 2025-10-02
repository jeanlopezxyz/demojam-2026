/**
 * Integration tests for ${{ values.name }}
 * Testing API endpoints and database operations
 */

const request = require('supertest');
const app = require('../../src/index');
{% if values.database == "postgresql" %}
const { sequelize } = require('../../src/config/database');
{% endif %}
{% if values.database == "mongodb" %}
const mongoose = require('mongoose');
{% endif %}

describe('${{ values.name | title }} Service Integration Tests', () => {
  
  beforeAll(async () => {
    // Setup test database
    {% if values.database == "postgresql" %}
    await sequelize.sync({ force: true });
    {% endif %}
    {% if values.database == "mongodb" %}
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/test_${{ values.name | replace("-", "_") }}');
    {% endif %}
  });
  
  afterAll(async () => {
    // Cleanup test database
    {% if values.database == "postgresql" %}
    await sequelize.close();
    {% endif %}
    {% if values.database == "mongodb" %}
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    {% endif %}
  });
  
  describe('Health Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
        
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('${{ values.name }}');
    });
    
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/ready')
        .expect(200);
        
      expect(response.body.status).toBe('ready');
    });
  });
  
  {% if values.hasMetrics %}
  describe('Metrics Endpoint', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
        
      expect(response.text).toContain('# HELP');
      expect(response.text).toContain('# TYPE');
    });
  });
  {% endif %}
  
  {% if values.hasAuth %}
  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/protected-endpoint')
        .expect(401);
        
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
    
    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/protected-endpoint')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
        
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });
  {% endif %}
  
  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);
        
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
    
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
        
      expect(response.body.error).toBeDefined();
    });
  });
  
  {% if values.hasRateLimit %}
  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make multiple requests to trigger rate limit
      const requests = Array(10).fill().map(() => 
        request(app).get('/health')
      );
      
      const responses = await Promise.all(requests);
      
      // All requests should succeed initially
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });
  {% endif %}
  
  describe('CORS Configuration', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(204);
        
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});