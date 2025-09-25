# Monitoring & Observability

## Monitoring Stack Overview

Our e-commerce platform uses a comprehensive observability stack to ensure reliability, performance, and security.

## Stack Components

### **Prometheus** - Metrics Collection
- **Purpose**: Time-series metrics collection and alerting
- **Endpoint**: http://prometheus.monitoring.company.com
- **Configuration**: `/infrastructure/monitoring/prometheus.yml`
- **Retention**: 30 days

### **Grafana** - Visualization & Dashboards
- **Purpose**: Metrics visualization and monitoring dashboards
- **Endpoint**: http://grafana.monitoring.company.com
- **Dashboards**: Pre-configured for all services
- **Alerts**: Integrated with Slack and PagerDuty

### **ELK Stack** - Logging
- **Elasticsearch**: Log storage and search
- **Logstash**: Log processing and enrichment
- **Kibana**: Log visualization and analysis
- **Filebeat**: Log shipping from containers

### **Jaeger** - Distributed Tracing
- **Purpose**: Request tracing across microservices
- **Endpoint**: http://jaeger.monitoring.company.com
- **Sampling**: 10% of requests in production

## Key Metrics

### **Application Metrics**
- **Request Rate**: Requests per second per service
- **Response Time**: P50, P95, P99 latencies
- **Error Rate**: 4xx and 5xx response rates
- **Throughput**: Business transactions per minute

### **Infrastructure Metrics**
- **CPU Usage**: Per container and node
- **Memory Usage**: Heap and total memory
- **Disk I/O**: Read/write operations
- **Network**: Bandwidth and packet loss

### **Database Metrics**
- **Connection Pool**: Active/idle connections
- **Query Performance**: Slow queries and execution time
- **Lock Contention**: Database locks and deadlocks
- **Replication Lag**: Primary-replica sync status

### **Business Metrics**
- **Active Users**: Concurrent and daily active users
- **Orders**: Created, completed, cancelled orders
- **Revenue**: Real-time revenue tracking
- **Conversion Rate**: Funnel analysis metrics

## Alerting Rules

### **Critical Alerts** (PagerDuty)
```yaml
groups:
- name: critical-alerts
  rules:
  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service {{ $labels.job }} is down"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate on {{ $labels.service }}"
      
  - alert: DatabaseDown
    expr: pg_up == 0 or mongodb_up == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Database {{ $labels.instance }} is unreachable"
```

### **Warning Alerts** (Slack)
```yaml
- alert: HighLatency
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "High latency on {{ $labels.service }}"
    
- alert: HighMemoryUsage
  expr: (process_resident_memory_bytes / 1024 / 1024) > 400
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "High memory usage on {{ $labels.job }}"
```

## Pre-configured Dashboards

### **1. Platform Overview Dashboard**
- Service health status grid
- Request rates across all services
- Error rates and success rates
- Infrastructure resource usage

### **2. Service-Specific Dashboards**
- **User Service**: Authentication rates, user registrations
- **Product Service**: Search queries, catalog operations
- **Order Service**: Order processing times, conversion rates
- **Payment Service**: Transaction volumes, payment methods
- **Inventory Service**: Stock levels, reservation rates
- **Notification Service**: Message delivery rates, channels

### **3. Infrastructure Dashboard**
- Kubernetes cluster health
- Database performance metrics
- Cache hit rates and memory usage
- Network traffic and connectivity

### **4. Business Metrics Dashboard**
- Real-time revenue tracking
- User acquisition and retention
- Product performance analytics
- Sales funnel conversion rates

## Distributed Tracing

### **Trace Configuration**
Each service includes distributed tracing:
```javascript
const tracer = require('@opentelemetry/api').trace.getTracer('user-service');

app.use((req, res, next) => {
  const span = tracer.startSpan(`${req.method} ${req.path}`);
  req.span = span;
  
  span.setAttributes({
    'http.method': req.method,
    'http.url': req.url,
    'user.id': req.user?.id
  });
  
  res.on('finish', () => {
    span.setAttributes({
      'http.status_code': res.statusCode
    });
    span.end();
  });
  
  next();
});
```

### **Trace Analysis**
- **Request Flow**: Track requests across all services
- **Performance Bottlenecks**: Identify slow operations
- **Error Root Cause**: Trace errors to source
- **Dependency Mapping**: Understand service interactions

## Log Management

### **Structured Logging**
All services use structured JSON logging:
```javascript
const logger = require('winston').createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'user-service',
    version: process.env.APP_VERSION
  }
});
```

### **Log Levels**
- **ERROR**: System errors, exceptions
- **WARN**: Performance issues, deprecations
- **INFO**: Business events, API calls
- **DEBUG**: Detailed execution flow

### **Log Aggregation**
- **Collection**: Filebeat → Logstash → Elasticsearch
- **Enrichment**: Add service metadata, user context
- **Retention**: 90 days for production logs
- **Search**: Kibana with pre-built searches

## SLIs & SLOs

### **Service Level Indicators (SLIs)**
- **Availability**: Uptime percentage
- **Latency**: P95 response time
- **Error Rate**: Percentage of failed requests
- **Throughput**: Requests per second

### **Service Level Objectives (SLOs)**
| Service | Availability | Latency (P95) | Error Rate |
|---------|-------------|---------------|------------|
| User Service | 99.9% | < 200ms | < 0.1% |
| Product Service | 99.5% | < 300ms | < 0.5% |
| Order Service | 99.9% | < 500ms | < 0.1% |
| Payment Service | 99.95% | < 1000ms | < 0.05% |
| Inventory Service | 99.5% | < 100ms | < 0.5% |
| Notification Service | 99.0% | < 2000ms | < 1.0% |

## Deployment Monitoring

### **Deployment Metrics**
- **Deployment Frequency**: How often we deploy
- **Lead Time**: Code to production time
- **Mean Time to Recovery**: Time to fix issues
- **Change Failure Rate**: Deployment success rate

### **Canary Deployment Monitoring**
```yaml
# Argo Rollouts configuration for canary deployments
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: user-service-rollout
spec:
  strategy:
    canary:
      steps:
      - setWeight: 10
      - pause: {duration: 300s}
      - setWeight: 50
      - pause: {duration: 300s}
      analysis:
        templates:
        - templateName: error-rate
        args:
        - name: service-name
          value: user-service
```

## Alerting Channels

### **Incident Response**
- **Critical**: PagerDuty → On-call engineer
- **Warning**: Slack #platform-alerts
- **Info**: Email to team leads

### **Business Alerts**
- **Revenue Drop**: >20% decrease in hourly revenue
- **High Cart Abandonment**: >80% abandonment rate
- **Failed Payments**: >5% payment failure rate
- **Stock Outage**: Critical inventory levels

## Security Monitoring

### **Security Metrics**
- **Failed Authentication**: Unusual login patterns
- **Rate Limiting**: API abuse detection
- **Suspicious Activity**: Anomaly detection
- **Vulnerability Scanning**: Container and dependency scans

### **Compliance Monitoring**
- **Data Access**: GDPR compliance tracking
- **Payment Security**: PCI DSS monitoring
- **Audit Logs**: Compliance audit trails
- **Access Control**: Permission changes tracking