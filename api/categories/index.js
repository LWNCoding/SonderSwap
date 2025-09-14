// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).set(corsHeaders).end();
    return;
  }

  // Set CORS headers for all responses
  res.set(corsHeaders);

  try {
    console.log('Categories API: Starting request');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
    
    // For now, return mock data to test if the basic structure works
    if (req.method === 'GET') {
      console.log('Returning mock categories...');
      const mockCategories = [
        { _id: '1', title: 'Technology', events: [1, 2, 3] },
        { _id: '2', title: 'Design', events: [4, 5] },
        { _id: '3', title: 'Business', events: [6, 7, 8, 9] }
      ];
      res.json(mockCategories);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Categories API Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};