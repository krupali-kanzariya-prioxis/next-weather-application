"use client";
import React, { useState, useEffect } from "react";
import {Search, Star, Sun, Moon, Droplets, Wind, Eye, Thermometer, Calendar} from "lucide-react";
import { CityWeather, fetchWeatherData } from "./weatherapi";

export default function WeatherApp() {
  const [cities, setCities] = useState<CityWeather[]>([]);
  const [favoritesName, setFavoritesName] = useState<string[]>([]);
  const [favoriteCities, setFavoriteCities] = useState<CityWeather[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  const loadFavorites = async () => {
    const storedFavs = localStorage.getItem("favoritesName");
    if (storedFavs) {
      const favNames = JSON.parse(storedFavs);
      setFavoritesName(favNames);

      const favData = await Promise.all(
        favNames.map(async (cityName: string) => {
          try {
            return await fetchWeatherData(cityName);
          } catch {
            return null;
          }
        })
      );

      setFavoriteCities(favData.filter((c) => c !== null) as CityWeather[]);
    }
  };

  loadFavorites();
}, []);


  useEffect(() => {
    localStorage.setItem("cities", JSON.stringify(cities));
  }, [cities]);

  useEffect(() => {
    localStorage.setItem("favoritesName", JSON.stringify(favoritesName));
  }, [favoritesName]);

  const getCityKey = (city: { city: string }) =>
    `${city.city.toLowerCase()}`;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    setLoading(true);
    setError("");
    try {
      const weatherData = await fetchWeatherData(searchText);
      setCities([weatherData]);
      setSearchText("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (city: CityWeather) => {
    const key = getCityKey(city);

    setFavoritesName((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );

    setFavoriteCities((prev) => {
      if (favoritesName.includes(key)) {
        return prev.filter((c) => getCityKey(c) !== key);
      } else {
        if (!prev.some((c) => getCityKey(c) === key)) {
          return [...prev, city];
        }
        return prev;
      }
    });
  };

  const removeCity = (city: CityWeather) => {
    const key = getCityKey(city);
    setCities((prev) => prev.filter((c) => getCityKey(c) !== key));
    setFavoritesName((prev) => prev.filter((f) => f !== key));
    setFavoriteCities((prev) => prev.filter((c) => getCityKey(c) !== key));
  };

  const filteredCities = showFavoritesOnly ? favoriteCities : cities;

  return (
    <div className={`min-vh-100 p-4 ${isDarkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
      <h2 className="text-center mb-4">🌦 Weather Dashboard</h2>

      <form className="d-flex mb-3 gap-2" onSubmit={handleSearch}>
        <input type="text" className={`form-control ${isDarkMode ? "bg-dark text-light" : ""}`}
          placeholder="Search for a city..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
          disabled={loading}/>
        <button className="btn btn-primary" type="submit">
          <Search size={16} /> Search
        </button>
      </form>

      <div className="d-flex gap-2 mb-3">
        <button className={`btn ${showFavoritesOnly ? "btn-warning" : "btn-outline-warning"}`}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
          <Star size={14} /> Favorites
        </button>
        <button className="btn btn-outline-secondary" onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <Sun size={14} /> : <Moon size={14} />} Theme
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading...</div>}

      <div className="row">
        {filteredCities.map((city) => (
          <div className="col-md-4 mb-3" key={city.id}>
            <div className={`card ${isDarkMode ? "bg-dark text-light border-secondary" : ""}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">{city.city}</h5>
                  <div>
                    <button className="btn btn-sm" onClick={() => toggleFavorite(city)}>
                      <Star size={18} fill={favoritesName.includes(getCityKey(city)) ? "gold" : "none"}/>
                    </button>
                    <button className="btn btn-sm text-danger" onClick={() => removeCity(city)}>✕
                    </button>
                  </div>
                </div>

                <h4>{city.temperature}°C</h4>
                <p>{city.description}</p>
                {city.icon && (
                  <img src={`https://openweathermap.org/img/wn/${city.icon}@2x.png`} alt={city.description} className="mb-2"/>
                )}

                <ul className="list-unstyled small">
                  <li><Droplets size={14}/> Humidity: {city.humidity}%</li>
                  <li><Wind size={14}/> Wind: {city.windSpeed} m/s</li>
                  <li><Eye size={14}/> Visibility: {city.visibility} km</li>
                  <li><Thermometer size={14}/> Pressure: {city.pressure} hPa</li>
                </ul>

                <h6 className="mt-3 "> 5-Day Forecast</h6>
                <div className="d-flex gap-2 flex-wrap">
                  {city.forecast.map((day, i) => (
                    <div key={i} className="text-center small">
                      {i === 0 ? "Today" : new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                      <div>{day.temp}°C</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
