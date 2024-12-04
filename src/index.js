const DEFAULTS = {
  CITY: 'Seattle',
  SKY: 'sunny',
  LANDSCAPE: 'hot',
};

const WEATHER_CONFIG = {
  TEMP_SCHEME: [
    {
      category: 'cold',
      threshold: 50,
      color: 'teal',
      landscape: '🌲🌲⛄️🌲⛄️🍂🌲🍁🌲🌲⛄️🍂🌲',
    },
    {
      category: 'cool',
      threshold: 60,
      color: 'green',
      landscape: '🌾🌾_🍃_🪨__🛤_🌾🌾🌾_🍃',
    },
    {
      category: 'warm',
      threshold: 70,
      color: 'yellow',
      landscape: '🌸🌿🌼__🌷🌻🌿_☘️🌱_🌻🌷',
    },
    {
      category: 'hot',
      threshold: 80,
      color: 'orange',
      landscape: '🌵__🐍_🦂_🌵🌵__🐍_🏜_🦂',
    },
    {
      category: 'veryHot',
      threshold: Infinity,
      color: 'red',
      landscape: null,
    },
  ],
  SKY_VIEWS: {
    sunny: "☁️ ☁️ ☁️ ☀️ ☁️ ☁️",
    cloudy: "☁️☁️ ☁️ ☁️☁️ ☁️ 🌤 ☁️ ☁️☁️",
    rainy: "🌧🌈⛈🌧🌧💧⛈🌧🌦🌧💧🌧🌧",
    snowy: "🌨❄️🌨🌨❄️❄️🌨❄️🌨❄️❄️🌨🌨"
  },
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
  errorMessage: getElement('errorMessage'),
  cityNameReset: getElement('cityNameReset'),
};

const resetUI = () => {
  elements.cityNameInput.value = DEFAULTS.CITY;
  elements.headerCityName.textContent = DEFAULTS.CITY;
  elements.skySelect.value = DEFAULTS.SKY;
  updateSky();
  updateWeatherForCity();
};

const updateSky = (selectedSky = DEFAULTS.SKY) => {
  const skyText = WEATHER_CONFIG.SKY_VIEWS[selectedSky];
  elements.sky.textContent = skyText;
};

const updateWeatherForCity = async (cityName = DEFAULTS.CITY) => {
  if (!isValidCityName(cityName)) return;

  try {
    const location = await getCoordinates(cityName);
    if (location) {
      const weather = await getWeather(location);
      if (weather) {
        handleWeatherData(weather);
      }
    }
  } catch (error) {
    logError('Error during weather retrieval:', { message: error.message });
  }
};

const isValidCityName = (cityName) => {
  if (!cityName) {
    displayErrorMessage('Please enter a city name.');
    return false;
  }
  return true;
};

const getCoordinates = async (cityName) => {
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

const handleWeatherData = (weather) => {
  if (weather.main && weather.main.temp) {
    const tempInF = convertTemp(weather.main.temp);
    elements.tempValue.textContent = tempInF;
    updateUI(tempInF);
  } else {
    logError('Invalid weather data received', weather);
  }
};

const convertTemp = (tempInK) => {
  const tempInF = (tempInK - 273.15) * (9 / 5) + 32;
  return Math.round(tempInF);
};

const updateUI = (tempInF) => {
  const tempScheme = WEATHER_CONFIG.TEMP_SCHEME.find(({ threshold }) => tempInF < threshold) || {};
  const defaultLandscape = WEATHER_CONFIG.TEMP_SCHEME.find(
    scheme => scheme.category === DEFAULTS.LANDSCAPE
  )?.landscape;

  elements.tempValue.style.color = tempScheme.color || '';
  elements.landscape.textContent = tempScheme.landscape || defaultLandscape;
};

const updateTemp = (incrementValue) => {
  let tempInF = parseInt(elements.tempValue.textContent) || NaN;
  if (isNaN(tempInF)) {
    tempInF = 0;
    logError('Invalid temperature value detected, defaulting to 0');
  }
  const newTempInF = tempInF + incrementValue;
  elements.tempValue.textContent = newTempInF;
  updateUI(newTempInF);
};

const logError = (message, errorDetails) => {
  console.error(message, errorDetails);
  displayErrorMessage(message);
};

const displayErrorMessage = (message) => {
  const errorMessageElement = elements.errorMessage;
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
    currentTempButton,
    skySelect,
    cityNameReset,
  } = elements;

  incrTempControl.addEventListener('click', () => updateTemp(1));
  decrTempControl.addEventListener('click', () => updateTemp(-1));
  
  cityNameInput.addEventListener('input', () => {
    elements.headerCityName.textContent = elements.cityNameInput.value
  });

  currentTempButton.addEventListener('click', () => {
    const cityName = elements.headerCityName.textContent.trim();
    updateWeatherForCity(cityName);
  });
  
  skySelect.addEventListener('change', (event) => {
    const selectedSky = event.target.value;
    updateSky(selectedSky);
    });

  cityNameReset.addEventListener('click', () => {
    resetUI();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  registerHandlers();
  resetUI();
  // updateSky();
  updateWeatherForCity();
});