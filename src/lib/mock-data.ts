export const MOCK_USER = {
  id: 'mock-user-id',
  name: 'Demo User',
  email: 'user@example.com',
  address: {
    street: '123 AI Boulevard',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'USA'
  }
};

export const MOCK_ORDERS = [
  {
    id: 'ORD-2025-001',
    date: '2025-05-15',
    total: 299.00,
    status: 'PAID',
    items: [
      { id: '1', name: 'AI Writing Assistant Pro', quantity: 1, price: 299.00 }
    ]
  },
  {
    id: 'ORD-2025-002',
    date: '2025-04-20',
    total: 49.99,
    status: 'PENDING',
    items: [
      { id: '2', name: 'SEO Optimizer Basic', quantity: 1, price: 49.99 }
    ]
  },
  {
    id: 'ORD-2024-12-10',
    date: '2024-12-10',
    total: 150.00,
    status: 'CANCELLED',
    items: [
      { id: '3', name: 'Image Generator Credits', quantity: 5, price: 30.00 }
    ]
  }
];
