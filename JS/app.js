function initPriceFormatSelect() {
    // Initialize the select, defaulting to custom if empty
    const priceFormatSelect = document.getElementById('priceFormatSelect');
    let lastFormat = 'custom';

    if (priceFormatSelect.value === '') {
        priceFormatSelect.value = 'custom';
    } else {
        lastFormat = priceFormatSelect.value;
    }

    priceFormatSelect.addEventListener('change', () => {
        // Temporarily set the select to lastFormat and save prices
        const currentFormat = priceFormatSelect.value;
        priceFormatSelect.value = lastFormat;
        savePrices();
        
        // Set select back to new format
        priceFormatSelect.value = currentFormat;
        applyPricesObject(pricesToPlainObject());
        
        // Update lastFormat
        lastFormat = currentFormat;
    });
}

// Your existing price storage helpers go here

// Call the init function before loading prices from storage
initPriceFormatSelect();

// Load prices from storage
loadPricesFromStorage();
