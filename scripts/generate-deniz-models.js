
const manualData = require('./data/manual-vehicle-data.js');

const brands = manualData.deniz_araclari.brands;
const existingModels = manualData.deniz_araclari.models;

// Add specific models
const newModels = {
    ...existingModels,
    "Azimut": ["Seadeck 6", "Seadeck 7", "Fly 53", "Fly 60", "Atlantis 45", "Atlantis 51", "Magellano 66", "S6", "Grande", "Verve"],
    "Princess": ["V40", "V50", "V55", "V60", "V65", "F45", "F50", "F55", "F65", "S62", "S66", "S72", "X80", "X95", "Y72", "Y85", "Y95"],
    "Sunseeker": ["Manhattan 55", "Manhattan 68", "Predator 55", "Predator 65", "Predator 75", "Superhawk 55", "Hawk 38", "76 Yacht", "88 Yacht", "90 Ocean", "95 Yacht", "100 Yacht"],
    "Bavaria": ["Cruiser 34", "Cruiser 37", "Cruiser 41", "Cruiser 46", "C42", "C45", "C50", "C57", "Vida 33", "S29", "S30", "S33", "S41", "S45", "R40", "R55"],
    "Beneteau": ["Oceanis 30.1", "Oceanis 34.1", "Oceanis 38.1", "Oceanis 40.1", "Oceanis 46.1", "Oceanis 51.1", "First 14", "First 24", "First 27", "First 36", "First 44", "Antares 7", "Antares 8", "Antares 9", "Antares 11", "Flyer 7", "Flyer 8", "Flyer 9", "Flyer 10", "Gran Turismo 32", "Gran Turismo 36", "Gran Turismo 41", "Gran Turismo 45", "Swift Trawler 35", "Swift Trawler 41", "Swift Trawler 48"],
    "Jeanneau": ["Sun Odyssey 349", "Sun Odyssey 380", "Sun Odyssey 410", "Sun Odyssey 440", "Sun Odyssey 490", "Jeanneau Yachts 55", "Jeanneau Yachts 60", "Jeanneau Yachts 65", "Cap Camarat 5.5", "Cap Camarat 6.5", "Cap Camarat 7.5", "Cap Camarat 9.0", "Cap Camarat 10.5", "Cap Camarat 12.5", "Merry Fisher 605", "Merry Fisher 695", "Merry Fisher 795", "Merry Fisher 895", "Merry Fisher 1095", "Merry Fisher 1295", "NC 37"],
};

// Fill others with "Genel"
brands.forEach(brand => {
    if (!newModels[brand]) {
        newModels[brand] = ["Genel"];
    }
});

const fs = require('fs');
fs.writeFileSync('scripts/temp-deniz-models.json', JSON.stringify(newModels, null, 4));
console.log('Done writing to scripts/temp-deniz-models.json');
