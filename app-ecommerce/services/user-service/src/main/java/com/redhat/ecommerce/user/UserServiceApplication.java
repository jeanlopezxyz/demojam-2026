package com.redhat.ecommerce.user;

import io.quarkus.runtime.Quarkus;
import io.quarkus.runtime.QuarkusApplication;
import io.quarkus.runtime.annotations.QuarkusMain;
import org.jboss.logging.Logger;

// Java 25 - Compact source file with instance main method
@QuarkusMain
public class UserServiceApplication implements QuarkusApplication {
    
    private static final Logger LOG = Logger.getLogger(UserServiceApplication.class);

    // Java 25 - Instance main method (new feature)
    public static void main(String... args) {
        LOG.info("🚀 Starting User Service with Java 25 + Quarkus 3.28.1");
        Quarkus.run(UserServiceApplication.class, args);
    }

    @Override
    public int run(String... args) {
        LOG.info("✅ User Service started successfully");
        LOG.info("🔗 Health Check: http://localhost:3001/q/health");
        LOG.info("🎛️ Dev UI: http://localhost:3001/q/dev");
        LOG.info("📖 API Docs: http://localhost:3001/q/swagger-ui");
        
        Quarkus.waitForExit();
        return 0;
    }
}