const API_KEY = "2370031a4f8b832b7bd96e88d729561f";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface ForecastDay {
  date: string;
  temp: number;
  condition: string;
  description: string;
  icon: string;
}

export interface CityWeather {
  id: number;
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  icon: string;
  forecast: ForecastDay[];
}

export async function fetchWeatherData(cityName: string): Promise<CityWeather> {
  const currentResponse = await fetch(
    `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`
  );
  if (!currentResponse.ok) throw new Error("City not found");
  const currentData = await currentResponse.json();

  const forecastResponse = await fetch(
    `${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
  );
  const forecastData = await forecastResponse.json();

  const dailyForecast: ForecastDay[] = [];
  const processedDates = new Set();

  if (forecastData.list) {
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toDateString();
      const hour = new Date(item.dt * 1000).getHours();

      if (!processedDates.has(date) && hour >= 12) {
        dailyForecast.push({
          date,
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        });
        processedDates.add(date);
      }
    });
  }

  return {
    id: currentData.id,
    city: currentData.name,
    country: currentData.sys.country,
    temperature: Math.round(currentData.main.temp),
    feelsLike: Math.round(currentData.main.feels_like),
    condition: currentData.weather[0].main,
    description: currentData.weather[0].description,
    humidity: currentData.main.humidity,
    windSpeed: currentData.wind.speed,
    visibility: currentData.visibility ? currentData.visibility / 1000 : 0,
    pressure: currentData.main.pressure,
    icon: currentData.weather[0].icon,
    forecast: dailyForecast.slice(0, 5),
  };
}
