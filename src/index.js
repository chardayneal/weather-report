const DEFAULT_CITY = 'Seattle';

const TEMPS_IN_F = {
  cold: 50,
  cool: 60,
  warm: 70,
  hot: 80,
}

const LANDSCAPES = {
  hot: "🌵__🐍_🦂_🌵🌵__🐍_🏜_🦂",
  warm: "🌸🌿🌼__🌷🌻🌿_☘️🌱_🌻🌷",
  cool: "🌾🌾_🍃_🪨__🛤_🌾🌾🌾_🍃",
  cold: "🌲🌲⛄️🌲⛄️🍂🌲🍁🌲🌲⛄️🍂🌲"
};

const elements = {
  tempValue: document.getElementById('tempValue'),
  incrTempControl: document.getElementById('increaseTempControl'),
  decrTempControl: document.getElementById('decreaseTempControl'),
  landscape: document.getElementById('landscape'),
  cityNameInput: document.getElementById('cityNameInput'),
  headerCityName: document.getElementById('headerCityName'),
  currentTempButton: document.getElementById('currentTempButton')
};

const updateTemp = (incrementValue) => {
  let tempInF = parseInt(elements.tempValue.textContent) || NaN;
  if (isNaN(tempInF)) {
    tempInF = 0;
    console.error('Invalid temperature value detected, defaulting to 0');
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
  const color = tempInF < TEMPS_IN_F.cold ? 'teal'
                : tempInF < TEMPS_IN_F.cool ? 'green'
                : tempInF < TEMPS_IN_F.warm ? 'yellow'
                : tempInF < TEMPS_IN_F.hot ? 'orange'
                : 'red';
  elements.tempValue.style.color = color;
};

const updateLandscape = (tempInF) => {
  const landscape = tempInF < TEMPS_IN_F.cool ? LANDSCAPES.cold
                  : tempInF < TEMPS_IN_F.warm ? LANDSCAPES.cool
                  : tempInF < TEMPS_IN_F.hot ? LANDSCAPES.warm
                  : LANDSCAPES.hot;
  elements.landscape.textContent = landscape;
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

const displayWeatherForCity = async (cityName) => {
  try {
    const location = await getLocation(cityName);

    if (location) {
      const weather = await getWeather(location);

      if (weather) {
        handleWeatherData(weather);
      } else {
        console.log('Could not fetch weather for', cityName);
      }
    } else {
      console.log('Could not fetch location for', cityName);
    } 
  } catch (error) {
    console.log('Error during weather retrieval:', error.message);
    alert('An unexpected error occurred. Please try again.');
  }
};

const handleWeatherData = (weather) => {
  const tempInK = weather.main.temp;
  const tempInF = convertTemp(tempInK);
  elements.tempValue.textContent = tempInF;
  updateTempColor(tempInF);
  updateLandscape(tempInF);
};

const logError = (message, errorDetails) => {
  console.error(message, errorDetails);
};

const registerHandlers = () => {
  const {
    incrTempControl,
    decrTempControl,
    cityNameInput,
    headerCityName,
    currentTempButton,
  } = elements;

  cityNameInput.value = DEFAULT_CITY;
  headerCityName.textContent = DEFAULT_CITY;
  displayWeatherForCity(DEFAULT_CITY);

  incrTempControl.addEventListener('click', () => updateTemp(1));
  decrTempControl.addEventListener('click', () => updateTemp(-1));
  
  cityNameInput.addEventListener('input', () => {
    headerCityName.textContent = cityNameInput.value
  });

  currentTempButton.addEventListener('click', () => {
    const cityName = headerCityName.textContent.trim();

    if (!cityName) {
      alert('Please enter a city name.');
      return;
    }
    displayWeatherForCity(cityName);
  });
};

document.addEventListener('DOMContentLoaded', registerHandlers);