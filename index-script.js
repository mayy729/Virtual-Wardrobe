window.addEventListener('DOMContentLoaded', function() {
    updateStats();
});

function updateStats() {
    const wardrobe = JSON.parse(localStorage.getItem('wardrobe') || '[]');
    const savedOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
    
    document.getElementById('total-wardrobe-items').textContent = wardrobe.length;
    document.getElementById('total-saved-outfits').textContent = savedOutfits.length;
}
