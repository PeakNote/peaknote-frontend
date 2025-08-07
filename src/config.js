// Configuration for environment variables
const config = {
  // Backend API URL - defaults to localhost for development
  BACKEND_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',

  // API endpoints
  ENDPOINTS: {
    TRANSCRIPT_BY_URL: '/transcript/by-url'
  }
};

export default config;
