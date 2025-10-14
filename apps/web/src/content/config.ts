import { defineCollection, z } from 'astro:content';

/**
 * Content Collections für dynamische Inhalte
 * Ersetzt statische JSON-Dateien durch strukturierte Content Collections
 */

// Services Collection
const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    category: z.enum(['hr', 'digitalisierung', 'persoenlichkeitsentwicklung', 'vermietung']),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    tags: z.array(z.string()).default([]),
    price: z.string().optional(),
    duration: z.string().optional(),
    successRate: z.number().min(0).max(100).optional(),
    applications: z.number().default(0),
    rating: z.number().min(0).max(5).optional(),
    lastUpdated: z.date().optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).default([])
    }).optional()
  })
});

// Methods Collection (Persönlichkeitsentwicklung)
const methods = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['theorie', 'anwendung', 'tools', 'assessment']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    duration: z.string(),
    author: z.string().default('Manuel Weiss'),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    tags: z.array(z.string()).default([]),
    prerequisites: z.array(z.string()).default([]),
    outcomes: z.array(z.string()).default([]),
    resources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      type: z.enum(['pdf', 'video', 'article', 'tool'])
    })).default([]),
    lastUpdated: z.date().optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).default([])
    }).optional()
  })
});

// Blog Posts Collection
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default('Manuel Weiss'),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    category: z.enum(['hr', 'digitalisierung', 'persoenlichkeitsentwicklung', 'business', 'tech']),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    readingTime: z.number().default(5),
    image: z.string().optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).default([])
    }).optional()
  })
});

// Case Studies Collection
const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    client: z.string(),
    industry: z.string(),
    challenge: z.string(),
    solution: z.string(),
    results: z.array(z.string()),
    duration: z.string(),
    teamSize: z.number().optional(),
    technologies: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    publishDate: z.date(),
    tags: z.array(z.string()).default([]),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).default([])
    }).optional()
  })
});

// FAQ Collection
const faq = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    category: z.enum(['general', 'hr', 'digitalisierung', 'persoenlichkeitsentwicklung', 'technical']),
    order: z.number().default(0),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    lastUpdated: z.date().optional()
  })
});

// Testimonials Collection
const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    position: z.string(),
    company: z.string(),
    content: z.string(),
    rating: z.number().min(1).max(5),
    service: z.string(),
    featured: z.boolean().default(false),
    date: z.date(),
    image: z.string().optional(),
    verified: z.boolean().default(false)
  })
});

// Analytics Data Collection
const analytics = defineCollection({
  type: 'data',
  schema: z.object({
    platform: z.object({
      totalUsers: z.number(),
      activeUsers: z.number(),
      newUsers: z.number(),
      successRate: z.number(),
      applicationsCreated: z.number(),
      userRating: z.number(),
      uptime: z.number()
    }),
    features: z.object({
      jobAnalysis: z.object({
        usage: z.number(),
        successRate: z.number(),
        avgTime: z.number()
      }),
      coverLetter: z.object({
        usage: z.number(),
        successRate: z.number(),
        avgTime: z.number()
      }),
      cvOptimization: z.object({
        usage: z.number(),
        successRate: z.number(),
        avgTime: z.number()
      }),
      interviewPrep: z.object({
        usage: z.number(),
        successRate: z.number(),
        avgTime: z.number()
      })
    }),
    performance: z.object({
      pageLoadTime: z.number(),
      apiResponseTime: z.number(),
      errorRate: z.number(),
      lighthouseScore: z.number()
    }),
    lastUpdated: z.date()
  })
});

export const collections = {
  services,
  methods,
  blog,
  caseStudies,
  faq,
  testimonials,
  analytics
};
