// Global variables
const input = document.getElementById('input');
const searchBtn = document.getElementById('searchBtn');
const suggestions = document.querySelector('.suggestions');
const suggLoading = document.querySelector('.sugg-loading');
const cardsContainer = document.getElementById('cardsContainer');
const mainLoading = document.querySelector('.main-loading');
const themeColor = document.getElementById('themeColor');
const bgColor = document.getElementById('bgColor');
const removeArchiveBtn = document.getElementById('removeArchive');

// New feature elements
const outfitIcon = document.getElementById('outfitIcon');
const outfitText = document.getElementById('outfitText');
const outfitDetails = document.getElementById('outfitDetails');
const activitiesList = document.getElementById('activitiesList');

const mainUrl = "https://api.weatherapi.com/v1";
const apiKey = "dbc6887461184c36a7b95357232008";

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme
    loadSavedTheme();
    
    // Load archive
    if (localStorage.length > 0) {
        setupArchive();
    } else {
        mainLoading.style.display = 'none';
        removeArchiveBtn.style.display = 'none';
        showMessage('No cities added to archive yet.', 'info');
    }
});

// Apply theme function
function applyTheme(color) {
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Calculate secondary color based on primary color
    const secondaryColor = lightenColor(color, 20);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    
    localStorage.setItem('themeColor', color);
}

// Apply background color function
function applyBackgroundColor(color) {
    document.documentElement.style.setProperty('--background-color', color);
    
    // Calculate related colors for better readability
    const textColor = getTextColorForBackground(color);
    document.documentElement.style.setProperty('--text-color', textColor);
    
    const cardBg = lightenColor(color, 5);
    document.documentElement.style.setProperty('--card-bg', cardBg);
    
    localStorage.setItem('bgColor', color);
}

// Determine text color based on background color
function getTextColorForBackground(backgroundColor) {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Use dark text for light backgrounds, light text for dark backgrounds
    return brightness > 128 ? '#1e293b' : '#f1f5f9';
}

// Load saved theme
function loadSavedTheme() {
    const savedColor = localStorage.getItem('themeColor');
    if (savedColor) {
        applyTheme(savedColor);
        themeColor.value = savedColor;
    }
    
    const savedBgColor = localStorage.getItem('bgColor');
    if (savedBgColor) {
        applyBackgroundColor(savedBgColor);
        bgColor.value = savedBgColor;
    }
}

// Lighten color function
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Show message function
function showMessage(message, type = 'error') {
    // Remove existing messages
    const existingMessage = document.querySelector('.error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `error-message ${type === 'info' ? 'info-message' : ''}`;
    messageDiv.textContent = message;
    
    const archiveSection = document.querySelector('.archive-section');
    archiveSection.insertBefore(messageDiv, archiveSection.firstChild);
    
    // Auto remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// NEW FEATURE: Get outfit recommendation based on temperature and weather condition
function getOutfitRecommendation(temp, condition) {
    let outfit = {};
    let icon = 'fa-question';
    let description = '';
    
    // Determine outfit based on temperature
    if (temp < 5) {
        outfit = {
            top: 'Heavy coat or parka',
            bottom: 'Thermal pants or jeans',
            footwear: 'Boots',
            accessories: 'Gloves, scarf, and beanie',
            icon: 'fa-temperature-low',
            description: 'Very cold - Bundle up with warm layers'
        };
    } else if (temp < 15) {
        outfit = {
            top: 'Jacket or sweater',
            bottom: 'Long pants or jeans',
            footwear: 'Sneakers or closed shoes',
            accessories: 'Light scarf if windy',
            icon: 'fa-temperature-empty',
            description: 'Cool - Light jacket weather'
        };
    } else if (temp < 25) {
        outfit = {
            top: 'T-shirt or light sweater',
            bottom: 'Shorts or light pants',
            footwear: 'Sneakers or sandals',
            accessories: 'Sunglasses',
            icon: 'fa-temperature-half',
            description: 'Pleasant - Comfortable casual wear'
        };
    } else {
        outfit = {
            top: 'Tank top or light t-shirt',
            bottom: 'Shorts or light skirt',
            footwear: 'Sandals or breathable shoes',
            accessories: 'Sunglasses and hat',
            icon: 'fa-temperature-high',
            description: 'Warm - Light and breathable clothing'
        };
    }
    
    // Adjust for weather conditions
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) {
        outfit.footwear = 'Waterproof boots or shoes';
        outfit.accessories = 'Umbrella or raincoat, ' + outfit.accessories;
        outfit.icon = 'fa-cloud-rain';
        outfit.description = 'Rainy - Waterproof gear recommended';
    } else if (lowerCondition.includes('snow')) {
        outfit.footwear = 'Snow boots';
        outfit.accessories = 'Winter gloves, scarf, ' + outfit.accessories;
        outfit.icon = 'fa-snowflake';
        outfit.description = 'Snowy - Winter gear essential';
    } else if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
        outfit.accessories = 'Sunglasses, sunscreen, ' + outfit.accessories;
        outfit.icon = 'fa-sun';
        if (temp > 25) {
            outfit.description = 'Hot and sunny - Light clothing and sun protection';
        }
    }
    
    return outfit;
}

