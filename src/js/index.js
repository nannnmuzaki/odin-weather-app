import "../css/style.css";

const locationInput = document.querySelector("#location-input");
const unitInput = document.querySelector("#unit-input");
const form = document.querySelector("#search-form");
const btnCelcius = document.querySelector("#btn-c");
const btnFahrenheit = document.querySelector("#btn-f");
const cityName = document.querySelector("#city-name");
const currentIcon = document.querySelector("#current-icon");
const currentTemp = document.querySelector("#current-temp");
const currentDesc = document.querySelector("#current-desc");
const dailyContainer = document.querySelector("daily-container");

const API_KEY = "LYBS32AX2JZKV2WH5AQAWVK6Q";
const iconSet = {
  snow: "❄️",
  rain: "🌧️",
  fog: "🌁",
  wind: "🍃",
  cloudy: "☁️",
  "partly-cloudy-day": "⛅",
  "partly-cloudy-night": "☁️",
  "clear-day": "☀️",
  "clear-night": "🌙",
};

function handleUnitChange(selectedUnit) {
  if (selectedUnit !== "metric" && selectedUnit !== "us") {
    throw new Error("Please choose a valid measurment unit");
  }

  unitInput.value = selectedUnit;
}

btnCelcius.addEventListener("click", (e) => {
  handleUnitChange("metric");
  btnFahrenheit.classList.remove("active-unit");
  e.target.classList.add("active-unit");
});

btnFahrenheit.addEventListener("click", (e) => {
  handleUnitChange("us");
  btnCelcius.classList.remove("active-unit");
  e.target.classList.add("active-unit");
});

async function fetchData(params) {
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${params.location}/next7days?unitGroup=${params.unit}&key=${API_KEY}&contentType=json`,
  );
  const result = await response.json();
  console.log(result);
  return result;
}

async function handleSubmit(params) {
  const result = await fetchData(params);
  const currentUnit = unitInput.value;

  cityName.textContent = result.resolvedAddress;
  currentIcon.textContent = iconSet[result.currentConditions.icon];
  currentTemp.textContent =
    currentUnit === "metric"
      ? `${result.currentConditions.temp}°C`
      : `${result.currentConditions.temp}°F`;
  currentDesc.textContent = result.description;

  // result.days.forEach((day) => {
  //   const forecastCard = document.createElement("div");
  // }); WIP
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!locationInput.value.trim()) {
    throw new Error("Please enter a valid location");
  }

  const params = Object.fromEntries(new FormData(form));
  handleSubmit(params);
});
