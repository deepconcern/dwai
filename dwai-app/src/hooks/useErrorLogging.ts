import { useEffect } from "react";

export function useErrorLogging(error: any): void {
    useEffect(() => {
        if (error) console.error(error);
    }, [error]);
}