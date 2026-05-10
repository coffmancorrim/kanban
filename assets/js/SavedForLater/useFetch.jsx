import { useEffect, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function useFetch(defaultUrl) {
  const [state, setState] = useState([]);
  const [url, setUrl] = useState(defaultUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setError(null);
      setIsLoading(true);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Failed to fetch list");
        }
        const data = await response.json();
        setState(data);
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => controller.abort();
  }, [url]);

  return [state, setUrl, isLoading, error];
}
