import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'legal_abbreviations_bookmarks';

/**
 * Get all bookmarked abbreviations
 */
export const getBookmarks = async () => {
    try {
        const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
        return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
        console.error('Failed to get bookmarks:', error);
        return [];
    }
};

/**
 * Check if abbreviation is bookmarked
 */
export const isBookmarked = async (abbr) => {
    try {
        const bookmarks = await getBookmarks();
        return bookmarks.includes(abbr);
    } catch (error) {
        console.error('Failed to check bookmark:', error);
        return false;
    }
};

/**
 * Toggle bookmark for abbreviation
 */
export const toggleBookmark = async (abbr) => {
    try {
        const bookmarks = await getBookmarks();
        const index = bookmarks.indexOf(abbr);
        
        if (index > -1) {
            // Remove bookmark
            bookmarks.splice(index, 1);
        } else {
            // Add bookmark
            bookmarks.push(abbr);
        }
        
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        return bookmarks.includes(abbr);
    } catch (error) {
        console.error('Failed to toggle bookmark:', error);
        return false;
    }
};

/**
 * Clear all bookmarks
 */
export const clearBookmarks = async () => {
    try {
        await AsyncStorage.removeItem(BOOKMARKS_KEY);
    } catch (error) {
        console.error('Failed to clear bookmarks:', error);
    }
};
