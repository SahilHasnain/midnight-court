### Async Storage Migration

const SCHEMA_VERSION = '1.0.0'; // Increment when data structure changes

// Save with version
await AsyncStorage.setItem('current_presentation', JSON.stringify({
    version: SCHEMA_VERSION,
    slides,
    template,
    lastModified: new Date().toISOString(),
}));

// Load with migration
const saved = await AsyncStorage.getItem('current_presentation');
if (saved) {
    const data = JSON.parse(saved);
    
    // Check version mismatch
    if (data.version !== SCHEMA_VERSION) {
        // Migrate old data OR clear
        await AsyncStorage.removeItem('current_presentation');
        // Optional: migrate data if possible
    } else {
        setSlides(data.slides);
    }
}