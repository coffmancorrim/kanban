import { useEffect, useState } from "react";
import { Search } from "./Search";
import "./App.css";
import { useQuery } from "@tanstack/react-query";
import { MediaItem } from "./MediaItem";

export default function App({ ENDPOINT }) {
  async function fetchCategories() {
    const response = await fetch(ENDPOINT + "sfl/category-list/");
    if (!response.ok) throw new Error("Failed to fetch categories");
    return await response.json();
  }

  async function fetchMedia(query) {
    const response = await fetch(`${ENDPOINT}sfl/media-list/?query=${query}`);
    if (!response.ok) throw new Error("Failed to fetch list");
    return await response.json();
  }

  const [query, setQuery] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data: mediaItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["media", query],
    queryFn: function () {
      return fetchMedia(query);
    },
  });

  return (
    <div className="app">
      <h1 className="app-title">saved for later</h1>
      <div className="search-wrapper">
        <Search value={query} onSetQuery={setQuery} />
      </div>
      <div className="category-filters">
        <button
          className={`category-btn ${query === "" ? "active" : ""}`}
          onClick={() => setQuery("")}
        >
          all
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${query === cat.name ? "active" : ""}`}
            onClick={() => setQuery(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>
      {error && <p className="error">{error.message}</p>}
      {isLoading && <p className="loading">loading...</p>}
      <div className="media-grid">
        {mediaItems.map((item) => (
          <MediaItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
