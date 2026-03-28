# The Odin Project: Weather App

## Features

* **Live Weather Data:** Fetches real-time, 7-day, and hourly forecast data using the Visual Crossing Weather API.
* **Interactive Forecasts:** Clicking on any daily forecast card dynamically updates the 24-hour scrollable timeline below it.
* **Unit Toggling:** Seamlessly switch between Celsius (Metric) and Fahrenheit (US).

## What I Learned

Building this app was a deep dive into the "infectious" nature of asynchronous JavaScript. Key takeaways include:

1.  **Promise Management:** Learning that any function relying on fetched data must itself become asynchronous, and how to properly chain `await` to prevent race conditions.
2.  **Cache Invalidation vs. Re-fetching:** Deciding to re-fetch data on unit toggles to ensure high accuracy and sidestep complex local cache invalidation logic.
3.  **Native Date Parsing:** Utilizing native JS `Date` objects and string manipulation (`.slice()`, `.replaceAll()`) to format API timestamp strings cleanly.
4.  **DRY Principle:** Refactoring repetitive DOM generation loops into reusable helper functions (`renderHourlyForecast()`) for cleaner, modular architecture.
