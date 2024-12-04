const DEFAULT_CITY = 'Seattle';

const TEMPS_IN_F = {
  cold: 50,
  cool: 60,
  warm: 70,
  hot: 80,
}

const SKIES = {
  sunny: "☁️ ☁️ ☁️ ☀️ ☁️ ☁️",
  cloudy: "☁️☁️ ☁️ ☁️☁️ ☁️ 🌤 ☁️ ☁️☁️",
  rainy: "🌧🌈⛈🌧🌧💧⛈🌧🌦🌧💧🌧🌧",
  snowy: "🌨❄️🌨🌨❄️❄️🌨❄️🌨❄️❄️🌨🌨"
};

const LANDSCAPES = {
  hot: "🌵__🐍_🦂_🌵🌵__🐍_🏜_🦂",
  warm: "🌸🌿🌼__🌷🌻🌿_☘️🌱_🌻🌷",
  cool: "🌾🌾_🍃_🪨__🛤_🌾🌾🌾_🍃",
  cold: "🌲🌲⛄️🌲⛄️🍂🌲🍁🌲🌲⛄️🍂🌲"
};

const getElement = (id) => document.getElementById(id);
const elements = {
  tempValue: getElement('tempValue'),
  incrTempControl: getElement('increaseTempControl'),
  decrTempControl: getElement('decreaseTempControl'),
  landscape: getElement('landscape'),
  cityNameInput: getElement('cityNameInput'),
  headerCityName: getElement('headerCityName'),
  currentTempButton: getElement('currentTempButton'),
  skySelect: getElement('skySelect'),
  sky: getElement('sky'),
};

const updateSky = (selectedSky) => {
  const skyText = SKIES[selectedSky] || SKIES.sunny;
  elements.sky.textContent = skyText;
};

const updateTemp = (incrementValue) => {
  let tempInF = parseInt(elements.tempValue.textContent) || NaN;
  if (isNaN(tempInF)) {
    tempInF = 0;
    logError('Invalid temperature value detected, defaulting to 0');
  }
  const newTempInF = tempInF + incrementValue;
  elements.tempValue.textContent = newTempInF;
  updateTempColor(newTempInF);
  updateLandscape(newTempInF);
};

const convertTemp = (tempInK) => {
  const tempInF = (tempInK - 273.15) * (9 / 5) + 32;
  return Math.round(tempInF);
};

const updateTempColor = (tempInF) => {  
  const category = getTemperatureCategory(tempInF);
  const colorMap = {
    cold: 'teal',
    cool: 'green',
    warm: 'yellow',
    hot: 'orange',
    veryHot: 'red',
  };
  elements.tempValue.style.color = colorMap[category];
};

const updateLandscape = (tempInF) => {
  const category = getTemperatureCategory(tempInF);
  const landscapeMap = {
    cold: LANDSCAPES.cold,
    cool: LANDSCAPES.cool,
    warm: LANDSCAPES.warm,
    hot: LANDSCAPES.hot,
  };
  elements.landscape.textContent = landscapeMap[category] || LANDSCAPES.hot;
};

const getTemperatureCategory = (tempInF) => {
  const thresholds = [
    { threshold: TEMPS_IN_F.cold, category: 'cold' },
    { threshold: TEMPS_IN_F.cool, category: 'cool' },
    { threshold: TEMPS_IN_F.warm, category: 'warm' },
    { threshold: TEMPS_IN_F.hot, category: 'hot' },
  ];
  
  const category = thresholds.find(t => tempInF < t.threshold);
  return category ? category.category : 'veryHot';
};


const getLocation = async (cityName) => {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/location?q=${cityName}`);
    const firstMatch = response.data.length > 0 ? response.data[0] : null;

    if (firstMatch) {
      const { lat, lon } = firstMatch;
      return { lat, lon };
    } else {
      logError('No location found for:', { cityName, });
      return null;
    }
  } catch (error) {
    logError('Error fetching location for city:', { cityName, message: error.message, });
    return null;
  }
};

const getWeather = async ({ lat, lon }) => {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/weather?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    logError('Error fetching weather for coordinates:', { coordinates: { lat, lon }, message: error.message, });
    return null;
  }
};

const displayWeatherForCity = async (cityName = DEFAULT_CITY) => {
  try {
    const location = await getLocation(cityName);

    if (location) {
      const weather = await getWeather(location);

      if (weather) {
        handleWeatherData(weather);
      } else {
        logError('Could not fetch weather for', { cityName });
      }
    } else {
      logError('Could not fetch location for', { cityName });
    } 
  } catch (error) {
    logError('Error during weather retrieval:', { message: error.message });
  }
};

const handleWeatherData = (weather) => {
  if (weather.main && weather.main.temp) {
    const tempInK = weather.main.temp;
    const tempInF = convertTemp(tempInK);
    elements.tempValue.textContent = tempInF;
    updateTempColor(tempInF);
    updateLandscape(tempInF);
  } else {
    logError('Invalid weather data received', weather);
  }
};

const logError = (message, errorDetails) => {
  console.error(message, errorDetails);
  displayErrorMessage(message);
};

const displayErrorMessage = (message) => {
  const errorMessageElement = getElement('errorMessage');
  errorMessageElement.textContent = message;
  errorMessageElement.style.display = 'block';
  setTimeout(() => {
    errorMessageElement.style.display = 'none';
  }, 5000);
};


const registerHandlers = () => {
  const {
    incrTempControl,
    decrTempControl,
    cityNameInput,
    headerCityName,
    currentTempButton,
    skySelect,
  } = elements;

  incrTempControl.addEventListener('click', () => updateTemp(1));
  decrTempControl.addEventListener('click', () => updateTemp(-1));
  
  cityNameInput.addEventListener('input', () => {
    headerCityName.textContent = cityNameInput.value
  });

  currentTempButton.addEventListener('click', () => {
    const cityName = headerCityName.textContent.trim();
    if (!cityName) {
      displayErrorMessage('Please enter a city name.');
      // alert('Please enter a city name.');
      return;
    }
    displayWeatherForCity(cityName);
  });
  
  skySelect.addEventListener('change', (event) => {
    const selectedSky = event.target.value;
    updateSky(selectedSky);
    });
};

document.addEventListener('DOMContentLoaded', () => {
  registerHandlers();
  displayWeatherForCity();
  cityNameInput.value = DEFAULT_CITY;
  headerCityName.textContent = DEFAULT_CITY;
  updateSky();
});