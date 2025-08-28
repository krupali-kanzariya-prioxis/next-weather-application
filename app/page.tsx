"use client";
import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { CityWeather, fetchWeatherData } from "./weatherapi";

export default function WeatherApp() {
  const [cities, setCities] = useState<any>([]);
  const [favoriteNames, setFavoriteNames] = useState<any>([]);
  const [favoriteCities, setFavoriteCities] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [onlyFavorite, setOnlyFavorite] = useState(false);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const fav = localStorage.getItem("favoritesName");
    if (fav) {
      const parsed = JSON.parse(fav);
      setFavoriteNames(parsed);
      Promise.all(
        parsed.map((c: string) => {
          return fetchWeatherData(c).catch(() => null);
        })
      ).then((res) => {
        setFavoriteCities(res.filter((r) => r !== null));
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cities", JSON.stringify(cities));
  }, [cities]);

  useEffect(() => {
    localStorage.setItem("favoritesName", JSON.stringify(favoriteNames));
  }, [favoriteNames]);

  const searchCity = async (e: any) => {
    e.preventDefault();
    if (search.trim() === "") return;
    setLoading(true);
    setErrMsg("");
    try {
      const data = await fetchWeatherData(search);
      setCities([data]);
      setSearch("");
    } catch (e: any) {
      setErrMsg(e.message);
    }
    setLoading(false);
  };

  const favHandler = (city: any) => {
    const key = city.city.toLowerCase();
    if (favoriteNames.includes(key)) {
      setFavoriteNames(favoriteNames.filter((f: string) => f !== key));
      setFavoriteCities(favoriteCities.filter((c: any) => c.city.toLowerCase() !== key));
    } else {
      setFavoriteNames([...favoriteNames, key]);
      if (!favoriteCities.find((c: any) => c.city.toLowerCase() === key)) {
        setFavoriteCities([...favoriteCities, city]);
      }
    }
  };

  const removeCity = (c: any) => {
    const key = c.city.toLowerCase();
    setCities(cities.filter((x: any) => x.city.toLowerCase() !== key));
    setFavoriteNames(favoriteNames.filter((x: string) => x !== key));
    setFavoriteCities(favoriteCities.filter((x: any) => x.city.toLowerCase() !== key));
  };

  const cityList = onlyFavorite ? favoriteCities : cities;

  return (
    <div
      style={{ padding: "15px" }}
      className={dark ? "bg-dark text-light" : "bg-light text-dark"}
    >
      <h2 style={{ textAlign: "center" }}>Weather Dashboard 🌦</h2>

      <form
        onSubmit={searchCity}
        style={{ display: "flex", marginBottom: "10px", gap: "5px" }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search city..."
          className={dark ? "form-control bg-dark text-light" : "form-control"}
        />
        <button type="submit" className="btn btn-primary">
          <Icons.Search size={14} /> Search
        </button>
      </form>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          className={onlyFavorite ? "btn btn-warning" : "btn btn-outline-warning"}
          onClick={() => setOnlyFavorite(!onlyFavorite)}
        >
          <Icons.Star size={14} /> Favorites
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => setDark(!dark)}
        >
          {dark ? <Icons.Sun size={14} /> : <Icons.Moon size={14} />} Theme
        </button>
      </div>

      {errMsg && <div className="alert alert-danger">{errMsg}</div>}
      {loading && <div className="alert alert-info">Loading...</div>}

      <div className="row">
        {cityList.map((city: any, idx: number) => (
          <div className="col-md-4 mb-3" key={idx}>
            <div className={`card ${dark ? "bg-dark text-light" : ""}`}>
              <div className="card-body">
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h5>{city.city}</h5>
                  <div>
                    <button
                      className="btn btn-sm"
                      onClick={() => favHandler(city)}
                    >
                      <Icons.Star
                        size={16}
                        fill={
                          favoriteNames.includes(city.city.toLowerCase())
                            ? "gold"
                            : "none"
                        }
                      />
                    </button>
                    <button
                      className="btn btn-sm text-danger"
                      onClick={() => removeCity(city)}
                    >
                      x
                    </button>
                  </div>
                </div>
                <h4>{city.temperature} °C</h4>
                <p>{city.description}</p>
                {city.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${city.icon}@2x.png`}
                    alt="icon"
                  />
                )}
                <ul style={{ fontSize: "13px", listStyle: "none", padding: 0 }}>
                  <li>
                    <Icons.Droplets size={12} /> Humidity: {city.humidity}%
                  </li>
                  <li>
                    <Icons.Wind size={12} /> Wind: {city.windSpeed} m/s
                  </li>
                  <li>
                    <Icons.Eye size={12} /> Visibility: {city.visibility} km
                  </li>
                  <li>
                    <Icons.Thermometer size={12} /> Pressure: {city.pressure}{" "}
                    hPa
                  </li>
                </ul>
                <h6>5 Day Forecast</h6>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {city.forecast.map((f: any, i: number) => (
                    <div
                      key={i}
                      style={{ fontSize: "12px", textAlign: "center" }}
                    >
                      {new Date(f.date).toLocaleDateString()}
                      <div>{f.temp}°C</div>
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
