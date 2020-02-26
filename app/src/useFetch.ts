import { useState, useEffect } from "react";

export interface Response<T> {
    data: T | undefined;
    loading: boolean;
    error: TypeError | undefined;
    setData(data: T | undefined): void;
}

export function useFetch<T>(url: string, init?: RequestInit): Response<T> {
    const [data, setData] = useState<T | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(undefined);
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(url, init);
                if (response.ok) {
                    const json = await response.json();
                    setData(json);
                } else {
                    throw TypeError(response.statusText);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    // Including init in deps will cause infinite loop
    }, [url]);  // eslint-disable-line react-hooks/exhaustive-deps
    return {loading, data, error, setData};
}
