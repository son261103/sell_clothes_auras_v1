import { useState, useEffect, useCallback } from 'react';
import useAuth from './useAuth';

/**
 * Custom hook to manage favorite products
 * This is a simplified version demonstrating how to use a hook instead of Redux
 * In a real application, you would connect this to your API and properly manage
 * the favorite products list
 */
const useFavorite = (productId: number) => {
    const { isAuthenticated, user } = useAuth();
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    // Simulate loading favorites from localStorage
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // In a real app, you would fetch this from an API or Redux store
        const savedFavorites = localStorage.getItem(`favorites_${user.userId}`);
        if (savedFavorites) {
            try {
                const favorites = JSON.parse(savedFavorites);
                setIsFavorite(favorites.includes(productId));
            } catch (e) {
                console.error("Error parsing favorites", e);
            }
        }
    }, [productId, isAuthenticated, user]);

    // Toggle favorite status
    const toggleFavorite = useCallback(() => {
        if (!isAuthenticated || !user) return false;

        try {
            const savedFavorites = localStorage.getItem(`favorites_${user.userId}`);
            let favorites: number[] = [];

            if (savedFavorites) {
                favorites = JSON.parse(savedFavorites);
            }

            if (isFavorite) {
                // Remove from favorites
                favorites = favorites.filter(id => id !== productId);
            } else {
                // Add to favorites
                favorites.push(productId);
            }

            // Save updated favorites
            localStorage.setItem(`favorites_${user.userId}`, JSON.stringify(favorites));

            // Update state
            setIsFavorite(!isFavorite);
            return true;
        } catch (e) {
            console.error("Error updating favorites", e);
            return false;
        }
    }, [isFavorite, productId, isAuthenticated, user]);

    // Add to favorites
    const addToFavorites = useCallback(() => {
        if (isFavorite) return true; // Already a favorite
        return toggleFavorite();
    }, [isFavorite, toggleFavorite]);

    // Remove from favorites
    const removeFromFavorites = useCallback(() => {
        if (!isFavorite) return true; // Already not a favorite
        return toggleFavorite();
    }, [isFavorite, toggleFavorite]);

    return {
        isFavorite,
        toggleFavorite,
        addToFavorites,
        removeFromFavorites
    };
};

export default useFavorite;