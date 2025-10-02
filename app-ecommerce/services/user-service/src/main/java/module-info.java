// Java 25 - Module with simplified imports
module user.service {
    // Java 25 - Succinct module import declarations
    requires java.base;
    requires jakarta.enterprise.cdi.api;
    requires jakarta.ws.rs.api;
    requires jakarta.persistence.api;
    requires jakarta.validation.api;
    requires io.quarkus.hibernate.orm.panache;
    requires org.jboss.logging;
    
    // Export main package for CDI
    exports com.redhat.ecommerce.user.resource;
    exports com.redhat.ecommerce.user.service;
    
    // Open for reflection (required for Quarkus)
    opens com.redhat.ecommerce.user.model to org.hibernate.orm, com.fasterxml.jackson.databind;
    opens com.redhat.ecommerce.user.dto to com.fasterxml.jackson.databind;
}