# PeakNote Frontend

A modern React-based meeting notes application with glassmorphism design and particle effects.
<img width="1440" height="788" alt="Screenshot 2025-08-05 at 12 34 34 PM" src="https://github.com/user-attachments/assets/488d2f55-4d10-4907-8ee6-89659117b444" />

## Architecture

### Technology Stack
- **Frontend**: React 18.2.0 with modern hooks and components
- **UI Framework**: Bootstrap 5.3.0 with custom glassmorphism styling
- **Effects**: Particles.js for animated backgrounds
- **Icons**: FontAwesome integration
- **Build Tool**: React Scripts (Create React App)

### Project Structure
```
├── public/index.html          # Static entry point
├── src/
│   ├── App.jsx               # Main React application
│   ├── components/           # React components
│   │   ├── MeetingForm.*     # Meeting URL input and template selection
│   │   ├── MeetingMinutes.*  # Generated meeting notes display
│   │   ├── ShareModal.*      # Share functionality modal
│   │   └── SuccessAnimation.*# Success feedback animation
│   └── hooks/                # Custom React hooks
│       ├── useParticles.js   # Particles.js integration
│       └── useTypingAnimation.js # Typing effect animations
```

## Configuration

### Environment Variables
The application uses environment variables for configuration:

- `REACT_APP_BACKEND_URL`: Backend API URL for transcript generation

### Setup
1. Copy `.env.example` to `.env` for local development
2. Update `REACT_APP_BACKEND_URL` with your backend API URL
3. For production deployment, set `REACT_APP_BACKEND_URL` as a GitHub secret

## Development

### Local Development
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm start
# Opens http://localhost:3000

# Build for production
npm run build

# Serve production build
npm run serve
# Serves on http://localhost:8000
```

### Alternative Static Serving
```bash
# From public directory
cd public
python3 -m http.server 8000
```

## Features

### Core Functionality
- **Meeting Templates**: Standard, Client, Scrum, and Standup meeting formats
- **Meeting Notes**: Dynamic meeting minutes generation
- **Export Options**: PDF download and sharing functionality
- **Visual Effects**: Particle backgrounds and typing animations

### UI/UX Features
- **Glassmorphism Design**: Modern frosted glass aesthetic
- **Dark Theme**: Purple/blue gradient color scheme (#150429 base)
- **Responsive Layout**: Bootstrap grid with mobile-first design
- **Interactive Animations**: Success feedback and typing effects
- **Accessibility**: Semantic HTML and ARIA support

## Deployment

### Azure Static Web Apps
The application is configured for deployment to Azure Static Web Apps via GitHub Actions.

#### Required GitHub Secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Azure deployment token
- `REACT_APP_BACKEND_URL`: Backend API URL for production

#### Deployment Process:
1. Push to `main` branch triggers automatic deployment
2. Environment variables are injected during build
3. Static files are deployed to Azure

## Technical Notes

- Integrates with backend API for meeting transcript generation
- Modern React architecture with hooks and components
- Environment-based configuration for different deployment stages
- Glassmorphism UI with particle effects
