const temperatures = {
  cold: 50,
  cool: 60,
  warm: 70,
  hot: 80
}

const elements = {
  tempValue: document.getElementById('tempValue'),
  incrTempControl: document.getElementById('increaseTempControl'),
  decrTempControl: document.getElementById('decreaseTempControl'),
  landscape: document.getElementById('landscape'),
  cityNameInput: document.getElementById('cityNameInput'),
  headerCityName: document.getElementById('headerCityName')
};

const landscapes = {
  hot: "🌵__🐍_🦂_🌵🌵__🐍_🏜_🦂",
  warm: "🌸🌿🌼__🌷🌻🌿_☘️🌱_🌻🌷",
  cool: "🌾🌾_🍃_🪨__🛤_🌾🌾🌾_🍃",
  cold: "🌲🌲⛄️🌲⛄️🍂🌲🍁🌲🌲⛄️🍂🌲"
};

const updateTemp = (incrementValue) => {
  let temp = parseInt(tempValue.textContent) || NaN; // add logic to handle this
  const newTemp = temp + incrementValue;
  elements.tempValue.textContent = newTemp;
  updateTempColor(newTemp);
  updateLandscape(newTemp);
};

const updateTempColor = (temp) => {
  const color = temp < temperatures.cold ? 'teal'
                : temp < temperatures.cool ? 'green'
                : temp < temperatures.warm ? 'yellow'
                : temp < temperatures.hot ? 'orange'
                : 'red';
  elements.tempValue.style.color = color;
};

const updateLandscape = (temp) => {
  const landscape = temp < temperatures.cool ? landscapes.cold
                  : temp < temperatures.warm ? landscapes.cool
                  : temp < temperatures.hot ? landscapes.warm
                  : landscapes.hot;
  elements.landscape.textContent = landscape;
};

const registerHandlers = () => {
  const { incrTempControl, decrTempControl, tempValue } = elements;
  let initialTemp = parseInt(tempValue.textContent) || NaN; // add logic to handle this
  updateTempColor(initialTemp);
  updateLandscape(initialTemp);
  incrTempControl.addEventListener('click', () => updateTemp(1));
  decrTempControl.addEventListener('click', () => updateTemp(-1));
  cityNameInput.addEventListener('input', () => {
    headerCityName.textContent = cityNameInput.value
  });
};

document.addEventListener('DOMContentLoaded', registerHandlers);