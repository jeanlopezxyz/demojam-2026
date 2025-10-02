package com.redhat.ecommerce.gateway.service;

import com.redhat.ecommerce.gateway.security.UserContextProcessor;
import io.smallrye.mutiny.Uni;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.faulttolerance.CircuitBreaker;
import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.faulttolerance.Timeout;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@ApplicationScoped
public class ProxyService {
    
    private static final Logger LOG = Logger.getLogger(ProxyService.class);
    
    @Inject
    UserContextProcessor userContextProcessor;
    
    @ConfigProperty(name = "services.user-service.url")
    String userServiceUrl;
    
    @ConfigProperty(name = "services.product-service.url")
    String productServiceUrl;
    
    @ConfigProperty(name = "services.order-service.url") 
    String orderServiceUrl;
    
    @ConfigProperty(name = "services.payment-service.url")
    String paymentServiceUrl;
    
    @ConfigProperty(name = "services.inventory-service.url")
    String inventoryServiceUrl;
    
    @ConfigProperty(name = "services.notification-service.url")
    String notificationServiceUrl;
    
    @ConfigProperty(name = "services.recommendation-service.url")
    String recommendationServiceUrl;
    
    /**
     * Proxy request to backend microservice with enhanced headers
     */
    @Retry(maxRetries = 3, delay = 1000)
    @CircuitBreaker(requestVolumeThreshold = 4, failureRatio = 0.75, delay = 5000)
    @Timeout(value = 30, unit = ChronoUnit.SECONDS)
    public Uni<Response> proxyRequest(String serviceName, UriInfo uriInfo, HttpHeaders headers) {
        String path = uriInfo != null ? uriInfo.getPath() : "";
        return proxyRequest(serviceName, path, headers);
    }
    
    /**
     * Proxy request with direct path
     */
    @Retry(maxRetries = 3, delay = 1000)
    @CircuitBreaker(requestVolumeThreshold = 4, failureRatio = 0.75, delay = 5000)
    @Timeout(value = 30, unit = ChronoUnit.SECONDS)
    public Uni<Response> proxyRequest(String serviceName, String path, HttpHeaders headers) {
        return proxyRequestWithQueryParams(serviceName, path, null, headers);
    }
    
    public Uni<Response> proxyRequestWithQueryParams(String serviceName, String path, String queryString, HttpHeaders headers) {
        
        return Uni.createFrom().item(() -> {
            try {
                LOG.infof("Proxying request to %s: %s", serviceName, path);
                
                // Get service URL
                String serviceUrl = getServiceUrl(serviceName);
                if (serviceUrl == null) {
                    LOG.errorf("Unknown service: %s", serviceName);
                    return Response.status(Response.Status.NOT_FOUND)
                            .entity(Map.of("error", "Service not found: " + serviceName))
                            .build();
                }
                
                // Check if service is reachable (prevent localhost issues)
                if (!isServiceReachable(serviceUrl)) {
                    LOG.errorf("Service %s is not reachable at %s", serviceName, serviceUrl);
                    return createServiceUnavailableResponse(serviceName, serviceUrl);
                }
                
                // Process user context and add security headers
                Map<String, String> enhancedHeaders = userContextProcessor.processUserContext(headers);
                
                // Build target URL and preserve query parameters
                // Remove /api/ prefix to get the service-specific path
                String cleanPath = path.replaceFirst("^/api/", "");
                String targetUrl = serviceUrl + "/" + cleanPath;
                if (queryString != null && !queryString.isEmpty()) {
                    targetUrl += "?" + queryString;
                }
                
                LOG.debugf("Proxying to: %s", targetUrl);
                
                // Make actual HTTP call to the service
                try {
                    java.net.http.HttpClient httpClient = java.net.http.HttpClient.newBuilder()
                        .connectTimeout(java.time.Duration.ofSeconds(5))
                        .build();
                    
                    java.net.http.HttpRequest.Builder requestBuilder = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(targetUrl))
                        .timeout(java.time.Duration.ofSeconds(10))
                        .header("Accept", "application/json")
                        .GET();
                    
                    // Add enhanced headers
                    for (Map.Entry<String, String> header : enhancedHeaders.entrySet()) {
                        requestBuilder.header(header.getKey(), header.getValue());
                    }
                    
                    java.net.http.HttpRequest request = requestBuilder.build();
                    java.net.http.HttpResponse<String> response = httpClient.send(request, 
                        java.net.http.HttpResponse.BodyHandlers.ofString());
                    
                    LOG.infof("Received response from %s: status=%d", serviceName, response.statusCode());
                    
                    // Return the actual response from the service (CORS handled by Quarkus)
                    return Response.status(response.statusCode())
                        .entity(response.body())
                        .build();
                        
                } catch (Exception httpEx) {
                    LOG.errorf("HTTP error calling %s: %s", serviceName, httpEx.getMessage());
                    return Response.status(Response.Status.BAD_GATEWAY)
                        .entity(Map.of(
                            "error", "Gateway error", 
                            "service", serviceName,
                            "message", httpEx.getMessage()
                        )).build();
                }
                
            } catch (Exception e) {
                LOG.errorf("Error proxying request to %s: %s", serviceName, e.getMessage());
                return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                        .entity(Map.of(
                            "error", "Service temporarily unavailable",
                            "service", serviceName,
                            "message", e.getMessage()
                        )).build();
            }
        });
    }
    
    private boolean isServiceReachable(String serviceUrl) {
        try {
            // Extract host and port from URL
            java.net.URL url = new java.net.URL(serviceUrl + "/q/health/ready");
            java.net.URLConnection connection = url.openConnection();
            connection.setConnectTimeout(2000); // 2 seconds
            connection.setReadTimeout(2000);
            connection.connect();
            connection.getInputStream().close();
            return true;
        } catch (Exception e) {
            LOG.debugf("Service not reachable: %s - %s", serviceUrl, e.getMessage());
            return false;
        }
    }
    
    private Response createServiceUnavailableResponse(String serviceName, String serviceUrl) {
        return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                .entity(Map.of(
                    "error", "Service unavailable",
                    "service", serviceName,
                    "serviceUrl", serviceUrl,
                    "message", "Service is not running or not reachable",
                    "suggestion", "Check if " + serviceName + " is deployed and healthy",
                    "timestamp", java.time.Instant.now()
                )).build();
    }
    
    private String getServiceUrl(String serviceName) {
        return switch (serviceName) {
            case "user-service" -> userServiceUrl;
            case "product-service" -> productServiceUrl;
            case "order-service" -> orderServiceUrl;
            case "payment-service" -> paymentServiceUrl;
            case "inventory-service" -> inventoryServiceUrl;
            case "notification-service" -> notificationServiceUrl;
            case "recommendation-service" -> recommendationServiceUrl;
            default -> null;
        };
    }
}