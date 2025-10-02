const express = require('express');
const { body, validationResult } = require('express-validator');
const ArchitectureService = require('../services/architectureService');

const router = express.Router();

// Chat endpoint
router.post('/chat', [
  body('message').notEmpty().withMessage('Message is required'),
  body('context').optional().isString(),
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, context = 'general' } = req.body;

    console.log(`💬 New chat message: "${message}" (context: ${context})`);

    // Process message through architecture service
    const response = await ArchitectureService.processQuestion(message, context);

    res.json({
      response: response.answer,
      sources: response.sources,
      context: context,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: 'Please try again later'
    });
  }
});

// Get available topics
router.get('/topics', (req, res) => {
  res.json({
    topics: [
      {
        id: 'apis',
        name: 'APIs & Integration',
        description: 'REST, GraphQL, gRPC, authentication, documentation',
        icon: '🔌'
      },
      {
        id: 'microservices',
        name: 'Microservices',
        description: 'Service patterns, communication, deployment strategies',
        icon: '🏗️'
      },
      {
        id: 'cloud-native',
        name: 'Cloud Native',
        description: 'Containers, Kubernetes, serverless, scalability',
        icon: '☁️'
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Authentication, authorization, encryption, compliance',
        icon: '🔒'
      },
      {
        id: 'devops',
        name: 'DevOps',
        description: 'CI/CD, GitOps, monitoring, automation',
        icon: '🚀'
      },
      {
        id: 'data',
        name: 'Data Architecture',
        description: 'Databases, data lakes, streaming, analytics',
        icon: '💾'
      }
    ]
  });
});

// Get documentation sources
router.get('/sources', (req, res) => {
  res.json({
    sources: [
      'Red Hat OpenShift Documentation',
      'Kubernetes Best Practices',
      'Cloud Native Computing Foundation Guidelines',
      'API Design Guidelines',
      'Security Architecture Patterns',
      'DevOps Methodology Documentation'
    ]
  });
});

module.exports = router;