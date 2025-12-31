
const attributesJson = "{\"marka\":\"Honda\",\"model\":\"Civic\",\"seri\":\"1.6\",\"paket\":\"PREMIUM\",\"yilMin\":\"2015\",\"yilMax\":\"2017\",\"kmMin\":\"50000\",\"kmMax\":\"60000\",\"yakit\":\"Dizel\",\"vites\":\"Otomatik\",\"kasaTipi\":\"Coupe\",\"renk\":\"Lacivert\",\"minPrice\":50000,\"maxPrice\":60000}";
const budget = 60000n;

const attributes = JSON.parse(attributesJson);
const minPrice = attributes.minPrice ? Number(attributes.minPrice) : null;
const maxPrice = budget ? Number(budget) : null;

let priceText = '';
if (minPrice && maxPrice) {
   priceText = `${minPrice.toLocaleString('tr-TR')} - ${maxPrice.toLocaleString('tr-TR')} TL`;
} else if (maxPrice) {
   priceText = `${maxPrice.toLocaleString('tr-TR')} TL`;
}

console.log('Özellikler:', attributes);
console.log('Min:', minPrice);
console.log('Maks:', maxPrice);
console.log('Metin:', priceText);
