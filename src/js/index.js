import "../css/style.css";

// const locationInput = document.querySelector("#location-input");
const errorMsg = document.querySelector("#error-msg");
const unitInput = document.querySelector("#unit-input");
const form = document.querySelector("#search-form");
const btnCelcius = document.querySelector("#btn-c");
const btnFahrenheit = document.querySelector("#btn-f");
const cityName = document.querySelector("#city-name");
const currentIcon = document.querySelector("#current-icon");
const currentTemp = document.querySelector("#current-temp");
const currentDesc = document.querySelector("#current-desc");
const dailyContainer = document.querySelector("#daily-container");
const hourlyContainer = document.querySelector("#hourly-container");

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

let lastValidLocation = "Jakarta";

async function fetchData(params) {
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${params.location}/next7days?unitGroup=${params.unit}&key=${API_KEY}&contentType=json`,
  );

  if (!response.ok) {
    const rawError = await response.text();
    const prettyError = rawError.replace(/:(?=[^\s])/g, ": ");
    throw new Error(`${response.status}. ${prettyError}`);
  }

  const result = await response.json();
  console.log(result);
  return result;
}

function renderHourlyForecast(hoursArray, currentUnit) {
  hourlyContainer.innerHTML = "";

  hoursArray.forEach((hour) => {
    const displayTime = hour.datetime.slice(0, 5);

    const hourlyItem = document.createElement("div");
    hourlyItem.className = "hourly-item";

    const time = document.createElement("p");
    time.textContent = displayTime;

    hourlyItem.appendChild(time);

    const hourlyWeatherIcon = document.createElement("div");
    hourlyWeatherIcon.className = "icon-placeholder";
    hourlyWeatherIcon.textContent = iconSet[hour.icon];

    hourlyItem.appendChild(hourlyWeatherIcon);

    const hourlyTemp = document.createElement("p");
    hourlyTemp.textContent =
      currentUnit === "metric" ? `${hour.temp}°C` : `${hour.temp}°F`;

    hourlyItem.appendChild(hourlyTemp);

    hourlyContainer.appendChild(hourlyItem);
  });
}

async function handleSubmit(fetchMethod) {
  errorMsg.classList.remove("error-active");

  try {
    cityName.textContent = "Loading...";
    const result = await fetchMethod();
    const currentUnit = unitInput.value;

    // Store resolvedAddress for fallback
    // when input is cleared/empty but user change measurement unit
    // preventing bugs mentioned in form submit event listener
    lastValidLocation = result.resolvedAddress;

    cityName.textContent = result.resolvedAddress;
    currentIcon.textContent = iconSet[result.currentConditions.icon];
    currentTemp.textContent =
      currentUnit === "metric"
        ? `${result.currentConditions.temp}°C`
        : `${result.currentConditions.temp}°F`;
    currentDesc.textContent = result.description;

    dailyContainer.innerHTML = "";

    renderHourlyForecast(result.days[0].hours, currentUnit);

    result.days.forEach((day, index) => {
      const isToday = index === 0;

      const dateObj = new Date(day.datetime + "T00:00:00");

      const forecastCard = document.createElement("div");
      forecastCard.className = "forecast-card box";

      const dayName = document.createElement("h4");
      dayName.textContent = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
      });

      forecastCard.appendChild(dayName);

      const date = document.createElement("p");
      date.className = "date";
      date.textContent = dateObj.toLocaleDateString().replaceAll("/", "-");

      forecastCard.appendChild(date);

      const dayWeatherIcon = document.createElement("div");
      dayWeatherIcon.className = "icon-placeholder";
      dayWeatherIcon.textContent = iconSet[day.icon];

      forecastCard.appendChild(dayWeatherIcon);

      const maxTemp = document.createElement("p");
      maxTemp.className = "max";
      maxTemp.textContent =
        currentUnit === "metric"
          ? `Max: ${day.tempmax}°C`
          : `Max: ${day.tempmax}°F`;

      forecastCard.appendChild(maxTemp);

      const minTemp = document.createElement("p");
      minTemp.className = "min";
      minTemp.textContent =
        currentUnit === "metric"
          ? `Min: ${day.tempmin}°C`
          : `Min: ${day.tempmin}°F`;

      forecastCard.appendChild(minTemp);

      if (isToday) {
        forecastCard.classList.add("active-card");
        dayName.textContent = `${dateObj.toLocaleDateString("en-US", { weekday: "long" })} [Today]`;
      }

      forecastCard.addEventListener("click", (e) => {
        if (e.target.className.includes("active-card")) return;

        renderHourlyForecast(day.hours, currentUnit);
      });

      dailyContainer.appendChild(forecastCard);
    });
  } catch (error) {
    errorMsg.classList.add("error-active");
    errorMsg.textContent = error;
    cityName.textContent = "Search Failed";
  }
}

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
  form.dispatchEvent(new Event("submit"));
});

btnFahrenheit.addEventListener("click", (e) => {
  handleUnitChange("us");
  btnCelcius.classList.remove("active-unit");
  e.target.classList.add("active-unit");
  form.dispatchEvent(new Event("submit"));
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // BUGS
  // outright denying submit when location input is empty turns out introduce a bugs,
  // when changing measurement unit while the location input is empty,
  // it will not change the meeasurement unit because the location input is empty thus preventing data fetching
  // if (!locationInput.value.trim()) {
  //   throw new Error("Please enter a valid location");
  // }

  const params = Object.fromEntries(new FormData(form));
  if (!params.location.trim()) {
    if (!lastValidLocation) {
      params.location = "Jakarta";
    } else {
      params.location = lastValidLocation;
    }
  }
  handleSubmit(() => fetchData(params));
});

dailyContainer.addEventListener("click", (e) => {
  const clickedCard = e.target.closest(".forecast-card");

  if (!clickedCard) return;
  if (clickedCard.className.includes("active-card")) return;

  const allDaysCards = dailyContainer.querySelectorAll(".forecast-card");
  allDaysCards.forEach((div) => div.classList.remove("active-card"));

  clickedCard.classList.add("active-card");
});

document.addEventListener("DOMContentLoaded", () => {
  handleSubmit(() => fetchData({ location: "Jakarta", unit: "metric" }));
});
