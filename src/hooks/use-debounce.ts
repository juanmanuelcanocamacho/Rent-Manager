import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number) {
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);

        const id = setTimeout(() => {
            callback(...args);
        }, delay);

        setTimeoutId(id);
    };
}
