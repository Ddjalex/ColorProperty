// Mock API for static demo version
// This replaces the backend API calls with static data

// Mock data
const mockData = {
  settings: {
    _id: "mock_settings",
    companyName: "Temer Properties",
    hotlineNumber: "+251 911 123456",
    email: "info@temerrealestatesales.com",
    address: "Addis Ababa, Ethiopia",
    whatsappNumber: "+251 911 123456",
    facebook: "https://facebook.com/temerproperties",
    instagram: "https://instagram.com/temerproperties",
    twitter: "https://twitter.com/temerproperties"
  },
  
  properties: [
    {
      _id: "mock_prop_1",
      title: "Modern 3 Bedroom Villa",
      description: "Beautiful modern villa with spacious rooms and great view",
      location: "Bole, Addis Ababa",
      type: "villa",
      price: 12500000,
      size: 350,
      bedrooms: 3,
      bathrooms: 2,
      images: ["./assets/images (2)_1755853378467-D-9Sw1o__1757008681347-D-9Sw1o_.jpg"],
      amenities: ["parking", "garden", "security"],
      featured: true,
      status: "available"
    },
    {
      _id: "mock_prop_2", 
      title: "Luxury Apartment",
      description: "High-end apartment in prime location",
      location: "Kazanchis, Addis Ababa",
      type: "apartment",
      price: 8500000,
      size: 120,
      bedrooms: 2,
      bathrooms: 1,
      images: ["./assets/images (2)_1755853378467-D-9Sw1o__1757008681347-D-9Sw1o_.jpg"],
      amenities: ["elevator", "gym", "security"],
      featured: true,
      status: "available"
    }
  ],

  heroSlides: [
    {
      _id: "mock_slide_1",
      title: "Find Your Dream Property",
      subtitle: "Premium Real Estate in Ethiopia",
      buttonText: "Browse Properties",
      buttonLink: "/properties",
      image: "./assets/images (2)_1755853378467-D-9Sw1o__1757008681347-D-9Sw1o_.jpg"
    }
  ],

  team: [
    {
      _id: "mock_team_1",
      name: "Demo Agent",
      position: "Senior Real Estate Agent",
      email: "agent@temerrealestatesales.com",
      phone: "+251 911 123456",
      image: "./assets/images (2)_1755853378467-D-9Sw1o__1757008681347-D-9Sw1o_.jpg"
    }
  ],

  blog: [
    {
      _id: "mock_blog_1",
      title: "Real Estate Market Trends in Ethiopia",
      content: "The Ethiopian real estate market continues to grow...",
      excerpt: "Overview of current market trends and opportunities",
      slug: "real-estate-market-trends-ethiopia",
      author: "Temer Properties",
      publishedAt: new Date().toISOString(),
      tags: ["market", "trends", "ethiopia"]
    }
  ]
};

// Mock fetch function
const originalFetch = window.fetch;

window.fetch = function(url, options = {}) {
  // Handle API routes with mock data
  if (url.includes('/api/')) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = null;
        let status = 200;

        if (url.includes('/api/settings')) {
          data = mockData.settings;
        } else if (url.includes('/api/properties/featured')) {
          data = mockData.properties.filter(p => p.featured);
        } else if (url.includes('/api/properties')) {
          data = { properties: mockData.properties, total: mockData.properties.length };
        } else if (url.includes('/api/hero-slides')) {
          data = mockData.heroSlides;
        } else if (url.includes('/api/team')) {
          data = mockData.team;
        } else if (url.includes('/api/blog')) {
          data = mockData.blog;
        } else if (url.includes('/api/auth/login')) {
          // Mock login - always fail in demo
          status = 401;
          data = { message: 'Demo mode - Login disabled' };
        } else {
          status = 404;
          data = { message: 'Endpoint not found in demo mode' };
        }

        const response = {
          ok: status === 200,
          status: status,
          json: () => Promise.resolve(data),
          text: () => Promise.resolve(JSON.stringify(data))
        };

        resolve(response);
      }, 100); // Small delay to simulate network
    });
  }

  // For non-API requests, use original fetch
  return originalFetch.apply(this, arguments);
};

// Disable WebSocket connections in demo
const originalWebSocket = window.WebSocket;
window.WebSocket = function() {
  console.log('WebSocket disabled in demo mode');
  return {
    addEventListener: () => {},
    removeEventListener: () => {},
    close: () => {},
    send: () => {}
  };
};

console.log('🚀 Demo mode activated - Using mock data');