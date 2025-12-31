import { useCallback, useEffect, useRef, useState } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);

      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal
        });

        // Remove this controller once request completes
        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || "Request failed!");
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        if (err.name === "AbortError") {
          // Fetch was aborted, ignore it
          console.log("Fetch aborted");
        } else {
          setError(err.message || "Something went wrong!");
          setIsLoading(false);
          throw err;
        }
      }
    },
    []
  );

  const clearError = () => setError(null);

  // Cleanup all active requests on unmount
  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
