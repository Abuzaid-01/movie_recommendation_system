// Movie Recommendation App
class MovieApp {
    constructor() {
        this.API_BASE = 'https://movie-recommendation-fcbf.onrender.com';
        this.allMovieTitles = [];
        this.currentDropdown = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
        await this.loadAllMovieTitles();
        await this.loadTrendingMovies('top-rated');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const target = link.getAttribute('href');
                document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Search inputs with dropdown
        this.setupSearchWithDropdown('hero-search', 'hero-dropdown');
        this.setupSearchWithDropdown('recommendation-input', 'recommendation-dropdown');

        // Clear recommendations when input is cleared
        document.getElementById('recommendation-input').addEventListener('input', (e) => {
            if (e.target.value.trim() === '') {
                this.clearRecommendations();
            }
        });

        // Search button
        document.getElementById('hero-search-btn').addEventListener('click', () => {
            this.searchMovies(document.getElementById('hero-search').value);
        });

        // Clear search button
        document.getElementById('clear-search-btn').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('recommendation-btn').addEventListener('click', () => {
            this.getRecommendations();
        });

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.getAttribute('data-tab');
                this.loadTrendingMovies(tab);
            });
        });

        // Modal
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('movie-modal').addEventListener('click', (e) => {
            if (e.target.id === 'movie-modal') {
                this.closeModal();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideAllDropdowns();
            }
        });

        // Enter key for search inputs
        document.querySelectorAll('.search-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const inputId = input.id;
                    if (inputId === 'hero-search') {
                        this.searchMovies(input.value);
                    } else if (inputId === 'recommendation-input') {
                        this.getRecommendations();
                    }
                }
            });
        });
    }

    setupSearchWithDropdown(inputId, dropdownId) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        let debounceTimer;

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (query.length >= 2) {
                    this.showDropdownSuggestions(query, dropdown, input);
                } else if (query.length === 0) {
                    // Show popular movies when input is empty
                    this.showPopularMovies(dropdown, input);
                } else {
                    this.hideDropdown(dropdown);
                }
            }, 300);
        });

        input.addEventListener('focus', () => {
            const query = input.value.trim();
            if (query.length >= 2) {
                this.showDropdownSuggestions(query, dropdown, input);
            } else if (query.length === 0) {
                // Show popular movies when focused on empty input
                this.showPopularMovies(dropdown, input);
            }
        });

        // Add click event to show all movies option
        input.addEventListener('click', () => {
            if (input.value.trim().length === 0) {
                this.showPopularMovies(dropdown, input);
            }
        });
    }

    showDropdownSuggestions(query, dropdown, input) {
        const suggestions = this.allMovieTitles
            .filter(title => title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 15); // Show more suggestions

        if (suggestions.length === 0) {
            dropdown.innerHTML = '<div class="dropdown-item no-results">No movies found</div>';
            this.showDropdown(dropdown);
            return;
        }

        dropdown.innerHTML = '';
        
        // Add "Show All Movies" option if query matches many movies
        const totalMatches = this.allMovieTitles.filter(title => 
            title.toLowerCase().includes(query.toLowerCase())
        ).length;
        
        if (totalMatches > 15) {
            const showAllItem = document.createElement('div');
            showAllItem.className = 'dropdown-item show-all';
            showAllItem.innerHTML = `<i class="fas fa-list"></i> Show all ${totalMatches} movies`;
            showAllItem.addEventListener('click', () => {
                this.showAllMoviesModal(query);
                this.hideDropdown(dropdown);
            });
            dropdown.appendChild(showAllItem);
        }

        suggestions.forEach(title => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = title;
            item.addEventListener('click', () => {
                input.value = title;
                this.hideDropdown(dropdown);
            });
            dropdown.appendChild(item);
        });

        this.showDropdown(dropdown);
    }

    showPopularMovies(dropdown, input) {
        if (this.allMovieTitles.length === 0) return;

        dropdown.innerHTML = '';
        
        // Add "Browse All Movies" option
        const browseAllItem = document.createElement('div');
        browseAllItem.className = 'dropdown-item browse-all';
        browseAllItem.innerHTML = `<i class="fas fa-film"></i> Browse all ${this.allMovieTitles.length} movies`;
        browseAllItem.addEventListener('click', () => {
            this.showAllMoviesModal();
            this.hideDropdown(dropdown);
        });
        dropdown.appendChild(browseAllItem);

        // Show some popular/random movies
        const popularMovies = this.getPopularMoviesSample();
        
        if (popularMovies.length > 0) {
            const divider = document.createElement('div');
            divider.className = 'dropdown-divider';
            divider.textContent = 'Popular Movies';
            dropdown.appendChild(divider);

            popularMovies.forEach(title => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.textContent = title;
                item.addEventListener('click', () => {
                    input.value = title;
                    this.hideDropdown(dropdown);
                });
                dropdown.appendChild(item);
            });
        }

        this.showDropdown(dropdown);
    }

    getPopularMoviesSample() {
        // Return a sample of movies - you can customize this logic
        // For now, return first 10 movies and some random ones
        const popular = [];
        
        // Add some well-known movies if they exist in the list
        const knownMovies = [
            'The Godfather', 'Inception', 'The Dark Knight', 'Pulp Fiction',
            'Forrest Gump', 'The Matrix', 'Goodfellas', 'The Lord of the Rings',
            'Star Wars', 'Titanic', 'Avatar', 'Avengers'
        ];
        
        knownMovies.forEach(movie => {
            const found = this.allMovieTitles.find(title => 
                title.toLowerCase().includes(movie.toLowerCase())
            );
            if (found && popular.length < 8) {
                popular.push(found);
            }
        });
        
        // Fill remaining slots with random movies
        while (popular.length < 10 && popular.length < this.allMovieTitles.length) {
            const randomIndex = Math.floor(Math.random() * this.allMovieTitles.length);
            const randomMovie = this.allMovieTitles[randomIndex];
            if (!popular.includes(randomMovie)) {
                popular.push(randomMovie);
            }
        }
        
        return popular;
    }

    showAllMoviesModal(searchQuery = '') {
        const modal = document.getElementById('movie-modal');
        const modalBody = document.getElementById('modal-body');
        
        let moviesToShow = this.allMovieTitles;
        
        if (searchQuery) {
            moviesToShow = this.allMovieTitles.filter(title => 
                title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        modalBody.innerHTML = `
            <div class="movie-list-modal">
                <h2><i class="fas fa-film"></i> ${searchQuery ? `Movies matching "${searchQuery}"` : 'All Movies'} (${moviesToShow.length})</h2>
                <div class="movie-search-modal">
                    <input type="text" id="modal-search" placeholder="Search in list..." class="search-input">
                </div>
                <div class="movie-list-container">
                    ${moviesToShow.map(title => `
                        <div class="movie-list-item" data-title="${title}">
                            <i class="fas fa-play-circle"></i>
                            <span>${title}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add search functionality within modal
        const modalSearch = modalBody.querySelector('#modal-search');
        modalSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = modalBody.querySelectorAll('.movie-list-item');
            
            items.forEach(item => {
                const title = item.dataset.title.toLowerCase();
                if (title.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
        
        // Add click handlers for movie selection
        modalBody.querySelectorAll('.movie-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const title = item.dataset.title;
                // Fill all search inputs with selected movie
                document.querySelectorAll('.search-input').forEach(input => {
                    if (input.id !== 'modal-search') {
                        input.value = title;
                    }
                });
                this.closeModal();
            });
        });
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        modalSearch.focus();
    }

    clearSearch() {
        // Clear the search input
        document.getElementById('hero-search').value = '';
        
        // Hide the search results section
        const searchSection = document.getElementById('search-results-section');
        searchSection.style.display = 'none';
        
        // Scroll back to hero section
        document.getElementById('home').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        // Clear any dropdowns
        this.hideAllDropdowns();
    }

    clearRecommendations() {
        const resultsContainer = document.getElementById('recommendations-results');
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '';
    }

    showDropdown(dropdown) {
        this.hideAllDropdowns();
        dropdown.classList.add('show');
        this.currentDropdown = dropdown;
    }

    hideDropdown(dropdown) {
        dropdown.classList.remove('show');
        if (this.currentDropdown === dropdown) {
            this.currentDropdown = null;
        }
    }

    hideAllDropdowns() {
        document.querySelectorAll('.search-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        this.currentDropdown = null;
    }

    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    async loadAllMovieTitles() {
        try {
            this.showLoading();
            
            // First try to load from local CSV file
            try {
                const csvResponse = await fetch('./movie_names.csv');
                const csvText = await csvResponse.text();
                const lines = csvText.split('\n');
                
                // Skip header row and filter out empty lines
                this.allMovieTitles = lines
                    .slice(1)
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                
                console.log(`Loaded ${this.allMovieTitles.length} movie titles from CSV`);
                
                // If CSV loading successful, return early
                if (this.allMovieTitles.length > 0) {
                    return;
                }
            } catch (csvError) {
                console.log('CSV file not found or error reading, falling back to API');
            }
            
            // Fallback to API if CSV loading fails
            const response = await fetch(`${this.API_BASE}/movies/all-titles`);
            const data = await response.json();
            this.allMovieTitles = data.titles || [];
            console.log(`Loaded ${this.allMovieTitles.length} movie titles from API`);
            
        } catch (error) {
            console.error('Error loading movie titles:', error);
            this.showError('Failed to load movie database');
        } finally {
            this.hideLoading();
        }
    }

    async searchMovies(query) {
        if (!query || query.trim().length < 2) {
            this.showError('Please enter at least 2 characters to search');
            return;
        }

        try {
            this.showLoading();
            const response = await fetch(`${this.API_BASE}/movies/search?q=${encodeURIComponent(query.trim())}&limit=20`);
            const data = await response.json();
            
            this.displaySearchResults(data.movies || [], query);
            
            // Show search results section and scroll to it
            const searchSection = document.getElementById('search-results-section');
            searchSection.style.display = 'block';
            searchSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } catch (error) {
            console.error('Error searching movies:', error);
            this.showError('Failed to search movies. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async getRecommendations() {
        const movieTitle = document.getElementById('recommendation-input').value.trim();
        const numRecommendations = document.getElementById('num-recommendations').value;

        if (!movieTitle) {
            this.showError('Please select a movie for recommendations');
            return;
        }

        try {
            this.showLoading();
            const response = await fetch(`${this.API_BASE}/movies/recommend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movie_title: movieTitle,
                    num_recommendations: parseInt(numRecommendations)
                })
            });

            const data = await response.json();
            
            if (data.error) {
                this.displayRecommendationError(data.error, data.suggestions || []);
            } else {
                this.displayRecommendations(data.recommendations || [], movieTitle);
            }

            // Scroll to recommendations results
            document.getElementById('recommendations-results').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } catch (error) {
            console.error('Error getting recommendations:', error);
            this.showError('Failed to get recommendations. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async loadTrendingMovies(type = 'top-rated') {
        try {
            let endpoint;
            if (type === 'top-rated') {
                endpoint = `${this.API_BASE}/movies/top-rated?limit=12`;
            } else if (type === 'random') {
                endpoint = `${this.API_BASE}/movies/random?count=12`;
            }

            this.showLoading();
            const response = await fetch(endpoint);
            const data = await response.json();
            
            this.displayTrendingMovies(data.movies || []);
        } catch (error) {
            console.error('Error loading trending movies:', error);
            this.showError('Failed to load trending movies');
        } finally {
            this.hideLoading();
        }
    }

    displaySearchResults(movies, query = '') {
        const resultsContainer = document.getElementById('search-results');
        
        if (!movies || movies.length === 0) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-search"></i>
                    <h3>No movies found</h3>
                    <p>Try searching with different keywords or browse all movies from the search dropdown</p>
                </div>
            `;
            return;
        }

        const grid = this.createMovieGrid(movies);
        resultsContainer.innerHTML = `
            <div class="search-results-header-info">
                <h3>Found ${movies.length} movies${query ? ` for "${query}"` : ''}</h3>
            </div>
            ${grid}
        `;
    }

    displayRecommendations(recommendations, basedOn) {
        const resultsContainer = document.getElementById('recommendations-results');
        
        if (!recommendations || recommendations.length === 0) {
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>No recommendations found</h3>
                    <p>Try selecting a different movie</p>
                </div>
            `;
            return;
        }

        const grid = this.createMovieGrid(recommendations, false);
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3 style="margin-bottom: 2rem; color: var(--text-light);">
                Movies similar to "${basedOn}"
            </h3>
            ${grid}
        `;
    }

    displayRecommendationError(error, suggestions) {
        const resultsContainer = document.getElementById('recommendations-results');
        let suggestionsHtml = '';
        
        if (suggestions && suggestions.length > 0) {
            suggestionsHtml = `
                <div class="suggestions">
                    <h3>Did you mean one of these?</h3>
                    <div class="movie-grid">
                        ${suggestions.map(movie => this.createMovieCard(movie)).join('')}
                    </div>
                </div>
            `;
        }

        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Movie not found</h3>
                <p>${error}</p>
                ${suggestionsHtml}
            </div>
        `;

        // Add click handlers for suggestion cards
        this.addMovieCardHandlers(resultsContainer);
    }

    displayTrendingMovies(movies) {
        const resultsContainer = document.getElementById('trending-results');
        
        if (!movies || movies.length === 0) {
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-film"></i>
                    <h3>No movies available</h3>
                    <p>Please try again later</p>
                </div>
            `;
            return;
        }

        const grid = this.createMovieGrid(movies);
        resultsContainer.innerHTML = grid;
    }

    createMovieGrid(movies, showSimilarity = false) {
        const grid = movies.map(movie => this.createMovieCard(movie)).join('');
        return `<div class="movie-grid">${grid}</div>`;
    }

    createMovieCard(movie) {
        const posterUrl = movie.poster_path || '';
        const rating = parseFloat(movie.rating || 0);
        const stars = this.generateStarRating(rating);

        return `
            <div class="movie-card" data-movie='${JSON.stringify(movie)}'>
                ${posterUrl ? 
                    `<img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">` :
                    `<div class="movie-poster no-poster"><i class="fas fa-film"></i></div>`
                }
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-rating">
                        <span class="rating-stars">${stars}</span>
                        <span class="rating-value">${rating}/10</span>
                    </div>
                    <p class="movie-overview">${movie.overview || 'No overview available'}</p>
                </div>
            </div>
        `;
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating / 2);
        const halfStar = (rating % 2) >= 1;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (halfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }

    addMovieCardHandlers(container = document) {
        container.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                const movieData = JSON.parse(card.getAttribute('data-movie'));
                this.showMovieModal(movieData);
            });
        });
    }

    showMovieModal(movie) {
        const modal = document.getElementById('movie-modal');
        const modalBody = document.getElementById('modal-body');
        const posterUrl = movie.poster_path || '';
        const rating = parseFloat(movie.rating || 0);
        const stars = this.generateStarRating(rating);

        modalBody.innerHTML = `
            ${posterUrl ? 
                `<img src="${posterUrl}" alt="${movie.title}" class="modal-movie-poster">` :
                `<div class="modal-movie-poster no-poster" style="height: 400px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-film" style="font-size: 4rem; color: var(--text-gray);"></i>
                </div>`
            }
            <h2 class="modal-movie-title">${movie.title}</h2>
            <div class="modal-movie-rating">
                <span class="rating-stars">${stars}</span>
                <span class="rating-value">${rating}/10</span>
            </div>
            <p class="modal-movie-overview">${movie.overview || 'No overview available'}</p>
        `;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('movie-modal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    showLoading() {
        document.getElementById('loading-spinner').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loading-spinner').classList.remove('show');
    }

    showError(message) {
        // You could implement a toast notification system here
        console.error(message);
        alert(message); // Simple fallback
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MovieApp();
});