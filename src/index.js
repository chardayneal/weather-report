const increaseTempControl = document.getElementById('increaseTempControl');
const tempValue = document.getElementById('tempValue');

const increaseTempHandler = () => {
  let newTemp = (parseInt(tempValue.textContent) + 1).toString();
  tempValue.textContent = newTemp;
  updateTempColor(newTemp);
};

const decreaseTempControl = document.getElementById('decreaseTempControl');
const decreaseTempHandler = () => {
  let newTemp = (parseInt(tempValue.textContent) - 1).toString();
  tempValue.textContent = newTemp;
  updateTempColor(newTemp);
};

const updateTempColor = (currTemp) => {
  let textColor = '';

  if (currTemp <= 49) {
    textColor = 'blue';
  } else if (currTemp >= 50 && currTemp < 60) {
    textColor = 'green';
  } else if (currTemp >= 60 && currTemp < 70) {
    textColor = 'yellow';    
  } else if (currTemp >= 70 && currTemp < 80) {
    textColor = 'orange';    
  } else {
    textColor = 'red';
  }
  tempValue.style.color = textColor;
};

// add event listener that registers our handlers to the DOM elements
const registerHandlers = () => {
  updateTempColor(tempValue.textContent);
  increaseTempControl.addEventListener('click', increaseTempHandler);
  decreaseTempControl.addEventListener('click', decreaseTempHandler);
};

document.addEventListener('DOMContentLoaded', registerHandlers);