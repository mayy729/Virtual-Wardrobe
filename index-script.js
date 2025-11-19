window.addEventListener('DOMContentLoaded', () => {
    updateStats();
});

async function updateStats() {
    const wardrobeCounter = document.getElementById('total-wardrobe-items');
    const savedCounter = document.getElementById('total-saved-outfits');

    wardrobeCounter.textContent = '...';
    savedCounter.textContent = '...';

    try {
        const [wardrobeItems, savedOutfits] = await Promise.all([
            WardrobeAPI.listClothes(),
            WardrobeAPI.listOutfits()
        ]);

        wardrobeCounter.textContent = wardrobeItems.length;
        savedCounter.textContent = savedOutfits.length;
    } catch (error) {
        console.error('Failed to load stats:', error);
        wardrobeCounter.textContent = '0';
        savedCounter.textContent = '0';
        if (window.Utils) {
            Utils.showNotification('Unable to connect to wardrobe service, please try again later.', 'error');
        }
    }
}
