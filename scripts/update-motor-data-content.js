
const fs = require('fs');
const path = require('path');

const manualDataPath = path.join(__dirname, 'data/manual-vehicle-data.js');
let content = fs.readFileSync(manualDataPath, 'utf8');

const newMotosikletData = {
    brands: [
        "Honda", "Yamaha", "Kuba", "RKS", "Mondial", "Arora", "Bajaj", "TVS", "Hero", "Kanuni", "Yuki", 
        "BMW", "Ducati", "Harley Davidson", "KTM", "Kawasaki", "Suzuki", "Triumph", "Vespa", "CFMOTO", 
        "Sym", "Kymco", "Aprilia", "Benelli", "Husqvarna", "Indian", "Jawa", "Lifan", "Moto Guzzi", 
        "MV Agusta", "Peugeot", "Piaggio", "Royal Enfield", "Sherco"
    ].sort(),
    models: {
        "Honda": ["Activa S", "Africa Twin", "CB 125 F", "CB 125 R", "CB 250 R", "CB 500 F", "CB 500 X", "CB 650 R", "CB 750 Hornet", "CBR 1000 RR", "CBR 250 R", "CBR 500 R", "CBR 650 R", "CL 250", "CRF 1100 L", "CRF 250 L", "CRF 250 Rally", "CRF 300 L", "CRF 300 Rally", "Dio", "Forza 250", "Forza 750", "Gold Wing", "Integra", "Monkey", "MSX 125", "NC 750 X", "NT 1100", "PCX 125", "PCX 150", "Rebel 500", "Rebel 1100", "Spacy Alpha", "Super Cub", "Transalp", "VFR 800", "VFR 1200", "X-ADV", "XL 750 Transalp"],
        "Yamaha": ["Crypton S", "Delight", "Fazer 8", "MT-07", "MT-09", "MT-10", "MT-125", "MT-25", "NMAX 125", "NMAX 155", "R1", "R1M", "R25", "R3", "R6", "R7", "Tenere 700", "Tracer 7", "Tracer 9", "Tracer 700", "Tracer 900", "Tricity 125", "Tricity 155", "Tricity 300", "X-City", "X-MAX 250", "X-MAX 300", "X-MAX 400", "XSR 125", "XSR 700", "XSR 900", "XV 950", "YBR 125", "YZF R125", "YZF R25"],
        "BMW": ["C 400 GT", "C 400 X", "CE 02", "CE 04", "F 750 GS", "F 800 GS", "F 850 GS", "F 900 GS", "F 900 R", "F 900 XR", "G 310 GS", "G 310 R", "K 1600 B", "K 1600 GT", "K 1600 GTL", "M 1000 R", "M 1000 RR", "M 1000 XR", "R 12", "R 12 nineT", "R 1200 GS", "R 1250 GS", "R 1250 R", "R 1250 RS", "R 1250 RT", "R 1300 GS", "R 18", "S 1000 R", "S 1000 RR", "S 1000 XR"],
        "Ducati": ["DesertX", "Diavel V4", "Hypermotard 698", "Hypermotard 950", "Monster", "Multistrada V2", "Multistrada V4", "Panigale V2", "Panigale V4", "Scrambler 800", "Scrambler 1100", "Streetfighter V2", "Streetfighter V4", "SuperSport 950", "XDiavel"],
        "Harley Davidson": ["Breakout", "Fat Bob", "Fat Boy", "Heritage Classic", "Hydra-Glide", "Low Rider S", "Low Rider ST", "Nightster", "Pan America 1250", "Road Glide", "Road King", "Softail Standard", "Sport Glide", "Sportster S", "Street Bob", "Street Glide", "Tri Glide", "Ultra Limited"],
        "KTM": ["125 Duke", "250 Duke", "390 Duke", "790 Duke", "890 Duke", "990 Duke", "1290 Super Duke", "1390 Super Duke", "RC 125", "RC 200", "RC 390", "250 Adventure", "390 Adventure", "790 Adventure", "890 Adventure", "1290 Super Adventure", "690 SMC R", "690 Enduro R"],
        "Triumph": ["Bonneville Bobber", "Bonneville Speedmaster", "Bonneville T100", "Bonneville T120", "Daytona 660", "Rocket 3", "Scrambler 1200", "Scrambler 400 X", "Scrambler 900", "Speed 400", "Speed Triple 1200", "Speed Twin 1200", "Speed Twin 900", "Street Triple 765", "Thruxton RS", "Tiger 1200", "Tiger 660", "Tiger 850", "Tiger 900", "Trident 660"],
        "Bajaj": ["Avenger 150", "Avenger 220", "Boxer 150", "CT 100", "CT 125", "Discover 125", "Discover 150", "Dominar 250", "Dominar 400", "Platina 100", "Platina 110", "Pulsar 150", "Pulsar 180", "Pulsar 200", "Pulsar F250", "Pulsar N160", "Pulsar N250", "Pulsar NS 125", "Pulsar NS 160", "Pulsar NS 200", "Pulsar RS 200"],
        "Hero": ["Dash 110", "Dash 125", "Duet 110", "Glamour 125", "Hunk 200R", "Ignitor 125", "Maestro Edge", "Pleasure", "Splendor", "Thriller 160R", "Xpulse 200", "Xpulse 200T", "Xpulse 4V"],
        "TVS": ["Apache 150", "Apache 160", "Apache 180", "Apache 200", "Apache 310", "Jupiter", "Neo", "Ntorq", "Raider", "Ronin", "Wego", "Zest"],
        "Kanuni": ["Breton 125", "Mati 125", "Merlin", "Nev 50", "Reha 250", "Resa 125", "Seyhan 150", "Tigrina 50", "Trodon 50", "Visal 125", "Wiki 125"],
        "Kuba": ["Atlas", "Black Cat", "Blueberry", "Bluebird", "Brillant", "CG 100", "Chia 125", "CR1", "Dragon 50", "Ege 50", "Filinta 200", "Fun 50", "Great", "K15", "KB 150", "Mocca", "Nirvana 150", "Open", "Pesaro 50", "Pessimo", "Pro Max", "Rainbow", "Razore", "Reiz", "RX9", "SJ 50", "Space 50", "Superlight 200", "TK 03", "Trendy", "X-Boss", "XY 100"],
        "Mondial": ["100 KH", "100 MFH", "100 SFC", "100 UAG", "125 Drift L", "125 MH Drift", "125 Vulture", "150 Mash", "150 MC", "150 MCX", "150 MR Vulture", "150 ZAT", "150 ZC", "150 Zone", "50 Revival", "50 Turismo", "50 Wing", "50 ZNU", "80 Sentor", "Lavinia", "Ressivio", "RX3i Evo", "Strada", "Turismo 50", "Vulture 125 i", "Wing 50"],
        "RKS": ["Azure 50", "Bitter 50", "Blade 250", "Blade 350", "Blazer 50", "Bolero 50", "Crow 80", "Freccia 150", "G-Force", "Jaguar 100", "K-Light 202", "K-Light 250", "Newlight 125", "Newlight 200", "Polos 50", "R250", "RN 180", "Rone 125", "Siesta 50", "Sniper 50", "Spontini 110", "SRK 125", "SRK 250", "SRK 400", "SRV 125", "Titanic 150", "TNT 125", "TNT 202", "TNT 250", "Veloce 150", "Wildcat 125", "Winner 200"],
        "Arora": ["AR 100", "AR 50", "Cappucino 50", "Cappucino 125", "Doberman 50", "Freedom 50", "Kasırga 50", "Max-T", "Mojito 50", "MT 125", "Safari 50", "Special 50", "Vesta 50", "Verano 50", "Yeb 125", "ZR 50"],
        "Yuki": ["100-7 Cub", "125-9 X", "250-9 X", "50-7 Cub", "Afşin", "Aydos", "Casper", "Drag", "Enzo", "Fifty", "Gusto", "Hector", "İzci", "Legato", "Maranello", "Matrix", "MyFriend", "Orion", "Risotto", "Route 66", "Samurai", "Tekiz", "YK-125", "YK-250", "YK-50"],
        "Sym": ["Crox", "Cruisym 250", "Cruisym Alpha", "Fiddle II", "Fiddle III", "Fiddle IV", "GTS 250", "Jet 14", "Jet X", "Joymax Z+", "Joyride 200", "Joyride 300", "Maxsym 400", "Maxsym TL", "Mio", "NH T 125", "NH T 200", "NH X 125", "Orbit II", "Orbit III", "Symphony 125", "Symphony 200", "Symphony SR", "Symphony ST", "Wolf 125", "Wolf 250", "X-Pro"],
        "Kymco": ["Agility 125", "Agility 16-200", "Agility Carry", "Agility City", "AK 550", "Dink R", "Downtown 250", "DT X360", "KRV 180", "Like 125", "Like 150", "Micare", "People S", "Super 8", "X-Town 125", "X-Town 250", "Xciting 400"],
        "Aprilia": ["RS 125", "RS 457", "RS 660", "RSV4", "RX 125", "SR 50", "SR GT 125", "SR GT 200", "SX 125", "Tuareg 660", "Tuono 125", "Tuono 660", "Tuono V4"],
        "Benelli": ["125 S", "502 C", "752 S", "BN 125", "BN 251", "Imperiale 400", "Leoncino 250", "Leoncino 500", "Leoncino 800", "TNT 125", "TNT 25", "TNT 250", "TNT 600", "TRK 251", "TRK 502", "TRK 702"],
        "CFMOTO": ["150 NK", "250 CL-X", "250 NK", "250 SR", "300 NK", "300 SR", "400 NK", "450 SR", "650 MT", "650 NK", "700 CL-X", "800 MT", "CL-C 450", "GT 400", "GT 650", "MT 450"],
        "Vespa": ["946", "Elettrica", "GTS 125", "GTS 250", "GTS 300", "GTV 300", "LX 125", "LX 150", "Primavera 125", "Primavera 150", "Primavera 50", "Sei Giorni", "Sprint 125", "Sprint 150", "Sprint 50", "SXL 150"],
        "Suzuki": ["Address 110", "Address 125", "Avenis 125", "Burgman 125", "Burgman 200", "Burgman 400", "Burgman 650", "DL 1050 V-Strom", "DL 650 V-Strom", "DL 800 V-Strom", "GSX 1300 R Hayabusa", "GSX 250 R", "GSX 8R", "GSX 8S", "GSX-R 1000", "GSX-R 125", "GSX-R 600", "GSX-R 750", "GSX-S 1000", "GSX-S 125", "GSX-S 750", "Inazuma", "Katana", "SV 650", "VanVan 200"],
        "Peugeot": ["Belville", "Citystar", "Django", "Kisbee", "Metropolis", "Pulsion", "Speedfight", "Tweet", "XP400"],
        "Piaggio": ["1", "Beverly 300", "Beverly 350", "Beverly 400", "Fly", "Liberty 125", "Liberty 150", "Liberty 50", "Medley 125", "Medley 150", "MP3 300", "MP3 400", "MP3 500", "Typhoon", "X10", "Xevo", "Zip"],
        "Husqvarna": ["701 Enduro", "701 Supermoto", "FC 250", "FC 350", "FC 450", "FE 250", "FE 350", "FE 450", "FE 501", "Norden 901", "Svartpilen 125", "Svartpilen 250", "Svartpilen 401", "TC 125", "TC 250", "TE 150", "TE 250", "TE 300", "Vitpilen 401"],
        "Indian": ["Challenger", "Chief", "Chieftain", "FTR 1200", "Pursuit", "Roadmaster", "Scout", "Scout Bobber", "Springfield"],
        "Jawa": ["300 CL", "350 OHC", "42", "500 OHC", "Perak", "Perek"],
        "Lifan": ["Emisol", "KP 150", "KPR 200", "KPT 200", "LF 100", "LF 125", "LF 150", "Pony 100", "Tay 100", "X-Pect"],
        "Moto Guzzi": ["Audace", "California", "Eldorado", "Griso", "MGX-21", "Stelvio", "V100 Mandello", "V7", "V85 TT", "V9"],
        "MV Agusta": ["Brutale 1000", "Brutale 800", "Dragster 800", "F3 800", "Rivale 800", "Rush 1000", "Superveloce 800", "Turismo Veloce 800"],
        "Royal Enfield": ["Bullet 350", "Bullet 500", "Classic 350", "Classic 500", "Continental GT 650", "Himalayan 411", "Himalayan 450", "Hunter 350", "Interceptor 650", "Meteor 350", "Scram 411", "Shotgun 650", "Super Meteor 650"],
        "Sherco": ["125 SE", "250 SE", "300 SE", "450 SEF", "500 SEF", "SM 125", "SM 50", "TY 125"]
    },
    attributes: {
        yil: Array.from({length: 45}, (_, i) => (2025 - i).toString()),
        km: ["0-5000", "5000-10000", "10000-20000", "20000-50000", "50000+"],
        motor_hacmi: ["0-50 cc", "51-100 cc", "101-125 cc", "126-250 cc", "251-500 cc", "501-750 cc", "751-1000 cc", "1000 cc üzeri"],
        motor_gucu: ["0-25 hp", "26-50 hp", "51-75 hp", "76-100 hp", "100 hp üzeri"],
        vites: ["Manuel", "Otomatik", "Yarı Otomatik"],
        renk: ["Siyah", "Beyaz", "Kırmızı", "Mavi", "Gri", "Sarı", "Yeşil", "Turuncu", "Diğer"],
        hasar_durumu: ["Hasarsız", "Hasar Kayıtlı", "Ağır Hasarlı"],
        tipi: ["Scooter", "Commuter", "Naked", "Racing", "Touring", "Cross", "Enduro", "Chopper", "Cafe Racer", "ATV", "UTV"]
    }
};

let manualData;
try {
    manualData = require(manualDataPath);
} catch (e) {
    console.error('Failed to require manual data:', e.message);
    process.exit(1);
}

manualData.motosiklet = newMotosikletData;

const newContent = `module.exports = ${JSON.stringify(manualData, null, 4)};`;
fs.writeFileSync(manualDataPath, newContent);
console.log('Successfully updated motosiklet data in manual-vehicle-data.js');
