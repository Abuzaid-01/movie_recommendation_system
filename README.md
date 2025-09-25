# CineMatch - Movie Recommendation System

A modern, responsive movie recommendation web application built with vanilla JavaScript.

## Features

- 🎬 **3,363+ Movies Database** - Local CSV with API fallback
- 🔍 **Smart Search** - Autocomplete with dropdown suggestions
- 🎯 **Personalized Recommendations** - AI-powered suggestions
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Fast Performance** - Optimized with debounced search
- 🎨 **Modern UI** - Clean design with smooth animations

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend API**: FastAPI (Deployed on Render)
- **Database**: CSV file + API integration
- **Deployment**: Vercel
- **UI**: Custom CSS with CSS Grid/Flexbox
- **Icons**: Font Awesome

## Live Demo

🌐 **[View Live Demo](https://your-domain.vercel.app)**

## Local Development

```bash
# Clone the repository
git clone https://github.com/Abuzaid-01/cinematch.git

# Navigate to project directory
cd cinematch

# Open in browser
open index.html
```

## Project Structure

```
├── index.html          # Main HTML file
├── app.js             # JavaScript logic
├── style.css          # Styling
├── movie_names.csv    # Movie database (3,363 movies)
└── vercel.json        # Vercel deployment config
```

## Features Breakdown

### 🔍 Search System
- **Autocomplete dropdown** with movie suggestions
- **"Browse all movies" option** for complete database access
- **Smart filtering** with real-time results
- **Keyboard navigation** support

### 🎯 Recommendations
- **AI-powered recommendations** based on selected movies
- **Customizable recommendation count** (5, 8, 10, 15)
- **Detailed movie information** in modal popups

### 📊 Trending Movies
- **Top Rated movies** section
- **Random movie picks** for discovery
- **Interactive movie cards** with ratings

## API Integration

The app uses a FastAPI backend deployed on Render for:
- Movie search functionality
- Recommendation algorithms
- Trending movie data

**API Base URL**: `https://movie-recommendation-fcbf.onrender.com`

## Deployment

### Deploy on Vercel

1. **Connect your GitHub repository** to Vercel
2. **Automatic deployment** - No build process needed
3. **CSV file served as static asset** automatically

### Environment Setup

No environment variables needed - fully client-side application.

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Performance

- 📊 **Lighthouse Score**: 95+ Performance
- 🚀 **First Load**: < 2 seconds
- 💾 **Bundle Size**: ~120KB total

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

**Abuzaid** - [LinkedIn](https://www.linkedin.com/in/abuzaid01)

---

⭐ **Star this repository if you found it helpful!**
