// Configuration for environment variables
const config = {
  // Backend API URL - defaults to localhost for development
  BACKEND_URL: process.env.REACT_APP_API_URL || 'https://api.peak-note.com',

  // API endpoints
  ENDPOINTS: {
    TRANSCRIPT_BY_URL: '/transcript/by-url'
  },

  // Font options for the application
  FONTS: {
    'Arial': 'Arial, Helvetica, sans-serif',
    'Times New Roman': 'Times New Roman, Times, serif',
    'Georgia': 'Georgia, serif',
    'Verdana': 'Verdana, Geneva, sans-serif',
    'Tahoma': 'Tahoma, Geneva, sans-serif',
    'Trebuchet MS': 'Trebuchet MS, Helvetica, sans-serif',
    'Courier New': 'Courier New, Courier, monospace',
    'Lucida Console': 'Lucida Console, Monaco, monospace',
    'Palatino': 'Palatino, Palatino Linotype, serif',
    'Garamond': 'Garamond, serif'
  }
};

export default config;
