# Sophia — AI Voice & Chat Assistant

A modern, glassmorphism-styled AI assistant that combines text chat and voice interaction capabilities. Sophia can engage in natural conversations through both typing and speaking, with real-time voice synthesis and speech recognition.

## 🌟 Features

- **Dual Interaction Modes**: Text chat and voice conversation
- **Modern Glassmorphism UI**: Beautiful, translucent interface with neon accents
- **Real-time Voice Synthesis**: Natural-sounding AI responses using ElevenLabs
- **Speech Recognition**: Voice input with automatic processing
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Continuous Voice Mode**: Natural back-and-forth voice conversations
- **Smart State Management**: Visual feedback for listening, processing, and speaking states

## 🛠️ Backend Technologies

### Core Framework
- **FastAPI**: High-performance Python web framework for building APIs
- **Uvicorn**: ASGI server for running the FastAPI application

### AI & Language Processing
- **OpenRouter**: API service for accessing various large language models
  - Provides access to models like GPT-4, Claude, and other state-of-the-art LLMs
  - Handles conversation context and generates intelligent responses
  - Cost-effective alternative to direct API access

### Voice Technologies
- **ElevenLabs**: Advanced text-to-speech (TTS) service
  - High-quality, natural-sounding voice synthesis
  - Multiple voice options and languages
  - Real-time audio generation for AI responses

### Additional Dependencies
- **Python 3.11+**: Core runtime environment
- **Pydantic**: Data validation and settings management
- **Requests**: HTTP client for API communications
- **CORS**: Cross-origin resource sharing for frontend-backend communication

## 🎨 Frontend Technologies

### Core Framework
- **React 19**: Modern JavaScript library for building user interfaces
- **Create React App**: Standard toolchain for React applications

### Styling & UI
- **Tailwind CSS v4**: Utility-first CSS framework for rapid UI development
- **Framer Motion**: Animation library for smooth transitions and interactions
- **Custom Glassmorphism**: Semi-transparent, blurred UI elements with neon accents

### Voice & Audio
- **Web Speech API**: Browser-native speech recognition
- **HTML5 Audio**: Audio playback for TTS responses

### Fonts & Typography
- **Inter & Poppins**: Modern, clean typography for enhanced readability

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Python 3.11+**
- **pip** (Python package manager)

### Backend Setup

1. **Navigate to the project root**:
   ```bash
   cd /Users/labdhpurohit/Documents/Other_Works/100x.inc
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the root directory with your API keys:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

5. **Start the backend server**:
   ```bash
   python main.py
   ```
   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd voicebot-frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### API Keys Setup

1. **OpenRouter API Key**:
   - Visit [OpenRouter](https://openrouter.ai/)
   - Create an account and generate an API key
   - Add it to your `.env` file

2. **ElevenLabs API Key**:
   - Visit [ElevenLabs](https://elevenlabs.io/)
   - Sign up and get your API key
   - Add it to your `.env` file

### Backend Configuration

The backend is configured to use:
- **Model**: `openrouter/anthropic/claude-3.5-sonnet` (configurable in `main.py`)
- **Voice**: ElevenLabs default voice (configurable)
- **CORS**: Enabled for frontend communication

### Frontend Configuration

- **API Endpoint**: Configured to connect to `http://13.211.175.13:8000` (update in `App.js` if needed)
- **Voice Settings**: Optimized for Chrome/Edge browsers
- **Responsive Breakpoints**: Mobile-first design with desktop enhancements

## 📱 Usage

### Text Chat
1. Type your message in the input field
2. Press Enter or click "Send"
3. Sophia will respond with text in the chat

### Voice Mode
1. Click the microphone button next to "Send"
2. Grant microphone permissions when prompted
3. Speak your message
4. Sophia will process and respond with voice
5. The conversation continues automatically until you close the modal

### Features Overview
- **How to Use**: Click the "How to use" button in the header for guidance
- **Voice States**: Visual indicators show listening, processing, and speaking states
- **Auto-restart**: Voice mode automatically resumes listening after each response
- **Error Handling**: Graceful fallbacks for network issues and API errors

## 🏗️ Project Structure

```
100x.inc/
├── main.py                 # FastAPI backend server
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (create this)
├── voicebot-frontend/     # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles with Tailwind
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── package.json       # Node.js dependencies
│   └── postcss.config.js  # Tailwind CSS configuration
└── README.md              # This file
```

## 🔒 Security Notes

- Keep your API keys secure and never commit them to version control
- The `.env` file is included in `.gitignore` for security
- CORS is configured for development; adjust for production deployment

## 🐛 Troubleshooting

### Common Issues

1. **Voice not working**:
   - Ensure microphone permissions are granted
   - Check browser compatibility (Chrome/Edge recommended)
   - Verify backend is running and accessible

2. **API errors**:
   - Verify API keys are correctly set in `.env`
   - Check internet connection
   - Ensure backend server is running

3. **Styling issues**:
   - Clear browser cache
   - Restart the development server
   - Verify Tailwind CSS is properly configured

### Browser Compatibility

- **Chrome/Edge**: Full support for all features
- **Firefox**: Basic support, some voice features may be limited
- **Safari**: Limited voice support

## 📄 License

This project is for educational and development purposes. Please ensure compliance with the terms of service for OpenRouter and ElevenLabs APIs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the API documentation for OpenRouter and ElevenLabs
- Ensure all dependencies are properly installed and configured
