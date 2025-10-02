// Product Service Initial Data - Tech Polo Shirts
// MongoDB initialization script

// Switch to product service database
db = db.getSiblingDB('product_service_db');

// Create categories for tech polo shirts
db.categories.insertMany([
  {
    _id: ObjectId("64f8b3c4d1234567890abcd1"),
    name: "Programming Languages",
    description: "Polo shirts featuring your favorite programming languages",
    slug: "programming-languages",
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("64f8b3c4d1234567890abcd2"),
    name: "Cloud Platforms",
    description: "Show your cloud expertise with these stylish polos",
    slug: "cloud-platforms", 
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("64f8b3c4d1234567890abcd3"),
    name: "DevOps Tools",
    description: "DevOps and infrastructure tool themed polo shirts",
    slug: "devops-tools",
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("64f8b3c4d1234567890abcd4"),
    name: "Tech Companies",
    description: "Polo shirts featuring major tech companies",
    slug: "tech-companies",
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create tech polo shirts products
db.products.insertMany([
  // Programming Languages
  {
    _id: ObjectId("64f8b3c4d1234567890abce1"),
    name: "Java Duke Polo Shirt",
    description: "Premium cotton polo featuring the iconic Java Duke mascot. Perfect for Java developers who want to show their passion for the platform.",
    shortDescription: "Java Duke mascot polo in premium cotton",
    slug: "java-duke-polo",
    sku: "JAVA-POLO-001",
    price: NumberDecimal("45.99"),
    comparePrice: NumberDecimal("59.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd1"),
    tags: ["java", "programming", "duke", "oracle", "jvm"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: true,
    stockQuantity: 150,
    brand: "DevWear",
    metadata: {
      material: "100% Cotton",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Navy", "Black", "White"],
      weight: "200g",
      careInstructions: "Machine wash cold, tumble dry low"
    },
    rating: NumberDecimal("4.8"),
    reviewCount: 127,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("64f8b3c4d1234567890abce2"),
    name: "Python Logo Polo Shirt",
    description: "Sleek polo shirt with the Python programming language logo. Made from moisture-wicking fabric perfect for coding marathons.",
    shortDescription: "Python logo polo in moisture-wicking fabric",
    slug: "python-logo-polo",
    sku: "PYTHON-POLO-001", 
    price: NumberDecimal("42.99"),
    comparePrice: NumberDecimal("54.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd1"),
    tags: ["python", "programming", "snake", "data-science", "ai"],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: true,
    stockQuantity: 200,
    brand: "CodeStyle",
    metadata: {
      material: "65% Cotton, 35% Polyester",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blue", "Green", "Yellow"],
      weight: "180g",
      careInstructions: "Machine wash warm, hang dry"
    },
    rating: NumberDecimal("4.6"),
    reviewCount: 89,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("64f8b3c4d1234567890abce3"),
    name: "JavaScript ES6 Polo",
    description: "Modern polo shirt celebrating JavaScript ES6+ features. Comfortable fit for full-stack developers.",
    shortDescription: "JavaScript ES6+ features polo shirt",
    slug: "javascript-es6-polo",
    sku: "JS-POLO-001",
    price: NumberDecimal("39.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd1"),
    tags: ["javascript", "es6", "frontend", "nodejs", "react"],
    images: [
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: false,
    stockQuantity: 75,
    brand: "WebDev Apparel",
    metadata: {
      material: "50% Cotton, 50% Polyester",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Yellow", "Black"],
      weight: "190g"
    },
    rating: NumberDecimal("4.4"),
    reviewCount: 45,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Cloud Platforms
  {
    _id: ObjectId("64f8b3c4d1234567890abce4"),
    name: "Red Hat OpenShift Polo",
    description: "Official Red Hat OpenShift polo shirt. High-quality fabric with embroidered OpenShift logo. Perfect for conferences and meetups.",
    shortDescription: "Official Red Hat OpenShift polo with embroidered logo",
    slug: "redhat-openshift-polo",
    sku: "RH-OPENSHIFT-001",
    price: NumberDecimal("55.99"),
    comparePrice: NumberDecimal("69.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd2"),
    tags: ["redhat", "openshift", "kubernetes", "containers", "cloud"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: true,
    stockQuantity: 100,
    brand: "Red Hat",
    metadata: {
      material: "100% Pima Cotton",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Red", "Black", "Navy"],
      weight: "220g",
      features: ["Embroidered logo", "Reinforced collar", "Side vents"]
    },
    rating: NumberDecimal("4.9"),
    reviewCount: 156,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("64f8b3c4d1234567890abce5"),
    name: "AWS Cloud Practitioner Polo",
    description: "AWS certified cloud practitioner themed polo. Comfortable cotton blend perfect for tech conferences.",
    shortDescription: "AWS cloud practitioner certification polo",
    slug: "aws-cloud-polo",
    sku: "AWS-POLO-001",
    price: NumberDecimal("48.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd2"),
    tags: ["aws", "cloud", "certification", "amazon", "devops"],
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: false,
    stockQuantity: 80,
    brand: "CloudWear",
    metadata: {
      material: "60% Cotton, 40% Polyester",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Orange", "Blue", "White"],
      weight: "195g"
    },
    rating: NumberDecimal("4.5"),
    reviewCount: 73,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // DevOps Tools
  {
    _id: ObjectId("64f8b3c4d1234567890abce6"),
    name: "Docker Container Polo",
    description: "Docker whale logo polo shirt for container enthusiasts. Premium fabric with modern fit.",
    shortDescription: "Docker whale logo polo for container enthusiasts",
    slug: "docker-container-polo",
    sku: "DOCKER-POLO-001",
    price: NumberDecimal("44.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd3"),
    tags: ["docker", "containers", "devops", "whale", "blue"],
    images: [
      "https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: true,
    stockQuantity: 120,
    brand: "ContainerWear",
    metadata: {
      material: "100% Organic Cotton",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Blue", "Navy", "White"],
      weight: "210g"
    },
    rating: NumberDecimal("4.7"),
    reviewCount: 98,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("64f8b3c4d1234567890abce7"),
    name: "Kubernetes Captain Polo",
    description: "Kubernetes helm logo polo shirt. Show your orchestration skills with this premium polo.",
    shortDescription: "Kubernetes helm logo premium polo",
    slug: "kubernetes-captain-polo",
    sku: "K8S-POLO-001",
    price: NumberDecimal("49.99"),
    comparePrice: NumberDecimal("64.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd3"),
    tags: ["kubernetes", "k8s", "orchestration", "helm", "captain"],
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: true,
    stockQuantity: 90,
    brand: "K8s Fashion",
    metadata: {
      material: "Premium Cotton Blend",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blue", "Purple", "White"],
      weight: "205g"
    },
    rating: NumberDecimal("4.8"),
    reviewCount: 142,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Tech Companies
  {
    _id: ObjectId("64f8b3c4d1234567890abce8"),
    name: "GitHub Octocat Polo",
    description: "GitHub Octocat polo shirt for version control enthusiasts. Soft cotton with the iconic Octocat design.",
    shortDescription: "GitHub Octocat polo for developers",
    slug: "github-octocat-polo",
    sku: "GITHUB-POLO-001",
    price: NumberDecimal("41.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd4"),
    tags: ["github", "octocat", "git", "version-control", "microsoft"],
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: false,
    stockQuantity: 110,
    brand: "GitWear",
    metadata: {
      material: "100% Cotton",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Gray", "White"],
      weight: "200g"
    },
    rating: NumberDecimal("4.6"),
    reviewCount: 67,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("64f8b3c4d1234567890abce9"),
    name: "React Developer Polo",
    description: "React logo polo shirt for frontend developers. Modern design with the React atom symbol.",
    shortDescription: "React logo polo for frontend developers",
    slug: "react-developer-polo", 
    sku: "REACT-POLO-001",
    price: NumberDecimal("43.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd4"),
    tags: ["react", "frontend", "javascript", "facebook", "hooks"],
    images: [
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: true,
    stockQuantity: 95,
    brand: "ReactWear",
    metadata: {
      material: "Cotton Blend",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Cyan", "Navy", "Black"],
      weight: "185g"
    },
    rating: NumberDecimal("4.5"),
    reviewCount: 54,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("64f8b3c4d1234567890abcea"),
    name: "Quarkus Supersonic Polo",
    description: "Quarkus supersonic subatomic Java polo shirt. Ultra-fast like the framework itself!",
    shortDescription: "Quarkus supersonic Java framework polo",
    slug: "quarkus-supersonic-polo",
    sku: "QUARKUS-POLO-001",
    price: NumberDecimal("52.99"),
    comparePrice: NumberDecimal("67.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd1"),
    tags: ["quarkus", "java", "supersonic", "redhat", "native"],
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: true,
    stockQuantity: 65,
    brand: "Red Hat",
    metadata: {
      material: "Performance Cotton",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Red", "Black", "Blue"],
      weight: "195g",
      features: ["Moisture-wicking", "Anti-bacterial", "UV protection"]
    },
    rating: NumberDecimal("4.9"),
    reviewCount: 203,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("64f8b3c4d1234567890abceb"),
    name: "Microservices Architecture Polo",
    description: "Microservices pattern polo shirt with distributed architecture design. For architects and senior developers.",
    shortDescription: "Microservices architecture pattern polo",
    slug: "microservices-architecture-polo",
    sku: "MICRO-POLO-001",
    price: NumberDecimal("47.99"),
    categoryId: ObjectId("64f8b3c4d1234567890abcd3"),
    tags: ["microservices", "architecture", "distributed", "patterns", "enterprise"],
    images: [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80"
    ],
    isActive: true,
    isFeatured: false,
    stockQuantity: 45,
    brand: "ArchitectWear",
    metadata: {
      material: "Premium Cotton",
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Gray", "Navy", "Black"],
      weight: "215g"
    },
    rating: NumberDecimal("4.7"),
    reviewCount: 34,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("✅ Product data initialized - Tech polo shirts loaded!");
print("📊 Products created: " + db.products.countDocuments());
print("📂 Categories created: " + db.categories.countDocuments());