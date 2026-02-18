// Measurement layout for MJERENJE KERAMIČARSKIH RADOVA

// Header with company data
const companyData = {
    name: "GIK GRUPA d.o.o.",
    location: "Zagreb",
};

// Title and subtitle
const title = "SILIKON";
const subtitle = "Measurement of Ceramic Works";

// Cost table structure
const costTable = [
    { 
        jedMjera: 'm²', 
        ukupnaKolicina: 0,  // Total contracted quantity
        jedPrice: 0.0,     // Unit price in EUR
        kolicinaRadova: 0, // Executed quantity per month
        ukupno: 0         // Total
    },
    // Add additional lines as necessary
    {...}, // Placeholder for additional items
];

// Function to display the measurement layout
function displayMeasurementLayout() {
    console.log(companyData.name);
    console.log(companyData.location);
    console.log(title);
    console.log(subtitle);
    console.table(costTable);
}

displayMeasurementLayout();