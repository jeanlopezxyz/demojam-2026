// Script to add tech polo products to MongoDB
// Run with: mongosh -u product_user -p product_password --authenticationDatabase admin product_service_db add-products.js

// First, fix existing products by converting price to Decimal128
print("Updating existing products to use Decimal128 for price...");

db.products.find().forEach(function(product) {
    db.products.updateOne(
        { _id: product._id },
        { $set: { price: NumberDecimal(product.price.toString()) } }
    );
});

print("Adding new tech polo products...");

// Category IDs from the API response we saw earlier
const categories = {
    "programming-languages": "64f8b3c4d1234567890abcd1", 
    "cloud-platforms": "64f8b3c4d1234567890abcd2",
    "devops-tools": "64f8b3c4d1234567890abcd3", 
    "tech-companies": "64f8b3c4d1234567890abcd4"
};

const newProducts = [
    // Programming Languages
    {
        name: "JavaScript ES6 Polo Shirt",
        description: "Modern polo featuring JavaScript ES6 syntax and arrow functions",
        slug: "javascript-es6-polo",
        sku: "JS-POLO-001",
        price: NumberDecimal("39.99"),
        categoryId: categories["programming-languages"],
        tags: ["javascript", "es6", "programming", "web"],
        images: ["https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: true,
        stockQuantity: 180,
        brand: "CodeWear",
        rating: NumberDecimal("4.7"),
        reviewCount: 95,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "TypeScript Polo Shirt",
        description: "Premium polo with TypeScript logo and type annotations",
        slug: "typescript-polo",
        sku: "TS-POLO-001", 
        price: NumberDecimal("44.99"),
        categoryId: categories["programming-languages"],
        tags: ["typescript", "javascript", "types", "microsoft"],
        images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: false,
        stockQuantity: 120,
        brand: "DevStyle",
        rating: NumberDecimal("4.5"),
        reviewCount: 67,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Rust Programming Polo",
        description: "High-performance polo shirt inspired by Rust's memory safety",
        slug: "rust-programming-polo",
        sku: "RUST-POLO-001",
        price: NumberDecimal("47.99"),
        categoryId: categories["programming-languages"],
        tags: ["rust", "systems", "programming", "mozilla"],
        images: ["https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: true,
        stockQuantity: 95,
        brand: "SystemsWear",
        rating: NumberDecimal("4.9"),
        reviewCount: 134,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    
    // Cloud Platforms
    {
        name: "AWS Lambda Polo Shirt",
        description: "Serverless polo featuring AWS Lambda functions and cloud architecture",
        slug: "aws-lambda-polo",
        sku: "AWS-POLO-001",
        price: NumberDecimal("52.99"),
        categoryId: categories["cloud-platforms"],
        tags: ["aws", "lambda", "serverless", "cloud"],
        images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: true,
        stockQuantity: 140,
        brand: "CloudWear",
        rating: NumberDecimal("4.8"),
        reviewCount: 156,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Kubernetes Helm Polo",
        description: "Container orchestration polo with Kubernetes and Helm charts design",
        slug: "kubernetes-helm-polo",
        sku: "K8S-POLO-001",
        price: NumberDecimal("49.99"),
        categoryId: categories["cloud-platforms"],
        tags: ["kubernetes", "helm", "containers", "orchestration"],
        images: ["https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: false,
        stockQuantity: 110,
        brand: "ContainerStyle",
        rating: NumberDecimal("4.6"),
        reviewCount: 89,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Google Cloud Platform Polo",
        description: "GCP-themed polo with cloud architecture and BigQuery elements",
        slug: "gcp-polo",
        sku: "GCP-POLO-001",
        price: NumberDecimal("48.99"),
        categoryId: categories["cloud-platforms"],
        tags: ["gcp", "google", "cloud", "bigquery"],
        images: ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: true,
        stockQuantity: 125,
        brand: "CloudTech",
        rating: NumberDecimal("4.7"),
        reviewCount: 102,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    
    // DevOps Tools
    {
        name: "Docker Container Polo",
        description: "Containerized style polo featuring Docker whale and container graphics",
        slug: "docker-container-polo",
        sku: "DOCKER-POLO-001",
        price: NumberDecimal("43.99"),
        categoryId: categories["devops-tools"],
        tags: ["docker", "containers", "devops", "whale"],
        images: ["https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: true,
        stockQuantity: 160,
        brand: "DevOpsWear",
        rating: NumberDecimal("4.8"),
        reviewCount: 143,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Jenkins CI/CD Polo",
        description: "Continuous integration polo with Jenkins automation pipeline design",
        slug: "jenkins-cicd-polo",
        sku: "JENKINS-POLO-001",
        price: NumberDecimal("41.99"),
        categoryId: categories["devops-tools"],
        tags: ["jenkins", "cicd", "automation", "pipeline"],
        images: ["https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: false,
        stockQuantity: 135,
        brand: "AutomationStyle",
        rating: NumberDecimal("4.5"),
        reviewCount: 78,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Terraform Infrastructure Polo",
        description: "Infrastructure as Code polo featuring Terraform HCL syntax",
        slug: "terraform-iac-polo",
        sku: "TERRAFORM-POLO-001",
        price: NumberDecimal("46.99"),
        categoryId: categories["devops-tools"],
        tags: ["terraform", "iac", "infrastructure", "hashicorp"],
        images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: true,
        stockQuantity: 105,
        brand: "InfraWear",
        rating: NumberDecimal("4.9"),
        reviewCount: 167,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    
    // Tech Companies
    {
        name: "Red Hat OpenShift Polo",
        description: "Enterprise polo featuring Red Hat OpenShift container platform",
        slug: "redhat-openshift-polo",
        sku: "RH-POLO-001",
        price: NumberDecimal("54.99"),
        categoryId: categories["tech-companies"],
        tags: ["redhat", "openshift", "containers", "enterprise"],
        images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: true,
        stockQuantity: 175,
        brand: "EnterpriseWear",
        rating: NumberDecimal("4.9"),
        reviewCount: 189,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "GitHub Actions Polo",
        description: "Developer workflow polo with GitHub Actions and CI/CD automation",
        slug: "github-actions-polo",
        sku: "GITHUB-POLO-001",
        price: NumberDecimal("44.99"),
        categoryId: categories["tech-companies"],
        tags: ["github", "actions", "workflows", "automation"],
        images: ["https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: false,
        stockQuantity: 150,
        brand: "DevFlow",
        rating: NumberDecimal("4.6"),
        reviewCount: 112,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Microsoft Azure Polo",
        description: "Cloud computing polo featuring Microsoft Azure services and architecture",
        slug: "microsoft-azure-polo",
        sku: "AZURE-POLO-001", 
        price: NumberDecimal("51.99"),
        categoryId: categories["tech-companies"],
        tags: ["microsoft", "azure", "cloud", "enterprise"],
        images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"],
        isActive: true,
        isFeatured: true,
        stockQuantity: 130,
        brand: "CloudEnterprise",
        rating: NumberDecimal("4.7"),
        reviewCount: 145,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Insert all new products
db.products.insertMany(newProducts);

print("Successfully added " + newProducts.length + " new products!");
print("Total products in database: " + db.products.countDocuments());

// Show summary by category
print("\nProducts by category:");
db.products.aggregate([
    {
        $group: {
            _id: "$categoryId",
            count: { $sum: 1 },
            featured: { $sum: { $cond: ["$isFeatured", 1, 0] } }
        }
    }
]).forEach(function(result) {
    print("Category " + result._id + ": " + result.count + " products (" + result.featured + " featured)");
});