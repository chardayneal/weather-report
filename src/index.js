const DEFAULT_CITY = 'Seattle';
const DEFAULT_SKY = 'sunny';

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
  errorMessage: getElement('errorMessage'),
  cityNameReset: getElement('cityNameReset'),
};

const updateSky = (selectedSky = 'sunny') => {
  const skyText = SKIES[selectedSky];
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
  updateUI(newTempInF);
};

const convertTemp = (tempInK) => {
  const tempInF = (tempInK - 273.15) * (9 / 5) + 32;
  return Math.round(tempInF);
};

const updateUI = (tempInF) => {
  const category = getTemperatureCategory(tempInF);

  const colorMap = {
    cold: 'teal',
    cool: 'green',
    warm: 'yellow',
    hot: 'orange',
    veryHot: 'red',
  };

  const landscapeMap = {
    cold: LANDSCAPES.cold,
    cool: LANDSCAPES.cool,
    warm: LANDSCAPES.warm,
    hot: LANDSCAPES.hot,
  };

  elements.tempValue.style.color = colorMap[category];
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

const updateWeatherForCity = async (cityName = DEFAULT_CITY) => {
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

const handleWeatherData = (weather) => {
  if (weather.main && weather.main.temp) {
    const tempInF = convertTemp(weather.main.temp);
    elements.tempValue.textContent = tempInF;
    updateUI(tempInF);
  } else {
    logError('Invalid weather data received', weather);
  }
};

// check on defining constants
const resetUI = () => {
  elements.cityNameInput.value = DEFAULT_CITY;
  elements.headerCityName.textContent = DEFAULT_CITY;
  elements.skySelect.value = DEFAULT_SKY;
  updateSky();
  updateWeatherForCity();
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
  updateWeatherForCity();
  updateSky();
});