// NEW FEATURE: Get activity suggestions based on temperature and weather condition
function getActivitySuggestions(temp, condition) {
    let activities = [];
    const lowerCondition = condition.toLowerCase();
    
    // Base activities on temperature
    if (temp < 5) {
        activities = [
            'Visit a museum or art gallery',
            'Enjoy hot chocolate at a café',
            'Go ice skating (if available)',
            'Read a book by the fireplace',
            'Try indoor rock climbing'
        ];
    } else if (temp < 15) {
        activities = [
            'Go for a brisk walk',
            'Visit a local market',
            'Explore historical sites',
            'Try a new restaurant',
            'Go to a movie theater'
        ];
    } else if (temp < 25) {
        activities = [
            'Go for a bike ride',
            'Have a picnic in the park',
            'Visit a botanical garden',
            'Go hiking on nearby trails',
            'Try outdoor photography'
        ];
    } else {
        activities = [
            'Go swimming',
            'Visit a water park',
            'Have a barbecue',
            'Go to the beach',
            'Try water sports'
        ];
    }
    
    // Adjust activities based on weather conditions
    if (lowerCondition.includes('rain')) {
        activities = [
            'Visit a museum or gallery',
            'See a movie',
            'Go bowling',
            'Try an escape room',
            'Visit an indoor market'
        ];
    } else if (lowerCondition.includes('snow')) {
        activities = [
            'Go sledding',
            'Build a snowman',
            'Try skiing or snowboarding',
            'Have a snowball fight',
            'Drink hot cocoa by the fire'
        ];
    } else if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
        if (temp > 20) {
            activities.unshift('Go to the beach');
            activities.unshift('Have a picnic');
        }
        activities.unshift('Go for a hike');
    }
    
    return activities.slice(0, 5); // Return top 5 activities
}

// Display outfit recommendation
function displayOutfitRecommendation(temp, condition) {
    const outfit = getOutfitRecommendation(temp, condition);
    
    // Update outfit icon
    outfitIcon.innerHTML = `<i class="fas ${outfit.icon}"></i>`;
    
    // Update outfit text
    outfitText.textContent = outfit.description;
    
    // Update outfit details
    outfitDetails.innerHTML = `
        <div class="outfit-item">
            <i class="fas fa-tshirt"></i>
            <span>Top: ${outfit.top}</span>
        </div>
        <div class="outfit-item">
            <i class="fas fa-vest"></i>
            <span>Bottom: ${outfit.bottom}</span>
        </div>
        <div class="outfit-item">
            <i class="fas fa-shoe-prints"></i>
            <span>Footwear: ${outfit.footwear}</span>
        </div>
        <div class="outfit-item">
            <i class="fas fa-mitten"></i>
            <span>Accessories: ${outfit.accessories}</span>
        </div>
    `;
}

// Display activity suggestions
function displayActivitySuggestions(temp, condition) {
    const activities = getActivitySuggestions(temp, condition);
    
    // Clear existing activities
    activitiesList.innerHTML = '';
    
    // Add new activities
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${activity}</span>
        `;
        activitiesList.appendChild(activityItem);
    });
}

// Autocomplete function
async function autoComplete() {
    const query = input.value.trim();
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    showSuggestionsLoading();
    
    try {
        const url = `${mainUrl}/search.json?key=${apiKey}&q=${query}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error fetching suggestions');
        }
        
        const results = await response.json();
        displaySuggestions(results);
    } catch (error) {
        console.error('Error:', error);
        hideSuggestions();
    }
}

// Display suggestions
function displaySuggestions(results) {
    // Clear previous suggestions
    suggestions.innerHTML = '';
    
    if (results.length === 0) {
        hideSuggestions();
        return;
    }
    
    // Display max 5 suggestions
    for (let i = 0; i < Math.min(5, results.length); i++) {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = `${results[i].name}, ${results[i].region}, ${results[i].country}`;
        item.dataset.url = results[i].url;
        
        item.addEventListener('click', function() {
            input.value = results[i].name;
            hideSuggestions();
            getWeather(results[i].url);
        });
        
        suggestions.appendChild(item);
    }
    
    suggestions.style.display = 'block';
    suggLoading.style.display = 'none';
}

// Show suggestions loading
function showSuggestionsLoading() {
    suggestions.innerHTML = '';
    suggLoading.style.display = 'block';
    suggestions.style.display = 'block';
}

// Hide suggestions
function hideSuggestions() {
    suggestions.style.display = 'none';
    suggLoading.style.display = 'none';
}

