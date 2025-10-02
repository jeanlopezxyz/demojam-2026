// Mock categories data with tech focus
export const mockCategories = [
  {
    id: 'frameworks',
    name: 'Frameworks',
    description: 'Popular web frameworks',
    icon: 'code',
    trending: true,
    subcategories: [
      { id: 'react', name: 'React', productCount: 15 },
      { id: 'vue', name: 'Vue.js', productCount: 8 },
      { id: 'angular', name: 'Angular', productCount: 10 },
      { id: 'nextjs', name: 'Next.js', productCount: 12, isNew: true }
    ]
  },
  {
    id: 'cloud',
    name: 'Cloud & DevOps',
    description: 'Cloud platforms and tools',
    icon: 'cloud',
    subcategories: [
      { id: 'aws', name: 'AWS', productCount: 20 },
      { id: 'azure', name: 'Azure', productCount: 15 },
      { id: 'gcp', name: 'Google Cloud', productCount: 12 },
      { id: 'docker', name: 'Docker', productCount: 18, trending: true },
      { id: 'kubernetes', name: 'Kubernetes', productCount: 16 }
    ]
  },
  {
    id: 'databases',
    name: 'Databases',
    description: 'Database technologies',
    icon: 'storage',
    subcategories: [
      { id: 'postgresql', name: 'PostgreSQL', productCount: 10 },
      { id: 'mongodb', name: 'MongoDB', productCount: 12 },
      { id: 'redis', name: 'Redis', productCount: 8 },
      { id: 'mysql', name: 'MySQL', productCount: 9 }
    ]
  },
  {
    id: 'languages',
    name: 'Languages',
    description: 'Programming languages',
    icon: 'terminal',
    isNew: true,
    subcategories: [
      { id: 'javascript', name: 'JavaScript', productCount: 25 },
      { id: 'typescript', name: 'TypeScript', productCount: 20, trending: true },
      { id: 'python', name: 'Python', productCount: 22 },
      { id: 'java', name: 'Java', productCount: 18 },
      { id: 'go', name: 'Go', productCount: 14, isNew: true },
      { id: 'rust', name: 'Rust', productCount: 10, isNew: true }
    ]
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Security tools and practices',
    icon: 'security',
    subcategories: [
      { id: 'oauth', name: 'OAuth', productCount: 6 },
      { id: 'jwt', name: 'JWT', productCount: 8 },
      { id: 'keycloak', name: 'Keycloak', productCount: 5 }
    ]
  },
  {
    id: 'testing',
    name: 'Testing',
    description: 'Testing frameworks',
    icon: 'bug',
    subcategories: [
      { id: 'jest', name: 'Jest', productCount: 8 },
      { id: 'cypress', name: 'Cypress', productCount: 6 },
      { id: 'junit', name: 'JUnit', productCount: 7 },
      { id: 'selenium', name: 'Selenium', productCount: 5 }
    ]
  },
  {
    id: 'ai-ml',
    name: 'AI & ML',
    description: 'Artificial Intelligence & Machine Learning',
    icon: 'memory',
    trending: true,
    isNew: true,
    subcategories: [
      { id: 'tensorflow', name: 'TensorFlow', productCount: 8 },
      { id: 'pytorch', name: 'PyTorch', productCount: 7 },
      { id: 'openai', name: 'OpenAI', productCount: 10, trending: true },
      { id: 'langchain', name: 'LangChain', productCount: 6, isNew: true }
    ]
  },
  {
    id: 'microservices',
    name: 'Microservices',
    description: 'Microservices architecture',
    icon: 'widgets',
    subcategories: [
      { id: 'kafka', name: 'Apache Kafka', productCount: 9 },
      { id: 'rabbitmq', name: 'RabbitMQ', productCount: 6 },
      { id: 'grpc', name: 'gRPC', productCount: 5 },
      { id: 'istio', name: 'Istio', productCount: 4 }
    ]
  }
]

// Function to get flattened categories for dropdown
export const getFlatCategories = () => {
  const flat = []
  mockCategories.forEach(category => {
    flat.push({
      id: category.id,
      name: category.name,
      level: 0
    })
    if (category.subcategories) {
      category.subcategories.forEach(sub => {
        flat.push({
          id: sub.id,
          name: `  ${sub.name}`,
          level: 1,
          parentId: category.id
        })
      })
    }
  })
  return flat
}

// Function to calculate total product counts
export const calculateProductCounts = (categories) => {
  const counts = {}
  categories.forEach(category => {
    let total = 0
    if (category.subcategories) {
      category.subcategories.forEach(sub => {
        counts[sub.id] = sub.productCount || 0
        total += sub.productCount || 0
      })
    }
    counts[category.id] = total
  })
  return counts
}