// Get weather information
async function getWeather(value = null) {
    const city = value || input.value.trim();
    
    if (!city) {
        showMessage('Please enter a city name.');
        return;
    }
    
    // Check if city is not duplicate
    if (isCityInArchive(city)) {
        showMessage('This city is already in your archive.', 'info');
        return;
    }
    
    try {
        const url = `${mainUrl}/current.json?key=${apiKey}&q=${city}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error fetching weather data');
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        // Get city image
        const cityImage = await getCityImage(city);
        
        // Save to archive
        saveToArchive(city);
        
        // Display weather card
        displayWeatherCard(data, cityImage);
        
        // NEW: Display outfit recommendation and activity suggestions
        const temp = data.current.temp_c;
        const condition = data.current.condition.text;
        displayOutfitRecommendation(temp, condition);
        displayActivitySuggestions(temp, condition);
        
        // Clear search field
        input.value = '';
        
    } catch (error) {
        console.error('Error:', error);
        showMessage(`Error: ${error.message}`);
    }
}

// Check if city exists in archive
function isCityInArchive(city) {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('city_') && localStorage.getItem(key) === city) {
            return true;
        }
    }
    return false;
}

// Save city to archive
function saveToArchive(city) {
    const timestamp = new Date().getTime();
    localStorage.setItem(`city_${timestamp}`, city);
    
    // Show clear archive button
    removeArchiveBtn.style.display = 'flex';
}

// Get city image
async function getCityImage(city) {
    try {
        // Using Unsplash for images
        const unsplashAccessKey = 'YOUR_UNSPLASH_ACCESS_KEY'; // Add your key if needed
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${city}&page=1&per_page=1&client_id=${unsplashAccessKey}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.results.length > 0) {
                return data.results[0].urls.small;
            }
        }
    } catch (error) {
        console.warn('Error fetching city image:', error);
    }
    
    // Default image
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
}

// Display weather card
function displayWeatherCard(weatherData, cityImage) {
    const condition = weatherData.current.condition.text;
    const temp = Math.round(weatherData.current.temp_c);
    const location = `${weatherData.location.name}, ${weatherData.location.country}`;
    const lastUpdated = weatherData.current.last_updated;
    const icon = weatherData.current.condition.icon;
    
    // Determine class for weather condition
    let conditionClass = getConditionClass(condition);
    
    const cardHTML = `
        <div class="weather-card ${conditionClass}">
            <img src="${cityImage}" alt="${location}" class="city-image">
            <div class="weather-info">
                <div class="condition">${condition}</div>
                <div class="temperature">${temp}°C</div>
                <div class="details">
                    <div>${location}</div>
                    <div>Last updated: ${formatDate(lastUpdated)}</div>
                </div>
            </div>
            <img src="${icon}" alt="${condition}" class="weather-icon">
        </div>
    `;
    
    // Add card to the beginning of the list
    cardsContainer.insertAdjacentHTML('afterbegin', cardHTML);
    
    // Hide "no cities" message if exists
    const message = document.querySelector('.error-message.info-message');
    if (message) {
        message.remove();
    }
    
    // Hide loading
    mainLoading.style.display = 'none';
}

// Determine weather condition class
function getConditionClass(condition) {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
        return 'sunny';
    } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
        return 'cloudy';
    } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
        return 'rainy';
    } else if (lowerCondition.includes('snow') || lowerCondition.includes('sleet')) {
        return 'snowy';
    } else if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) {
        return 'stormy';
    } else {
        return '';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Setup archive
async function setupArchive() {
    mainLoading.style.display = 'block';
    
    try {
        // Get all saved cities
        const cities = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('city_')) {
                cities.push(localStorage.getItem(key));
            }
        }
        
        // Display weather cards
        for (const city of cities) {
            await getWeather(city);
        }
    } catch (error) {
        console.error('Error in setup:', error);
        showMessage('Error loading archive');
    } finally {
        mainLoading.style.display = 'none';
    }
}

// Event listeners
input.addEventListener('input', autoComplete);
input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        hideSuggestions();
        getWeather();
    }
});

searchBtn.addEventListener('click', function() {
    hideSuggestions();
    getWeather();
});

themeColor.addEventListener('input', function(e) {
    applyTheme(e.target.value);
});

bgColor.addEventListener('input', function(e) {
    applyBackgroundColor(e.target.value);
});

removeArchiveBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear the entire archive?')) {
        // Remove only cities from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('city_')) {
                localStorage.removeItem(key);
            }
        }
        
        // Clear cards
        cardsContainer.innerHTML = '';
        
        // Hide clear button
        removeArchiveBtn.style.display = 'none';
        
        // Show message
        showMessage('Archive cleared successfully.', 'info');
        
        // Show loading
        mainLoading.style.display = 'block';
        
        // Reset outfit and activity sections
        outfitIcon.innerHTML = '<i class="fas fa-question"></i>';
        outfitText.textContent = 'Select a city to see outfit recommendations';
        outfitDetails.innerHTML = '';
        activitiesList.innerHTML = '<p>Select a city to see activity suggestions</p>';
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-box')) {
        hideSuggestions();
    }
});