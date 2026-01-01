// GERÇEK ARAÇ HİYERARŞİSİ - SAHİBİNDEN.COM
// Marka -> Model -> Seri -> Motor/Paket

export const AUTOMOBILE_HIERARCHY: Record<string, Record<string, Record<string, string[]>>> = {
  "Alfa Romeo": {
    "145": {
      "1.4": ["1.4", "TS STD"],
      "1.6": ["1.6", "L", "TS", "TS Sportivo"],
      "2.0": ["Quadrifoglio", "TS QV"],
    },
    "146": {
      "1.4": ["TS", "TS Ritmo"],
      "1.6": ["L", "TS"],
    },
    "147": {
      "1.6 TS": ["Black Line", "Collezione", "Distinctive", "Progression"],
    },
    "156": {
      "1.6 TS": ["1.6 TS", "Distinctive", "Progression"],
      "1.9 JTD": ["Impression", "Sportwagon"],
      "2.0 TS": ["2.0 TS", "Distinctive", "Executive", "Selespeed"],
    },
    "159": {
      "1.8 MPI": [],
      "1.9 JTD": ["Distinctive", "Distinctive Plus"],
      "1.9 JTS": [],
      "2.4 JTD": [],
    },
    "166": {
      "TB": [],
      "TS": [],
      "TS Executive": [],
    },
    "33": {
      "1.5": ["Giardinetta", "IE"],
      "1.7": [],
    },
    "Brera": {
      "2.2": ["JTS", "JTS Sky Window"],
      "3.2": [],
    },
    "GT": {
      "1.9 JTD": [],
      "2.0 JTS": ["Dis.Selespeed", "Distinctive"],
    },
    "GTV": {
      "TB": [],
      "TS": [],
    },
    "Giulia": {
      "2.0": ["Competizione", "Veloce"],
      "2.0 T": ["Sprint", "Veloce"],
    },
    "Giulietta": {
      "1.4 TB": ["Distinctive", "MultiAir Distinctive", "MultiAir Progression Pluse", "MultiAir Super TCT", "Progression Plus"],
      "1.6 JTD": ["Distinctive", "Giulietta", "Progression", "Progression Plus", "Sprint", "Super TCT", "TI"],
    },
    "MiTo": {
      "1.4 T": ["Distinctive", "MultiAir Distinctive", "MultiAir Quadrifoglio Verde", "MultiAir TCT", "MultiAir TCT Sportivo", "Progression"],
    },
  },
  "Audi": {
    "A1": {
      "1.4 TFSI": ["Ambition", "Attraction"],
      "1.6 TDI": ["Ambition", "Attraction", "Basic", "Dynamic", "S Line", "Sport"],
    },
    "A3": {
      "A3 Cabrio": ["1.2 TFSI", "1.4 TFSI", "1.5 TFSI", "1.6", "1.8 TFSI", "2.0 TDI", "35 TFSI"],
      "A3 Hatchback": ["1.4 TFSI", "1.6", "1.6 FSI", "1.6 TDI", "1.8", "1.8 T", "1.8 TFSI", "1.9 TDI", "2.0 FSI", "2.0 TDI"],
      "A3 Sedan": ["1.0 TFSI", "1.2 TFSI", "1.4 TFSI", "1.5 TFSI", "1.6 TDI", "30 TDI", "30 TFSI", "35 TFSI"],
      "A3 Sportback": ["1.0 TFSI", "1.2 TFSI", "1.4 TFSI", "1.5 TFSI", "1.6", "1.6 FSI", "1.6 TDI", "1.8", "1.8 T", "1.8 TFSI", "1.9 TDI", "2.0 TDI", "2.0 TFSI", "3.2", "30 TDI", "30 TFSI", "35 TFSI"],
    },
    "A4": {
      "A4 Allroad quattro": ["2.0 TDI", "2.0 TFSI", "40 TDI", "45 TFSI"],
      "A4 Avant": ["1.4 TFSI", "1.6", "1.8", "1.8 T", "1.8 TFSI", "1.9 TDI", "2.0", "2.0 TDI", "2.0 TDI Design", "2.0 TDI Dynamic", "2.0 TDI Quattro", "2.0 TDI Quattro Design", "2.0 TDI Sport", "2.0 TFSI Quattro", "2.0 TFSI Quattro Dynamic", "2.5 TDI", "2.5 TDI Quattro", "2.7", "3.0 Quattro", "40 TDI"],
      "A4 Cabrio": ["1.8 T", "2.0 TFSI", "2.4", "2.5 TDI", "3.0 Quattro"],
      "A4 Sedan": ["1.4 TFSI", "1.4 TFSI Design", "1.4 TFSI Dynamic", "1.4 TFSI Sport", "1.6", "1.8", "1.8 T", "1.8 T Quattro", "1.8 TFSI", "1.9 TDI", "2.0", "2.0 TDI", "2.0 TDI Design", "2.0 TDI Dynamic", "2.0 TDI Quattro", "2.0 TDI Quattro Design", "2.0 TDI Quattro Dynamic", "2.0 TDI Quattro Sport", "2.0 TDI S Line", "2.0 TDI Sport", "2.0 TFSI", "2.0 TFSI Quattro", "2.0 TFSI Quattro S Line", "2.4", "2.5 TDI", "2.5 TDI Quattro", "2.7 TDI", "2.8 Quattro", "3.0 Quattro", "3.0 TDI Quattro", "3.2 FSI Quattro", "40 TDI", "45 TFSI"],
    },
    "A5": {
      "A5 Cabrio": ["1.8 TFSI", "2.0 TFSI Quattro", "40 TDI", "45 TFSI"],
      "A5 Coupe": ["1.4 TFSI Design", "1.4 TFSI Sport", "1.8 TFSI", "1.8 TFSI S Line", "2.0 TDI", "2.0 TDI Quattro", "2.0 TFSI", "2.0 TFSI Quattro", "2.7 TDI", "3.0 TDI Quattro", "3.2 FSI", "40 TDI", "45 TFSI"],
      "A5 Sedan": ["2.0 TDI Quattro", "2.0 TFSI", "2.0 TFSI Quattro"],
      "A5 Sportback": ["1.4 TFSI Design", "1.4 TFSI Dynamic", "1.4 TFSI Sport", "2.0 TDI", "2.0 TDI Quattro", "2.0 TDI Quattro Design", "2.0 TDI Quattro Dynamic", "2.0 TDI Quattro Sport", "2.0 TFSI", "2.0 TFSI Quattro", "2.0 TFSI Quattro Sport", "3.0 TDI Quattro", "40 TDI", "45 TFSI"],
    },
    "A6": {
      "A6 Allroad Quattro": ["2.5 TDI", "2.7 T", "2.7 TDI", "3.0 TDI", "4.2 FSI", "40 TDI"],
      "A6 Avant": ["1.9 TDI", "2.0", "2.0 TDI", "2.0 TDI Quattro", "2.4", "2.5 TDI", "2.5 TDI Quattro", "2.7 TDI", "2.7 TDI Quattro", "2.8", "2.8 Quattro", "3.0 TDI Quattro", "4.2 Quattro", "40 TDI", "45 TFSI"],
      "A6 Sedan": ["1.8 Quattro", "1.8 T", "1.9 TDI", "2.0", "2.0 Quattro", "2.0 TDI", "2.0 TDI Quattro", "2.0 TFSI", "2.0 TFSI Quattro", "2.4", "2.4 Quattro", "2.5 TDI", "2.5 TDI Quattro", "2.6", "2.7 T Quattro", "2.7 TDI", "2.8", "3.0", "3.0 Quattro", "3.0 TDI Quattro", "3.0 TFSI Quattro", "3.2 FSI Quattro", "40 TDI", "45 TFSI", "50 TDI", "55 TFSI"],
    },
    "A8": {
      "3.0 TDI": ["Quattro", "Quattro Long"],
      "4.2": ["FSI Quattro", "Quattro", "Quattro Long"],
      "4.2 TDI": ["Quattro", "Quattro Long"],
    },
    "R8": {
      "4.2 FSI": ["Quattro", "Quattro R-tronic"],
    },
    "S Serisi": {
      "S3": ["1.8 T Quattro", "2.0 TFSI Quattro"],
      "S5": ["3.0 TFSI Quattro", "4.2 FSI Quattro"],
      "S6": ["3.0 TDI Quattro", "5.2 Quattro"],
      "S8": ["4.0 TFSI Quattro", "5.2 Quattro"],
    },
    "TT": {
      "1.8": ["1.8 T", "T Quattro"],
      "2.0": ["TDI Quattro", "TFSI", "TFSI Quattro", "TFSI S Quattro"],
    },
  },
  "BMW": {
    "1 Serisi": {
      "116d": ["Comfort", "First Edition M Sport", "First Edition Sport Line", "Joy", "Joy Plus", "M Plus", "M Sport", "One Edition", "Premium Line", "Pure", "Sport Line", "Sport Plus", "Standart", "Urban Line", "Urban Plus"],
      "116d ED": ["EfficientDynamics", "Joy", "Joy Plus", "Sport Line", "Urban Plus"],
      "116i": ["Advantage", "Comfort", "Joy Edition", "M Sport", "Premium", "Pure", "Sport", "Sport Edition", "Sport Line", "Standart", "Technology", "Urban Line"],
      "118i": ["Advantage", "Comfort", "First Edition M Sport", "First Edition Sport Line", "Joy", "Joy Plus", "M Plus", "M Sport", "One Edition", "One Edition M", "Premium", "Premium Line", "Pure", "Sport Line", "Sport Plus", "Standart", "Urban Line", "Urban Plus"],
      "120": ["M Sport", "Sport Line"],
      "120i": ["M Plus", "M Sport", "Standart"],
    },
    "2 Serisi": {
      "216d Active Tourer": ["Active Tourer", "Joy", "Luxury Line", "M Sport", "Premium Line", "Prestige", "Sport Line"],
      "216d Gran Coupe": ["First Edition Luxury Line", "First Edition M Sport", "First Edition Sport Line", "M Sport", "Sport Line"],
      "216d Gran Tourer": ["Gran Tourer", "Joy", "Luxury Line", "Luxury Plus", "Sport Line"],
      "218i": ["Luxury Line", "M Sport", "Prestige", "Sport Line"],
      "218i Active Tourer": ["Active Tourer", "Joy", "Luxury Line", "Luxury Plus", "M Sport", "Sport Line", "Sport Plus"],
      "218i Gran Coupe": ["First Edition Luxury Line", "First Edition M Sport", "First Edition Sport Line", "Luxury Line", "M Sport", "Sport Line"],
      "220 Gran Coupe": ["M Sport", "Sportline"],
      "220d": ["M Sport", "Standart"],
      "220i Active Tourer": ["Luxury Line", "M Sport"],
      "230e xDrive Active Tourer": ["Luxury Line", "M Sport"],
    },
    "3 Serisi": {
      "316i": ["Advantage", "Comfort", "Compact", "Exclusive", "Lifestyle Edition", "Luxury Line", "M Sport", "Modern Line", "Premium", "Sport", "Sport Line", "Standart", "Techno Plus", "Technology", "Touring"],
      "318d": ["40th Year Edition", "Luxury Plus", "M Plus", "Premium", "Prestige", "Sport Plus", "Standart", "Touring"],
      "318i": ["40th Year Edition", "Edition Luxury Line", "Edition M Sport", "Edition M Sport Executive", "Edition Sport Line", "Joy", "Luxury Plus", "M Joy", "M Joy Plus", "M Plus", "M Sport", "Premium Line", "Prestige", "Sport Plus", "Standart", "Touring"],
      "320d": ["40th Year Edition", "Advantage", "Comfort", "Edition Comfort", "Edition M Sport", "Edition Sport Line", "Luxury", "M Plus", "M Sport", "Modern Line", "Premium", "Premium Line", "Prestige", "Sport", "Sport Line", "Standart", "Techno Plus", "Technology", "Touring"],
      "320d GT": ["Gran Turismo", "Luxury", "Sport Line"],
      "320d xDrive": ["40th Year Edition", "Advantage", "Comfort", "Edition Luxury Line", "Edition M Sport", "Luxury Line", "M Sport", "Modern Line", "Premium", "Premium Line", "Prestige", "Sport", "Sport Line", "Standart", "Techno Plus", "Touring M Sport"],
      "320d xDrive GT": ["Gran Turismo", "Luxury", "M Sport", "Modern Line", "Premium", "Sport Line", "Techno Plus"],
      "320i": ["320i", "50 Jahre Edition", "50th Year M Edition", "Cabrio", "Edition M Sport", "Executive M Sport", "First Edition Luxury Line", "First Edition M Sport", "First Edition Sport Line", "Luxury Line", "M Sport", "Premium", "Sport Line"],
      "320i ED": ["40th Year Edition", "Edition", "Luxury Line", "Luxury Line Plus", "Luxury M Plus", "M Plus", "M Sport", "Modern Line", "Modern Line Plus", "Sport Line", "Sport Plus", "Standart", "Techno Plus"],
      "325i": ["Cabrio", "Standart", "Touring"],
      "325tds": ["Standart", "Touring"],
      "325xi": ["Standart", "Touring"],
      "328i": ["328i", "Comfort", "Luxury Line", "M Sport", "Sport Line"],
      "330d": ["M Sport", "Standart", "Touring"],
      "330i": ["M Sport", "Standart"],
      "330i xDrive": ["Edition M Sport", "Premium Line"],
    },
    "4 Serisi": {
      "418d Gran Coupe": ["Prestige", "Sport Plus", "Ultimate M Sport"],
      "418i": ["Joy", "Luxury Line", "M Sport", "Prestige", "Sport Line", "Ultimate M Sport"],
      "418i Gran Coupe": ["Gran Coupe", "Joy", "Luxury Line", "M Sport", "Prestige", "Pure", "Sport Line", "Ultimate M Sport"],
      "420d": ["420d", "Luxury Line", "M Sport", "Sport Line", "Ultimate M Sport"],
      "420d Gran Coupe": ["Gran Coupe", "Luxury Line", "M Sport", "Sport Line"],
      "420d xDrive": ["Luxury Line", "M Sport", "Premium", "Sport Line"],
      "420d xDrive Gran Coupe": ["Gran Coupe", "Luxury Line", "Luxury Plus", "M Plus", "M Sport", "Modern Line", "Premium", "Sport Line", "Ultimate M Sport"],
      "420i": ["Edition M Sport", "M Sport"],
      "420i Gran Coupe": ["50th Year M Edition", "Edition M Sport", "M Sport"],
      "428i": ["428i", "Luxury Line", "M Sport"],
      "428i xDrive": ["428i xDrive", "Luxury Line", "M Sport"],
      "428i xDrive Gran Coupe": ["Luxury Line", "M Sport"],
      "430i xDrive": ["Luxury Line", "M Sport"],
      "430i xDrive Gran Coupe": ["M Sport", "Ultimate M Sport"],
    },
    "5 Serisi": {
      "520d": ["Comfort", "Dynamic", "Exclusive", "Executive Luxury Line", "Executive M Sport", "Executive Plus", "Executive Sport", "Luxury Line", "M Sport", "Premium", "Prestige", "Sport Line", "Standart", "Touring"],
      "520d Gran Turismo": ["Luxury Line", "M Sport"],
      "520d xDrive": ["Executive M Sport", "Luxury Line", "M Sport", "Prestige", "Pure", "Special Edition Luxury", "Special Edition Luxury Line", "Special Edition M Sport", "Sport Line"],
      "520i": ["50th Year M Edition", "Business", "Comfort", "Comfort Plus", "Edition M Sport", "Executive", "Executive Luxury Line", "Executive M Sport", "Executive Plus", "Executive Sport", "Luxury Line", "M Sport", "Modern Line", "Premium", "Prestige", "Special Edition Luxury", "Special Edition Luxury Line", "Special Edition M Sport", "Sport Line", "Standart", "Touring"],
      "525 xDrive": ["Touring M Sport", "Touring Premium", "Touring Sport"],
      "525d": ["Standart", "Touring"],
      "525d xDrive": ["Comfort", "Exclusive", "Executive", "Executive Luxury", "Executive M Sport", "Executive Plus", "Executive Sport", "Luxury", "M Sport", "Modern Line", "Premium", "Sport", "xDrive"],
      "525i": ["Standart", "Touring"],
      "525tds": ["Standart", "Touring"],
      "528i": ["M Sport", "Standart", "Touring"],
      "528i xDrive": ["Comfort", "Exclusive"],
      "530 xDrive": ["Standart", "Touring"],
      "530d": ["Comfort", "Exclusive", "M Sport", "Standart", "Touring"],
      "530d xDrive": ["M Sport", "Prestige"],
      "530i": ["Executive Luxury", "Executive M", "Executive M Sport", "Executive Sport", "Luxury Line", "M Sport", "Prestige", "Sport Line", "Standart"],
      "530i xDrive": ["Executive Luxury", "Executive Luxury Line", "Executive M", "Executive M Sport", "Executive Prestige", "Luxury Line", "M Sport", "Special Edition Luxury Line", "Special Edition M Sport"],
      "530xd Gran Turismo": ["M Sport", "Premium"],
      "535d xDrive": ["Comfort", "M Sport", "Premium"],
    },
    "6 Serisi": {
      "630Ci": ["630Ci", "Cabrio"],
      "630i": ["630i", "Cabrio"],
      "630i Gran Turismo": ["Luxury Line", "M Sport"],
      "635d": ["635d", "Cabrio"],
      "640d": ["640d", "Dynamic", "Gran Coupe", "M Sport"],
      "640d xDrive": ["Gran Coupe", "Gran Coupe M Sport", "Gran Coupe Pure", "Gran Coupe Pure Experience", "M Sport"],
      "640i": ["640i", "Dynamic", "Exclusive"],
      "645Ci": ["645Ci", "Cabrio"],
      "650Ci": ["650Ci", "Cabrio"],
    },
    "7 Serisi": {
      "725d": ["M Excellence", "M Sport", "Pure Excellence"],
      "725d Long": ["M Excellence", "Pure Excellence"],
      "730d": ["Exclusive", "Standart"],
      "730d Long": ["Exclusive", "Exclusive M Sport", "Individual Edition", "Standart"],
      "730d xDrive": ["M Sport", "Standart"],
      "730d xDrive Long": ["Executive Lounge", "M Sport", "Prestige"],
      "730i": ["Exclusive", "M Excellence", "M Sport", "Standart"],
      "730i Long": ["Executive Lounge", "Luxury", "M Excellence", "Pure Excellence", "Standart"],
      "740d xDrive": ["Exclusive", "M Excellence", "M Sport", "Pure Excellence", "Standart"],
      "740d xDrive Long": ["M Excellence", "Pure Excellence"],
      "740e xDrive Long": ["Executive Lounge", "M Excellence", "M Sport", "Pure", "Pure Excellence"],
      "750d xDrive Long": ["Executive Lounge", "M Excellence", "Standart"],
    },
    "8 Serisi": {
      "840d xDrive Gran Coupe": ["M Sport"],
    },
    "M Serisi": {
      "M2": [],
      "M2 Competition": [],
      "M235i": [],
      "M235i xDrive": [],
      "M240i xDrive": [],
      "M3": [],
      "M3 CSL": [],
      "M3 Cabrio": [],
      "M3 Competition": [],
      "M3 Coupe": [],
      "M3 Touring": [],
      "M4": [],
      "M4 CS": [],
      "M4 Competition": [],
      "M440i xDrive": [],
      "M5": [],
      "M5 Competition": [],
      "M5 Touring": [],
      "M5 xDrive": [],
      "M6": [],
      "M6 Cabrio": [],
      "M6 Gran Coupe": [],
      "M760e xDrive": [],
      "M8 Coupe xDrive Competition": [],
      "M8 Gran Coupe xDrive Competition": [],
      "Z3 M Cabrio": [],
    },
    "Z Serisi": {
      "Z1": [],
      "Z3": ["1.8", "1.9", "2.2", "2.8", "3.0"],
      "Z4": ["2.0", "2.2", "2.5", "2.5si", "20i sDrive", "23i sDrive", "28i sDrive", "3.0", "3.0Si", "30i sDrive", "35i sDrive", "35is sDrive"],
    },
    "i Serisi": {
      "i3": ["Edition Electric", "Lodge", "Premium Techno", "i3"],
      "i4": ["M50", "eDrive 40"],
      "i5": ["M60 xDrive", "eDrive 40", "xDrive40"],
      "i7": ["M70 xDrive", "xDrive60 M Excellence", "xDrive60 Pure Excellence"],
      "i8": ["Accaro", "Premium Techno", "Pure", "i8"],
    },
  },
  "BYD": {
    "Dolphin": {
      "Design": [],
      "Standart": [],
    },
    "F3": {
    },
    "Han": {
    },
    "Seal": {
      "Design": [],
      "Excellence": [],
    },
    "Song L": {
    },
  },
  "Buick": {
    "Le Sabre": {
    },
    "Park Avenue": {
    },
    "Regal": {
    },
    "Riviera": {
    },
    "Roadmaster": {
    },
    "Skylark": {
    },
  },
  "Cadillac": {
    "BLS": {
    },
    "Brougham": {
    },
    "CTS": {
      "2.0 L": [],
      "2.8": [],
      "3.2": [],
      "6.0": [],
    },
    "DeVille": {
      "4.6 Concours": [],
      "4.6 DTS": [],
      "4.9 STD": [],
    },
    "Eldorado": {
    },
    "Fleetwood": {
      "4.9": [],
      "5.7": [],
    },
    "STS": {
      "3.6": [],
      "4.6": [],
    },
    "Seville": {
      "4.6 STS": [],
      "4.9 STS": [],
    },
  },
  "Chery": {
    "Alia": {
      "Acteco Forza": [],
      "Acteco Lusso": [],
      "Acteco Norma": [],
    },
    "Chance": {
    },
    "Kimo": {
      "Forza": [],
      "Lusso": [],
    },
    "Niche": {
      "1.6 Lusso": [],
      "1.6 Norma": [],
      "2.0 Lusso": [],
    },
  },
  "Chevrolet": {
    "Aveo": {
      "1.2": ["LS", "S", "SE", "SX"],
      "1.3 D": ["LS", "LT", "LTZ"],
      "1.4": ["LS", "LT", "LTZ", "S", "SE", "SX"],
    },
    "Camaro": {
      "2.0": [],
      "3.6": [],
      "6.2": [],
      "RS": [],
      "SS": [],
      "Z28": [],
    },
    "Caprice": {
      "3.6": [],
      "5.0 LS": [],
    },
    "Cavalier": {
    },
    "Corvette": {
      "C4": [],
      "C5": [],
      "C6": [],
      "C7": [],
      "C8": [],
      "Z06": [],
    },
    "Cruze": {
      "1.4": [],
      "1.4 T": ["LT", "LTZ", "Sport", "Sport Plus"],
      "1.6": ["1.6", "Design Edition", "Design Edition Plus", "LS", "LS Plus", "LT", "LT Plus", "Sport", "Sport Plus", "WTCC Edition", "WTCC Edition Plus"],
      "2.0 D": ["LT", "LTZ"],
    },
    "Epica": {
      "2.0 D LT": [],
      "2.0 LT": [],
    },
    "Evanda": {
    },
    "Impala": {
      "3.6": [],
      "3.8": [],
      "5.7": [],
    },
    "Kalos": {
      "1.2": ["S", "SE"],
      "1.4": ["S", "SE", "SX"],
    },
    "Lacetti": {
      "1.4": ["CDX", "SE", "SX", "WTCC"],
      "1.6": ["CDX", "SE", "SX", "WTCC"],
      "1.8": [],
    },
    "Monte Carlo": {
    },
    "Rezzo": {
    },
    "Spark": {
      "0.8": ["S", "SE"],
      "1.0": ["1.0", "LS", "SE", "SX"],
      "1.2": ["LS", "LT", "LTZ"],
    },
  },
  "Chrysler": {
    "300 C": {
      "2.7": [],
      "3.0 CRD": [],
      "3.5": [],
      "5.7": [],
      "6.1 SRT": [],
    },
    "300 M": {
    },
    "Concorde": {
    },
    "Crossfire": {
      "Coupe 3.2": [],
      "Roadster 3.2": [],
    },
    "LHS": {
    },
    "Neon": {
      "LE": [],
      "LX": [],
    },
    "PT Cruiser": {
      "1.6": [],
      "2.0": [],
      "2.2 CRD": [],
      "2.4": [],
    },
    "Sebring": {
      "2.0 CRD": ["Convertible", "Limited"],
      "2.4 Limited": [],
      "2.5 LXI": [],
      "2.7 LX": [],
      "2.7 Limited": [],
    },
    "Stratus": {
      "2.0": ["LE", "LX"],
      "2.5": ["LE", "LX"],
    },
  },
  "Citroen": {
    "AMI": {
      "Buggy": [],
      "Electric": [],
      "Peps": [],
      "Pop": [],
      "Tonic": [],
    },
    "AX": {
    },
    "BX": {
      "15": [],
      "16": [],
    },
    "C-Elysée": {
      "1.2": [],
      "1.2 VTi": ["Attraction", "Confort", "Exclusive"],
      "1.5 BlueHDI": ["Feel", "Feel Bold", "Live", "Shine"],
      "1.6 BlueHDI": ["Feel", "Live", "Shine"],
      "1.6 HDi": ["Attraction", "Confort", "Exclusive", "Feel", "Live", "Shine"],
      "1.6 VTi": [],
    },
    "C1": {
      "1.0": ["Confort", "SX", "SX Sensodrive"],
      "1.0 VTi": ["Feel", "Shine"],
      "1.4 HDi": [],
    },
    "C2": {
      "1.4": [],
      "1.4 HDi": ["SX", "VTR", "X Pack"],
      "1.6": ["VTR", "VTS"],
    },
    "C3": {
      "1.2 PureTech": ["Elle", "Feel", "Feel Adventure", "Feel Bold", "Feel Business", "Feel S Edition", "Live", "Selection", "Shine", "Shine Business", "Shine S Edition", "Shine SX Edition"],
      "1.2 VTi": [],
      "1.4": ["Attraction", "Collection", "Comfort", "Pluriel", "SX", "SensoDrive", "X Furio"],
      "1.4 HDi": ["Attraction", "Collection", "Confort", "Exclusive", "SX", "X", "X Furio"],
      "1.4 VTi": ["Collection", "Confort"],
      "1.4 e-HDi": [],
      "1.6": ["Pluriel", "SX"],
      "1.6 BlueHDi": ["Feel", "Live", "Shine"],
      "1.6 HDi": ["Exclusive", "SX"],
      "1.6 VTi": ["Confort", "Exclusive", "Feel", "Shine"],
    },
    "C3 Picasso": {
      "1.4": [],
      "1.6 HDi": ["SX", "X"],
      "1.6 e-HDi": [],
    },
    "C4": {
      "1.2 Hybrid": [],
      "1.2 PureTech": ["Confort", "Exclusive", "Feel", "Feel Bold", "Max", "Shine", "Shine Bold", "You"],
      "1.4": ["Collection", "SX"],
      "1.4 VTi": ["Attraction", "Easy"],
      "1.5 BlueHDi": ["Feel Bold", "Shine", "Shine Bold"],
      "1.6": ["Collection", "SX", "SX PK", "THP Exclusive", "VTR", "VTRPK", "VTi Confort"],
      "1.6 BlueHDi": ["Confort", "Exclusive"],
      "1.6 HDi": ["Attraction", "Confort", "Confort Plus", "Easy", "SX", "SX PK", "VTRPK"],
      "1.6 e-HDi": ["Confort", "Confort Plus", "Exclusive"],
      "2.0": [],
    },
    "C4 Grand Picasso": {
      "1.6 BlueHDi": ["Feel", "Intensive", "Shine"],
      "1.6 HDi": [],
      "1.6 THP": [],
      "1.6 e-HDi": ["Dynamic", "Intensive"],
      "2.0 HDi": [],
    },
    "C4 Picasso": {
      "1.6 BlueHDi": ["Feel", "Intensive", "Shine"],
      "1.6 HDi": ["Dynamique", "Exclusive", "Intensive", "SX PK", "VTR PK"],
      "1.6 e-HDi": ["Dynamique", "Intensive"],
    },
    "C4 X": {
      "1.2 PureTech": ["Feel", "Feel Bold", "Max", "Shine", "Shine Bold", "You"],
      "1.5 BlueHDi": ["Feel Bold", "Shine", "Shine Bold"],
    },
    "C5": {
      "1.6 HDi": ["Confort", "Dynamique", "Executive", "SX", "SX PK"],
      "1.6 THP": ["Confort", "Dynamique", "Exclusive"],
      "1.6 e-HDi": ["Confort", "Dynamique", "Executive"],
      "2.0": ["Exclusive", "SX", "SX PK"],
      "2.0 HDi": ["Break", "Dynamique", "Exclusive", "Hdi", "SX", "SX PK"],
      "2.2 HDi": [],
      "2.7 HDi": [],
    },
    "C6": {
      "2.7 HDi": [],
      "3.0": [],
    },
    "C8": {
      "2.0 HDi Collection": [],
      "2.0 HDi SX": [],
      "2.0 X": [],
      "2.2 HDi SX": [],
    },
    "Evasion": {
      "1.9 TD SX": [],
      "2.0 SX": [],
    },
    "Saxo": {
      "1.4": ["SX", "VSX"],
      "1.5D": ["SX", "X"],
      "1.6": ["SX", "VTR", "VTS"],
    },
    "XM": {
      "CT VSX": [],
      "Classic": [],
    },
    "Xantia": {
      "1.8": [],
      "1.9": [],
      "2.0": ["HDI", "SX"],
    },
    "Xsara": {
      "1.4": ["1.4", "HDI"],
      "1.6": ["SX", "VTR"],
      "1.8": [],
      "2.0": ["HDI", "VTS"],
      "Picasso 1.6": ["1.6", "HDI"],
      "Picasso 1.8": [],
      "Picasso 2.0": ["Exclusive", "HDI"],
    },
    "ZX": {
      "1.4": ["Avantage", "X"],
      "1.8": [],
      "2.0": [],
    },
    "e-C3": {
      "Max": [],
      "Plus": [],
    },
    "e-C4": {
      "Max": [],
      "Shine Bold": [],
    },
    "e-C4 X": {
      "Max": [],
      "Shine Bold": [],
    },
  },
  "Cupra": {
    "Born": {
    },
    "Leon": {
      "Standart": [],
      "Supreme": [],
      "VZ Line": [],
    },
  },
  "DS Automobiles": {
    "DS 3": {
      "1.2 PureTech": [],
      "1.6 THP": ["D-Sport", "Racing"],
      "1.6 VTi": [],
      "1.6 e-HDi": ["D-Sport", "D-Style"],
    },
    "DS 4": {
      "1.2 Puretech": ["Esprit de Voyage", "Pallas", "Performance Line"],
      "1.5 BlueHDi": ["Esprit de Voyage", "Pallas", "Performance Line", "Trocadero"],
      "1.6 BlueHDi": [],
      "1.6 VTi": [],
      "1.6 e-HDi": ["D-Sport", "D-Style"],
    },
    "DS 5": {
      "1.6 BlueHDi": [],
      "1.6 THP": [],
      "1.6 e-HDi": [],
      "2.0 HDi": [],
    },
    "DS 9": {
      "1.6 E-Tense": [],
      "1.6 Puretech": ["Opera", "Performance Line", "Rivoli", "Rivoli+"],
    },
  },
  "Dacia": {
    "Jogger": {
      "1.0 ECO-G": ["Essential", "Expression", "Extreme", "Seri Limite Extreme"],
      "1.0 T": ["Essential", "Expression", "Extreme"],
      "1.6 Hybrid": [],
    },
    "Lodgy": {
      "1.3 TCE": ["Ambiance", "Stepway"],
      "1.5 BlueDCI": ["Ambiance", "Laureate", "Stepway"],
      "1.5 dCi": ["Allroad", "Laureate", "Stepway", "Stepway Style"],
      "1.6 ECO-G": [],
      "1.6 SCE": [],
    },
    "Logan": {
      "0.9 ECO-G": [],
      "0.9 Tce MCV": [],
      "1.0 MCV": [],
      "1.2": ["1.2", "Ambiance"],
      "1.2 MCV": [],
      "1.4": ["1.4", "Ambiance", "Black Line", "Laureate"],
      "1.5 dCi": ["Ambiance", "Black Line", "Laureate"],
      "1.5 dCi MCV": ["Ambiance", "Black Line", "Laureate"],
      "1.6": ["Ambiance", "Laureate", "Prestige"],
      "1.6 MCV": ["Ambiance", "Black Line", "Laureate"],
    },
    "Sandero": {
      "0.9 ECO-G": [],
      "0.9 TCe": ["Stepway", "Stepway Ambiance", "Stepway Easy-R", "Stepway Style", "Techroad Easy-R", "Turbo Stepway", "Turbo Stepway Easy-R"],
      "1.0": ["Ambiance", "Comfort"],
      "1.0 T": ["Comfort", "Essential", "Expression", "Prestige", "Stepway Comfort"],
      "1.0 T ECO-G": ["Comfort", "Stepway"],
      "1.2": ["Ambiance", "Black Line"],
      "1.4": ["Ambiance", "Black Line", "Laureate"],
      "1.5 BlueDCI": [],
      "1.5 dCi": ["Ambiance", "Black Line", "Laureate", "Stepway", "Stepway Style"],
      "1.6": [],
    },
    "Solenza": {
      "Clima": [],
      "Comfort": [],
      "Prima": [],
      "Rapsodie": [],
      "Scala": [],
    },
  },
  "Daewoo": {
    "Chairman": {
      "600 L": [],
      "600 S": [],
    },
    "Espero": {
    },
    "Lanos": {
      "1.5": ["S", "SE", "SX"],
      "1.6": [],
    },
    "Leganza": {
      "CDX": [],
      "SX": [],
    },
    "Matiz": {
      "S": [],
      "SE": [],
    },
    "Nexia": {
      "GL": [],
      "GLE": [],
      "GLX": [],
      "GTX": [],
    },
    "Nubira": {
      "1.6": [],
      "1.8": [],
      "2.0": [],
    },
    "Racer": {
    },
    "Tico": {
      "SL": [],
      "SX": [],
    },
  },
  "Daihatsu": {
    "Applause": {
      "Li": [],
      "X": [],
      "Xi": [],
    },
    "Charade": {
      "1.3": [],
      "1.5": [],
    },
    "Copen": {
    },
    "Cuore": {
      "High Grade": [],
      "Low Grade": [],
      "Thrifty": [],
    },
    "Materia": {
      "Gold": [],
      "Silver": [],
    },
    "Move": {
    },
    "Sirion": {
      "1.0": ["1.0", "CL"],
      "1.3": ["1.3", "Sporty", "Touring"],
    },
    "YRV": {
      "1.3": [],
      "Plus": [],
      "Turbo": [],
    },
  },
  "Dodge": {
    "Avenger": {
      "2.0 CRD": [],
      "2.4 SXT": [],
    },
    "Challenger": {
      "GT": [],
      "R/T": [],
      "SE": [],
      "SRT Hellcat": [],
      "SRT8": [],
      "SXT Plus": [],
    },
    "Charger": {
      "3.6": [],
      "6.2": [],
      "6.4": [],
    },
    "Magnum": {
      "5.7": [],
      "6.1": [],
    },
  },
  "Eagle": {
  },
  "Ferrari": {
    "12Cilindri": {
    },
    "296": {
      "GTB": [],
      "GTS": [],
    },
    "360": {
      "Modena": [],
      "Modena F1": [],
      "Spider F1": [],
    },
    "430": {
      "F430": [],
      "F430 Spider": [],
    },
    "458": {
      "Italia": [],
      "Spider": [],
    },
    "488": {
      "GTB": [],
      "Pista": [],
      "Spider": [],
    },
    "575": {
    },
    "599": {
    },
    "612": {
    },
    "812": {
    },
    "California": {
      "4.3": [],
      "T": [],
    },
    "F12": {
    },
    "F355": {
      "GTS": [],
      "Spider": [],
    },
    "F8": {
      "Spider": [],
      "Tributo": [],
    },
    "FF": {
    },
    "Portofino": {
    },
    "Roma": {
    },
    "SF90": {
      "Spider 4.0": [],
      "Stradale 4.0": [],
    },
  },
  "Fiat": {
    "124 Spider": {
    },
    "126 Bis": {
      "126": [],
      "650": [],
    },
    "500 Ailesi": {
      "500 0.9 TwinAir": [],
      "500 1.0 Hybrid": ["Cult", "Dolcevita", "Sport"],
      "500 1.2": ["8V RockStar Dualogic", "Anniversario", "Cult", "Lounge", "Pop", "Popstar", "Sport", "Vintage"],
      "500 1.4": ["Lounge", "Pop", "Sport"],
      "500 Abarth": [],
      "500C 0.9 TwinAir": [],
      "500C 1.2": ["8V Star Dualogic", "Anniversario", "Cult", "Lounge"],
      "500C 1.4": [],
      "500E": [],
      "500L 0.9 TwinAir": [],
      "500L 1.3 Mjet": ["Bi-Color", "Cross Dualogic", "Cross Plus", "Lounge", "Panoramic Edition", "Pop", "PopStar", "RockStar", "Wagon"],
      "500L 1.4": ["Cross", "Cross Plus", "Mirror", "Panoramic Edition", "Pop", "PopStar"],
      "500L 1.6 Mjet": ["Beats Edition", "Lounge", "RockStar"],
    },
    "Albea": {
      "1.2": ["Active", "Dynamic", "EL", "HL", "SL", "Speed"],
      "1.3 Multijet": ["Active", "Dynamic", "EL", "SL"],
      "1.4 Fire": ["Active", "Dynamic"],
      "1.6": ["Dynamic", "EL", "HL"],
      "Sole 1.3 Multijet": ["Active", "Active Plus", "Dynamic", "Dynamic Plus", "Premio", "Premio Plus"],
      "Sole 1.4 Fire": ["Active", "Active Plus", "Dynamic", "Dynamic Plus", "Premio", "Premio Plus"],
    },
    "Brava": {
      "1.4": [],
      "1.6": ["ELX", "SX"],
    },
    "Bravo": {
      "1.4": ["Active", "Active Plus", "Fire Pop"],
      "1.4 Multiair": [],
      "1.4 T-Jet": ["Active Plus", "Dynamic Plus", "Sport Style"],
      "1.4 Turbo": ["Active", "Dynamic", "Emotion"],
      "1.6": ["1.6", "SX"],
      "1.6 Mjet": ["Active", "Active Plus", "Dynamic", "Dynamic Plus", "Easy", "Emotion", "Pop", "Sport Style"],
      "2.0": [],
    },
    "Coupe": {
      "2.0": [],
      "2.0 Turbo": [],
    },
    "Croma": {
      "1.9 JTD": [],
      "2.0 iE": [],
    },
    "Egea": {
      "1.0 Firefly": ["Lounge", "Urban"],
      "1.3 Multijet": ["Easy", "Easy Plus", "Easy Stil", "Lounge", "Mirror", "Street", "Urban", "Urban Plus"],
      "1.4 Fire": ["Easy", "Easy Plus", "Easy Stil", "Limited", "Lounge", "Lounge Plus", "Mirror", "Street", "Urban", "Urban Plus"],
      "1.4 T-Jet": [],
      "1.5 T4 Hibrit": ["Easy", "Limited", "Lounge", "Urban"],
      "1.6 E-Torq": ["Easy", "Easy Plus", "Lounge", "Lounge Plus", "Mirror", "S-Design", "Sport", "Street", "Urban", "Urban Plus"],
      "1.6 Multijet": ["Comfort", "Easy", "Easy Plus", "Easy Stil", "Limited", "Lounge", "Lounge Plus", "Mirror", "S-Design", "Sport", "Street", "Urban", "Urban Plus"],
    },
    "Idea": {
      "1.3 Multijet": ["Active", "Dynamic"],
      "1.4": ["Active", "Dynamic", "Dynamic Plus"],
    },
    "Linea": {
      "1.3 Multijet": ["Active", "Active Plus", "Actual", "Actual Plus", "Dynamic", "Dynamic Plus", "Easy", "Emotion", "Emotion Plus", "Lounge", "Mood", "Pop", "Urban", "VIA"],
      "1.4 Fire": ["Active", "Active Plus", "Actual", "Actual Plus", "Dynamic", "Easy", "Mood", "Pop", "VIA"],
      "1.4 Turbo": ["Active", "Active Plus", "Dynamic", "Dynamic Plus", "Emotion", "Emotion Plus"],
      "1.6 Multijet": ["Active Plus", "Dynamic", "Dynamic Plus", "Easy", "Emotion", "Emotion Plus", "Lounge", "Urban", "VIA"],
    },
    "Marea": {
      "1.6": ["ELX", "Exclusive", "Liberty", "SX"],
      "1.9 JTD": [],
      "2.0 HLX": [],
    },
    "Multipla": {
    },
    "Palio": {
      "1.2": ["Active", "Dynamic", "Dynamic Speedgear", "EL", "EL Speedgear", "EL Weekend", "Feel", "Go", "HL", "HL Speedgear", "HL Weekend", "S", "S Weekend", "SL"],
      "1.3 Multijet": ["Active", "Active Sole", "Dynamic", "Dynamic Sole", "EL", "Premio Sole", "SL"],
      "1.4": ["EL", "EL Weekend", "HL", "RT"],
      "1.4 Fire": ["Active", "Active Sole", "Dynamic", "Dynamic Sole", "Premio Sole"],
      "1.6": ["HL", "HL Weekend", "Sporting"],
    },
    "Panda": {
      "0.9 TwinAir": ["Joy", "Pop", "S&S"],
      "1.0 Hybrid": ["City", "Cross", "Urban"],
      "1.1 Active": [],
      "1.2": ["1.2", "Active", "Dynamic", "Lounge", "Pop", "Popstar"],
      "1.2 Fire": ["City Cross", "Cross", "Urban"],
    },
    "Punto": {
      "1.2": ["1.2", "Dynamic", "Pop", "PopStar"],
      "1.3 Multijet": ["Dynamic", "Easy", "Lounge", "Pop", "Popstar", "Shine", "Urban"],
      "1.4": ["Dynamic", "Easy S&S", "Lounge S&S", "Mair Easy S&S", "Mair Lounge S&S", "Pop S&S", "Popstar S&S", "Urban S&S"],
      "1.6": [],
      "1.7 D": [],
      "1.8 HGT": [],
      "1.9 D": [],
      "EVO 1.3 Multijet": ["Active", "Dynamic", "My Life"],
      "EVO 1.4": ["Active", "Dynamic", "Fire Active", "Fire Dynamic", "Fire My Life", "Multiair Dynamic"],
      "Grande 1.2 S5": [],
      "Grande 1.3 Multijet": ["1.3 Multijet", "Active", "Actual", "Dynamic", "Emotion", "Fun"],
      "Grande 1.4": ["Fire Active", "Fire Dynamic", "Fire Fun", "Fire S&S", "Starjet Dynamic", "Starjet Emotion", "Starjet Fun", "T-jet Dynamic", "T-jet Sport"],
    },
    "Regata": {
    },
    "Siena": {
      "1.2": ["EL", "S"],
      "1.4": [],
      "1.6": [],
    },
    "Stilo": {
      "1.4": [],
      "1.6": ["Active", "Actual", "Dynamic", "Dynamic MultiWagon"],
      "1.9 JTD": ["Dynamic", "Dynamic MultiWagon"],
    },
    "Tempra": {
      "1.6": ["S", "SX", "SX A", "SX AK", "SX AK SW", "SX SW", "ie SLX", "ie SLX SW"],
      "2.0": ["ie", "ie 16v", "ie SW"],
    },
    "Tipo": {
      "1.4": ["DGT", "S", "SX", "SX ie", "ie"],
      "1.6": ["DGT", "S", "SLX", "SLX ie", "SX", "ie"],
      "2.0": [],
    },
    "Topolino": {
      "Topolino": [],
      "Topolino Plus": [],
    },
    "UNO": {
      "1.3": [],
      "1.4 ie": [],
      "1.4 ie 70 S": [],
      "1.4 ie Hobby": [],
      "1.4 ie SX": [],
      "45 S": [],
      "60 S": [],
      "70 S": [],
      "70 SX": [],
      "70 SXie": [],
    },
    "Ulysse": {
    },
  },
  "Ford": {
    "B-Max": {
      "1.0": [],
      "1.4": ["Titanium", "Trend"],
      "1.5 TDCi": ["Titanium", "Trend"],
      "1.6": ["Titanium", "Trend"],
      "1.6 TDCi": ["Titanium", "Trend"],
    },
    "C-Max": {
      "1.0 EcoBoost": [],
      "1.5": [],
      "1.5 TDCi": ["Titanium", "Trend"],
      "1.6": ["Ghia", "Trend"],
      "1.6 EcoBoost": [],
      "1.6 TDCi": ["Ghia", "Titanium", "Trend"],
      "2.0 TDCi": ["Titanium", "Trend"],
    },
    "Crown Victoria": {
    },
    "Escort": {
      "1.3": ["CL", "CLX"],
      "1.4": ["CL", "CLX", "Flair"],
      "1.6": ["CL", "CLX", "Classic", "Ghia"],
      "1.8": ["CL", "CLX", "Flair", "Fun", "Ghia", "XR3i"],
    },
    "Festiva": {
      "GL": [],
      "XL": [],
    },
    "Fiesta": {
      "1.0 EcoBoost": ["ST Line", "Style", "Titanium", "Trend"],
      "1.0 EcoBoost Hybrid": [],
      "1.0 GTDi": ["Black", "Red", "ST Line", "Titanium"],
      "1.1": ["CLX", "Festival", "Style", "Titanium", "Trend", "Trend X"],
      "1.25": ["Flair", "Fun", "Ghia", "My Fiesta", "Trend", "Trend X"],
      "1.3": [],
      "1.4": ["Collection", "Comfort", "Cool", "Fun", "Ghia", "My Fiesta", "Titanium", "Trend"],
      "1.4 TDCi": ["Collection", "Comfort", "Cool", "My Fiesta", "Sport", "Titanium", "Trend"],
      "1.5 EcoBoost": [],
      "1.5 TDCi": ["Titanium", "Trend", "Trend X"],
      "1.6": ["Collection", "Comfort", "Cool", "Ghia", "RS", "Sport", "Titanium", "Trend", "Trend X"],
      "1.6 TDCi": ["Ghia", "Sport", "Titanium"],
      "1.6 Ti-VCT": ["Trend", "Trend X"],
      "1.8 D": [],
      "2.0": [],
    },
    "Focus": {
      "1.0 EcoBoost GTDi": ["Active Stil", "Active X", "ST Line", "Style", "Titanium", "Titanium Stil", "Titanium X", "Trend X"],
      "1.0 EcoBoost Hybrid": ["Active", "Active Stil", "Active X", "Titanium Stil", "Titanium X"],
      "1.4": ["Comfort", "Trend"],
      "1.5 EcoBlue": ["Active", "Active Stil", "Active X", "ST Line", "Titanium", "Titanium Stil", "Titanium X", "Trend X"],
      "1.5 TDCi": ["ST Line", "Style", "Titanium", "Trend X"],
      "1.5 Ti-VCT": ["Titanium", "Trend X"],
      "1.6": ["Ambiente", "Collection", "Comfort", "Darkline", "Ghia", "Gold Collection", "Titanium", "Trend", "Trend X"],
      "1.6 SCTi": [],
      "1.6 TDCi": ["Collection", "Comfort", "Ghia", "Sport", "Style", "Titanium", "Trend", "Trend X"],
      "1.6 Ti-VCT": ["Collection", "Comfort", "Style", "Style Plus", "Titanium", "Trend", "Trend X"],
      "1.8": ["Comfort", "Ghia"],
      "1.8 TDCi": ["Comfort", "Di Ghia", "Ghia"],
      "2.0": ["Ghia", "ST", "ST3", "Sport Trend", "Titanium CC"],
      "2.0 TDCi": [],
      "2.3": [],
    },
    "Fusion": {
      "1.4 TDCi": ["Collection", "Comfort", "Urbanite"],
      "1.6": ["1.6", "Comfort", "Lux"],
      "1.6 TDCi": [],
    },
    "Galaxy": {
      "1.9 TDi": [],
      "2.0 TDCi Ghia": [],
      "2.0 TDCi Titanium": [],
      "2.0i": [],
      "2.3 16 V": [],
      "2.8i VR6": [],
    },
    "Granada": {
      "1.7": [],
      "2.0": [],
      "2.3": [],
      "2.8": [],
    },
    "Grand C-Max": {
      "1.5": [],
      "1.6 EcoBoost": [],
      "1.6 TDCI": [],
    },
    "Ka": {
      "1.2 Titanium": [],
      "1.3": ["1.3", "1.3 City", "1.3 Collection"],
      "1.6 Street": [],
    },
    "Mondeo": {
      "1.5 Ecoboost": ["Style", "Titanium"],
      "1.5 TDCI": ["Style", "Titanium"],
      "1.6": ["Selective", "Titanium", "Trend"],
      "1.6 Ecoboost": ["Selective", "Titanium", "Trend"],
      "1.6 TDCi": ["Selective", "Style", "Titanium", "Trend"],
      "1.8": ["Ambiente", "CLX"],
      "1.8 TDCi": [],
      "2.0": ["GLX", "Ghia", "Ghia X", "Selective", "Trend"],
      "2.0 TDCi": ["Ghia", "Selective", "Style", "Titanium", "Trend"],
      "2.5": [],
    },
    "Mustang": {
      "2.3 Convertible": [],
      "2.3 EcoBoost": [],
      "3.7 V6": [],
      "3.8": [],
      "4.0": [],
      "4.0 GT": [],
      "4.6 GT": [],
      "5.0 Convertible": [],
      "5.0 Fastback": [],
      "5.0 GT": [],
      "5.0 GT Premium": [],
      "Shelby GT 500": [],
    },
    "Orion": {
    },
    "Probe": {
    },
    "Puma": {
    },
    "S-Max": {
      "1.6 TDCi Titanium": [],
      "2.0 TDCi Titanium": [],
      "2.0i Titanium": [],
    },
    "Scorpio": {
      "2.0": [],
      "2.3": ["CLX", "Ghia"],
      "2.9": [],
    },
    "Sierra": {
      "1.6": [],
      "1.8": [],
      "2.0": ["CL", "GL", "GLS", "Ghia"],
      "XR 2000": [],
      "XR4i": [],
    },
    "Taunus": {
      "1.3 L": [],
      "1.6": ["GL", "GT", "GXL", "Ghia", "L", "S", "TC SW"],
      "2.0": ["GLS", "GTS"],
    },
    "Taurus": {
    },
  },
  "Geely": {
    "Echo": {
      "Basic": [],
      "Comfort": [],
    },
    "Emgrand": {
      "GS": [],
      "GSL": [],
      "GSL Basic": [],
      "GSL Premium": [],
      "GSL Premium SR": [],
    },
    "FC": {
    },
    "Familia": {
    },
  },
  "Honda": {
    "Accord": {
      "1.5 VTEC": ["Executive", "Executive Plus"],
      "1.8": [],
      "2.0": ["2.0", "ES", "EX", "Executive", "LS", "Sport"],
      "2.2": [],
      "2.4": [],
      "3.0": [],
    },
    "CR-Z": {
      "GT": [],
      "Sport": [],
    },
    "CRX": {
      "1.6i": [],
      "VTi": [],
    },
    "City": {
      "1.4": ["Comfort", "ES", "Elite", "LS", "Sport"],
      "1.5 i-VTEC": ["Elegance", "Executive"],
    },
    "Civic": {
      "1.3": [],
      "1.4": ["1.4i", "Comfort", "Elegance", "Hybrid", "LS", "S", "S Euro Civic", "Sport", "i S"],
      "1.5": ["EL", "EX", "GL", "LS"],
      "1.5 VTEC": ["Eco Elegance", "Eco Elegance Plus", "Eco Executive Plus", "Eco Premium", "Elegance", "Elegance Plus", "Executive Plus", "RS", "Sport", "Sport Plus"],
      "1.6": ["1.6i", "Comfort", "Elegance", "LS", "LS Euro Civic", "LSi", "Shuttle", "Si", "Sport", "VTi", "i ES", "i LS"],
      "1.6 VTEC": ["ES", "LS", "LS Elegance"],
      "1.6i DTEC": ["Comfort", "Elegance", "Executive", "Executive Plus", "Premium", "Sport"],
      "1.6i VTEC": ["Black Edition", "Dream", "ES", "Eco Dream", "Eco Elegance", "Eco Executive", "Eco Premium", "Elegance", "Executive", "LS", "Premium"],
      "1.8": ["Executive", "Sport", "Type-S"],
      "2.0": ["Type-R"],
      "2.2i CTDi": [],
    },
    "E": {
    },
    "FR-V": {
    },
    "Integra": {
    },
    "Jazz": {
      "1.5": [],
    },
    "Legend": {
      "3.2": [],
      "3.5": [],
    },
    "Prelude": {
      "2.0": ["2.0i", "EX"],
      "2.2 VTi": [],
    },
    "S2000": {
    },
    "Shuttle": {
      "2.2": [],
      "2.3": [],
    },
    "Stream": {
      "ES": [],
      "Si": [],
    },
  },
  "Hyundai": {
    "Accent": {
      "1.3": ["Admire", "GL Active", "GL Comfort", "GLS", "GLS Active", "LS", "LX", "LX Allegro", "LX World Cup Special Edition"],
      "1.5": ["1.5i GL", "1.5i GLS", "1.5i LS", "GL", "GLS", "GLX", "GT", "LS"],
      "1.5 CRDi": ["Active", "Admire", "Comfort", "GLS", "LS"],
      "1.6": [],
    },
    "Accent Blue": {
      "1.4 CVVT": ["Biz", "Mode", "Mode Plus", "Prime"],
      "1.4 D-CVVT": [],
      "1.6 CRDI": [],
    },
    "Accent Era": {
    },
    "Atos": {
    },
    "Coupe": {
    },
    "Elantra": {
    },
    "Excel": {
    },
    "Genesis": {
    },
    "Getz": {
    },
    "Grandeur": {
    },
    "Ioniq": {
    },
    "Ioniq 6": {
    },
    "Matrix": {
    },
    "Sonata": {
    },
    "Trajet": {
    },
    "i10": {
    },
    "i20": {
    },
    "i20 Active": {
    },
    "i20 N": {
    },
    "i20 Troy": {
    },
    "i30": {
    },
    "i40": {
    },
    "iX20": {
    },
  },
  "Infiniti": {
    "G": {
      "G35": [],
      "G37 GT": [],
      "G37 S": [],
      "G37 X": [],
    },
    "I30": {
    },
    "M": {
      "M30d": [],
      "M30d GT": [],
      "M30d S": [],
    },
    "Q30": {
      "1.5 D": ["Premium", "Premium City Black", "Premium City Black Sport", "Premium Executive"],
      "1.6": [],
    },
    "Q50": {
      "2.0T": [],
      "2.2d": [],
    },
  },
  "Jaguar": {
    "Daimler": {
    },
    "F-Type": {
      "2.0": [],
      "2.0 T": [],
      "3.0 S": [],
      "3.0 S Plus": [],
      "5.0 S": [],
    },
    "S-Type": {
      "2.5": ["2.5", "Sport"],
      "2.7 D": ["Executive", "Sport"],
      "3.0": ["Classic", "Executive", "Sport"],
      "4.0": [],
    },
    "Sovereign": {
      "3.6": [],
      "4.0": [],
      "4.0 Long": [],
    },
    "X-Type": {
      "2.0 D": ["Executive", "High", "Sport"],
      "2.1": ["Classic", "Executive"],
      "2.2": [],
      "2.2 D": [],
      "2.5": ["Executive", "SE High", "Sport"],
      "3.0": [],
    },
    "XE": {
      "Portfollio": [],
      "Prestige": [],
      "R-Sport": [],
    },
    "XF": {
      "2.0": ["2.0", "Business", "Luxury", "Premium Luxury", "R-Sport Plus"],
      "2.0 D": ["Prestige Plus", "R-Sport Plus"],
      "2.2 D": [],
      "2.7 D": ["Luxury", "Premium Luxury"],
      "3.0": ["Luxury", "Premium Luxury"],
      "3.0 D": ["Luxury", "Premium Luxury", "S Portfolio"],
    },
    "XJ": {
      "2.0": [],
      "2.0i": ["Luxury", "Portfolio", "Premium Luxury", "Premium Luxury Sport Plus"],
      "3.0": [],
      "3.0 D": ["Portfolio", "Premium"],
      "3.2": [],
      "4.0": [],
      "5.0": [],
      "XJ6": ["2.7 D", "3.0", "3.0 Executive"],
      "XJ8": ["3.2", "3.5 Executive", "4.2 Executive"],
    },
    "XJR": {
    },
    "XJS": {
    },
    "XK8": {
      "4.0": [],
      "4.2": [],
    },
    "XKR": {
      "4.0 Cabrio": [],
      "4.2": [],
      "5.0": [],
    },
  },
  "Kia": {
    "Capital": {
      "1.5 GLX": [],
      "1.8": [],
    },
    "Carens": {
      "1.6": [],
      "2.0 CRDi": ["CRDi", "EX"],
    },
    "Carnival": {
      "2.5": [],
      "2.9 CRDI": ["EX", "Premium"],
      "2.9 TD": ["LS", "Premium", "STD"],
    },
    "Ceed": {
      "1.0": ["Cool", "Cool Tekno"],
      "1.4": ["Cool", "Cool Plus", "Cool Tekno", "GSL", "Live"],
      "1.4 T-GDI": [],
      "1.5": ["Cool", "Elegance", "Elegance Plus"],
      "1.5 Hibrit": [],
      "1.5 T-GDI": ["Elegance", "Elegance Plus"],
      "1.6": ["Concept", "Motion"],
      "1.6 CRDi": ["Comfort", "Comfort SW", "Concept", "Concept Plus", "Concept Plus SW", "Concept SW", "Cool", "Cool SW", "Elegance", "Motion", "Motion SW", "Premium", "Premium SW", "Prestige", "Prestige SW", "Project"],
      "1.6 GDI": [],
      "1.6 Hybrid": [],
    },
    "Cerato": {
      "1.5 CRDi": ["Advance", "EX", "EX Comfort", "LX"],
      "1.6 CRDi": ["Comfort", "Concept", "Concept Plus", "Concept Techno", "EX Comfort", "LX", "Prestige"],
      "1.6 EX": ["Advance", "Comfort", "DSL Advance", "Premium"],
      "1.6 GSL": ["Comfort", "Concept", "Core", "Koup", "Premium"],
      "1.6 LX": ["Base", "Basic"],
      "1.6 MPI": ["Comfort", "Elegance", "Prestige"],
      "2.0 CRDi": [],
    },
    "Clarus": {
    },
    "Joice": {
    },
    "Magentis": {
      "2.0 CRDi": [],
      "2.0 LX": [],
      "2.0 SE": [],
      "2.5": [],
    },
    "Opirus": {
    },
    "Optima": {
      "1.7 CRDi": [],
      "2.4 MPI": [],
    },
    "Picanto": {
      "1.0 MPI Cool": [],
      "1.0 MPI Feel": [],
      "1.0 MPI Live": [],
      "1.1 EX": [],
      "1.1 EX Advance": [],
      "1.1 EX Comfort": [],
      "1.1 Hiper": [],
      "1.2 Cool": [],
      "1.2 Feel": [],
      "1.25 EX": [],
    },
    "Pride": {
      "1.3": [],
      "1.3 DLX": [],
      "1.3 GLXi": [],
    },
    "Pro Ceed": {
      "1.6": [],
      "1.6 CRDi": ["Concept", "Cool", "Cool Plus", "Premium"],
    },
    "Rio": {
      "1.0 TGDI": ["Cool", "Elegance Tekno", "Prestige"],
      "1.2 MPI": ["Cool", "Elegance Tekno"],
      "1.25 CVVT": ["Comfort", "Concept", "Cool", "Elegance", "Elegance Tekno", "Fancy", "Natty"],
      "1.3": ["Classic", "Comfort", "Trend"],
      "1.4 CRDi": ["Comfort", "Concept", "Concept Plus", "Fancy", "Natty", "Sporty"],
      "1.4 EX": ["Advance", "Comfort", "EX", "Trend"],
      "1.4 GSL": ["Basic", "Trend"],
      "1.4 WGT CRDI": ["Cool", "Elegance", "Prestige"],
      "1.4L MPI": ["Cool Tecno", "Elegance", "Prestige"],
      "1.5": ["Comfort", "Luxury", "Trend"],
      "1.5 CRDi": ["EX Advance", "EX Comfort", "Trend"],
    },
    "Sephia": {
      "1.5": ["GTX", "LS", "RS"],
      "1.6": ["GTX", "LS", "SLX"],
    },
    "Shuma": {
      "LS": [],
      "RS": [],
    },
    "Stinger": {
    },
    "Venga": {
      "1.4 CRDi": ["Active", "EX"],
      "1.6": [],
      "1.6 CRDi": ["Panaroma", "Panaroma Plus"],
    },
  },
  "Kuba": {
    "City": {
    },
    "M5": {
    },
  },
  "Lada": {
    "Kalina": {
    },
    "Priora": {
    },
    "Samara": {
      "1.3": [],
      "1.5": [],
    },
    "VAZ": {
      "1.5": [],
      "2104": [],
      "2107": [],
      "2109": [],
    },
    "Vega": {
      "1.5": [],
      "1.6": [],
    },
  },
  "Lamborghini": {
    "Aventador": {
      "LP 700-4": [],
      "LP 750-4": [],
    },
    "Gallardo": {
      "LP 560-4": [],
      "Spyder": [],
    },
    "Huracan": {
      "Evo": [],
      "LP-610-4": [],
      "LP-640-2": [],
    },
    "Revuelto": {
    },
  },
  "Lancia": {
    "Delta": {
      "1.4 T": [],
      "1.6 Mjet": [],
      "1.8": [],
    },
    "Phedra": {
    },
    "Thema": {
    },
    "Thesis": {
    },
    "Y (Ypsilon)": {
      "0.9": [],
      "1.2": [],
      "1.3 Mjet": [],
      "1.4": [],
    },
  },
  "Lexus": {
    "CT": {
      "Comfort": [],
      "Comfort Plus": [],
    },
    "ES": {
      "Business": [],
      "Business Plus": [],
      "Executive": [],
    },
    "GS": {
    },
    "IS": {
    },
    "LC": {
    },
    "LM": {
    },
    "LS": {
      "460": [],
      "500h": [],
      "600": [],
      "600h": [],
    },
    "RC": {
    },
  },
  "Lincoln": {
    "Continental": {
    },
    "MKZ": {
    },
    "Town Car": {
    },
  },
  "Lotus": {
    "Elise": {
    },
    "Emira": {
    },
    "Esprit": {
    },
  },
  "Luqi": {
    "EV300": {
    },
    "EV400": {
    },
  },
  "MG": {
    "F": {
    },
    "MG3": {
    },
    "MG4": {
      "Comfort": [],
      "Luxury": [],
      "MG4": [],
      "XPower": [],
    },
    "MG7": {
      "Excellence": [],
      "Excellence Red Edition": [],
      "Passion": [],
    },
    "ZS": {
    },
    "ZT": {
    },
  },
  "Maserati": {
    "4 Serisi": {
    },
    "Cambiocorsa": {
      "Coupe": [],
      "Spyder": [],
    },
    "Ghibli": {
      "2.0": [],
      "2.0 MHEV": [],
      "3.0": [],
      "3.0 D": [],
      "3.0 GDI": [],
    },
    "GranCabrio": {
    },
    "GranCabrio E": {
    },
    "GranTurismo": {
      "3.0": [],
      "4.7 S": [],
      "MC-Stradale": [],
    },
    "GranTurismo E": {
    },
    "MC20": {
    },
    "Quattroporte": {
      "3.0": ["Q4 Modena", "Q4 S"],
      "3.0 D": ["3.0 D", "Gransport"],
      "3.8": [],
      "4.7 S": [],
    },
    "Spyder": {
      "2.0": [],
      "GT": [],
    },
  },
  "Mazda": {
    "121": {
    },
    "3": {
      "1.5 SkyActive-G": ["Power", "Reflex", "Soul"],
      "1.6": ["90. Yıl", "Base", "Comfort", "Dynamic", "High", "Mid", "Mirai", "Sport", "Sport CE", "Sport Comfort", "Sport Dynamic", "Touring"],
    },
    "323": {
      "1.5": ["1.5i", "Familia", "GLX", "Practica"],
      "1.6": ["1.6i", "F Astina", "Familia", "GL", "GLX"],
      "1.7": [],
      "1.8": ["1.8i", "F Astina", "Familia", "GT"],
      "2.0": [],
      "2.0 DITD": [],
    },
    "5": {
      "2.0 D": [],
    },
    "626": {
      "1.6": [],
      "2.0": [],
    },
    "Lantis": {
    },
    "MPV": {
      "2.0": [],
      "2.3 TE": [],
      "2.5 TD": [],
    },
    "MX": {
      "MX-3": [],
      "MX-5": ["1.5", "1.6", "1.8", "2.0"],
    },
    "Premacy": {
    },
    "RX": {
      "RX-7": [],
      "RX-8": [],
    },
    "Xedos": {
    },
  },
  "McLaren": {
    "720S": {
    },
    "Artura": {
    },
    "GT": {
    },
    "MP4-12C": {
    },
  },
  "Mercedes-Benz": {
    "190": {
      "190": [],
      "190 D": ["2.0", "2.5", "2.5 Turbo"],
      "190 E": ["1.8", "2.0", "2.3", "2.5", "2.6"],
    },
    "200": {
      "200": [],
      "200 CE": [],
      "200 D": [],
      "200 E": [],
      "200 TE": [],
    },
    "220": {
      "220 D": [],
      "220 E": [],
    },
    "230": {
      "230": [],
      "230 CE": [],
      "230 E": [],
      "230 GE": [],
      "230 TE": [],
      "230.4": [],
      "230.6": [],
    },
    "240": {
    },
    "250": {
      "250 D": [],
      "250 TD": [],
    },
    "260": {
      "260 E": [],
      "260 SE": [],
    },
    "280": {
      "280": [],
      "280 S": [],
      "280 SE": [],
      "280 SLC": [],
    },
    "300": {
      "300 CE": [],
      "300 CE 24": [],
      "300 D": [],
      "300 E": [],
      "300 E 24": [],
      "300 SE": [],
      "300 SEL": [],
      "300 SL": [],
      "300 TD": [],
      "300 TE": [],
    },
    "320": {
      "320 CE": [],
      "320 E": [],
    },
    "380": {
      "380 SE": [],
      "380 SEL": [],
    },
    "400": {
    },
    "420": {
      "420 SE": [],
      "420 SEC": [],
      "420 SEL": [],
    },
    "500": {
      "500 SE": [],
      "500 SEC": [],
      "500 SEL": [],
    },
    "560": {
      "560 SEC": [],
      "560 SEL": [],
    },
    "600": {
    },
    "A Serisi": {
      "A 140": ["Avantgarde", "Classic", "Elegance"],
      "A 150": ["Avantgarde", "Elegance", "Polarstar", "Trend"],
      "A 160": ["160", "Avantgarde", "Classic", "Elegance"],
      "A 160 CDI": [],
      "A 170": [],
      "A 170 CDI": [],
      "A 180": ["AMG Sport", "Elegance", "Prime", "Progressive", "Style", "Style Plus", "Urban"],
      "A 180 CDI": ["BlueEfficiency AMG", "BlueEfficiency Prime", "BlueEfficiency Style", "BlueEfficiency Urban", "Elegance"],
      "A 180 d": ["AMG", "Progressive", "Style", "Style Blackart Edition", "Urban"],
      "A 200": ["AMG", "AMG+", "BlueEfficiency AMG", "Progressive", "Progressive+", "Style"],
      "A 200 CDI": [],
      "A 45 AMG": [],
      "A 45 S AMG": ["Final Edition", "Performans"],
    },
    "AMG GT": {
      "4.0 R": [],
      "4.0 S": [],
      "43 4Matic": [],
      "43 AMG GT": [],
      "53 4Matic": [],
      "63 AMG GT": [],
      "63 S 4Matic": [],
    },
    "B Serisi": {
      "B 150": ["150", "Boyut", "Prestige", "Special Edition"],
      "B 160": ["Boyut", "Sport"],
      "B 170": [],
      "B 180": ["AMG", "BlueEfficiency Elite", "BlueEfficiency Prime", "BlueEfficiency Sport", "BlueEfficiency Style", "BlueEfficiency Urban", "Progressive", "Progressive+", "Style"],
      "B 180 CDI": ["180 CDI", "AMG", "BlueEfficiency Elite", "BlueEfficiency Sport", "BlueEfficiency Style", "BlueEfficiency Urban", "Prestige", "Special Edition"],
      "B 180 D": ["Progressive", "Style", "Urban"],
      "B 200": ["200", "AMG", "CDI BlueEfficiency", "CDI Special Edition", "Progressive+", "Sport"],
    },
    "C Serisi": {
      "C 180": ["AMG", "Avantgarde", "BlueEfficiency AMG", "BlueEfficiency Avantgarde", "BlueEfficiency C-Edition", "BlueEfficiency Elegance", "BlueEfficiency Estate", "BlueEfficiency Fascination", "BlueEfficiency Prime", "BlueEfficiency Selection Plus", "BlueEfficiency Sport", "BlueEfficiency Start", "Classic", "Comfort", "Elegance", "Esprit", "Exclusive", "Fascination", "Komp. Avantgarde", "Komp. BlueEfficiency AMG", "Komp. BlueEfficiency Avantgarde", "Komp. BlueEfficiency Diamond", "Komp. BlueEfficiency Elegance", "Komp. BlueEfficiency Fascination", "Komp. BlueEfficiency Luxury", "Komp. BlueEfficiency Prime", "Komp. BlueEfficiencyStart", "Komp. Classic", "Komp. Elegance", "Komp. GP", "Komp. Sport", "Komp. Sportcoupe", "Sport", "Style"],
      "C 180 d": [],
      "C 200": ["200", "AMG", "All-Terrain", "Avantgarde", "CGI Fascination", "Classic", "Edition 1 AMG", "Elegance", "Esprit", "Exclusive", "Komp. Avantgarde", "Komp. Classic", "Komp. Elegance", "Komp. Premium", "Komp. Sport", "Komp. Sportcoupe", "Sport"],
      "C 200 CDI": ["Avantgarde", "Classic", "Elegance"],
      "C 200 D": ["AMG", "Avantgarde", "Comfort", "Elegance", "Exclusive", "Fascination", "Sport", "Style"],
      "C 200 d BlueTEC": ["AMG", "Avantgarde", "Comfort", "Exclusive", "Fascination", "Style"],
      "C 220": [],
      "C 220 CDI": ["AMG", "Avantgarde", "BlueEfficiency AMG", "BlueEfficiency Fascination", "Classic", "Elegance", "Esprit", "Fascination", "Premium", "Sport", "Sport Edition", "Sportcoupe"],
      "C 220 d": ["220 d", "Classic", "Elegance", "Esprit"],
      "C 230": ["Avantgarde", "Elegance", "Komp. Avantgarde", "Komp. Elegance"],
      "C 240": ["Avantgarde", "Elegance"],
      "C 250": ["AMG", "BlueEfficiency AMG", "Fascination"],
      "C 250 CDI": ["BlueEfficiency AMG", "BlueEfficiency Fascination"],
      "C 250 D": [],
      "C 250 TD": ["Classic", "Elegance", "Esprit", "Sport"],
      "C 270 CDI": ["Avantgarde", "Elegance"],
      "C 280": [],
      "C 300": ["300 4 Matic AMG", "AMG"],
      "C 32 AMG": [],
      "C 320": [],
      "C 320 CDI": ["Avantgarde", "Enerji"],
      "C 350": [],
      "C 36 AMG": [],
      "C 43 AMG": [],
      "C 63 AMG": [],
    },
    "CL": {
      "500": [],
      "55 AMG": [],
      "550": [],
      "600": [],
      "63 AMG": [],
    },
    "CLA": {
      "180": [],
      "180 d": ["AMG", "Comfort", "Style", "Urban"],
      "200": ["AMG", "AMG 4Matic", "AMG+", "AMG+ 4Matic", "Comfort", "Style", "Urban"],
      "220 CDI": [],
      "350": [],
      "45 AMG": [],
      "45 S": ["AMG", "Final Edition", "Performance+", "Shooting Brake Final Edition"],
    },
    "CLC": {
      "BlueEfficiency": [],
      "Emotion": [],
      "Grand Prix": [],
      "Prime": [],
    },
    "CLE": {
    },
    "CLK": {
      "CLK 200": ["200", "200 Komp.", "Avantgarde", "Elegance", "Komp. Avantgarde", "Komp. Dinamik", "Komp. Elegance"],
      "CLK 220 CDI": [],
      "CLK 230 Komp.": ["230 Komp.", "Komp. Avantgarde", "Komp. Elegance"],
      "CLK 240": ["Avantgarde", "Elegance"],
      "CLK 270 CDI": ["Avantgarde", "Elegance"],
      "CLK 320": ["320", "Avantgarde", "Elegance"],
      "CLK 320 CDI": [],
      "CLK 430": [],
      "CLK 500": [],
      "CLK 55 AMG": [],
    },
    "CLS": {
      "250 CDI": ["BlueEfficiency", "Bluetec 4Matic", "Sport"],
      "300 D": [],
      "320": [],
      "350": ["350", "Bluetec AMG"],
      "350 CDI": ["350 CDI", "AMG", "BlueEfficiency", "Innovation", "Innovation Sport"],
      "350 D": [],
      "400 D": [],
      "500": [],
      "53 AMG": [],
      "63 AMG": [],
    },
    "E Serisi": {
      "E 180": ["AMG", "AMG Edition", "AMG Premium", "Avantgarde", "Edition 1 AMG", "Edition 1 Exclusive", "Edition E", "Elite", "Exclusive", "Premium", "Style"],
      "E 200": ["200", "200 D", "AMG", "Avantgarde", "Cabrio", "Classic", "Coupe", "Elegance", "Exclusive", "Komp. Avantgarde", "Komp. Business", "Komp. Classic", "Komp. Elegance"],
      "E 200 CDI": ["Avantgarde", "Classic", "Elegance"],
      "E 200 CGI": ["AMG", "BlueEfficiency Avantgarde", "BlueEfficiency Elegance", "BlueEfficiency Prime"],
      "E 200 d": ["AMG", "Avantgarde", "E 200 d", "Exclusive"],
      "E 220": ["Avantgarde", "Classic", "E 220", "Elegance"],
      "E 220 CDI": ["Avantgarde", "BlueEfficiency", "Classic", "Elegance", "Prime", "Start"],
      "E 220 d": ["AMG", "Avantgarde", "Classic", "Edition 1 AMG", "Edition 1 Exclusive", "Elegance", "Exclusive"],
      "E 230": ["Avantgarde", "Classic", "Elegance"],
      "E 240": ["Avantgarde", "Classic", "Elegance"],
      "E 250": ["AMG", "EditionE", "Elite", "Premium"],
      "E 250 CDI": ["AMG", "Avantgarde", "BlueEfficiency Avantgarde", "BlueEfficiency Elegance", "E 250 CDI", "Edition", "Elegance", "Elite", "Elite Avantgarde", "Premium", "Prime"],
      "E 250 CGI": ["250 CGI", "AMG", "BlueEfficiency Avantgarde", "BlueEfficiency Dynamic", "BlueEfficiency Elegance", "Elegance", "Elite", "Premium", "Premium AMG"],
      "E 250 D": ["250 D", "Avantgarde"],
      "E 250 TD": ["Avantgarde", "Elegance"],
      "E 270 CDI": ["Avantgarde", "Classic", "Elegance"],
      "E 280": ["280", "Avantgarde", "Classic", "Elegance"],
      "E 280 CDI": ["Avantgarde", "Elegance"],
      "E 290 TD": ["Avantgarde", "Classic", "Elegance"],
      "E 300": ["300", "300 D", "AMG", "Exclusive"],
      "E 300 CGI": [],
      "E 300 D": ["AMG", "Exclusive"],
      "E 300 DE": [],
      "E 300 TD": ["Avantgarde", "Elegance"],
      "E 320": ["320", "Avantgarde", "Classic", "Elegance"],
      "E 320 CDI": ["Avantgarde", "Classic", "Elegance"],
      "E 350": ["4Matic Edition", "AMG", "Avantgarde", "BlueEfficiency Premium", "Classic", "Elegance", "Exclusive"],
      "E 350 CDI": ["AMG Premium", "Avangarde", "BlueEfficiency Dynamic", "BlueEfficiency Elegance", "BlueTEC Elite", "BlueTEC Premium", "Premium"],
      "E 350 CGI": ["350 CGI", "AMG", "Premium"],
      "E 400": [],
      "E 420": [],
      "E 430": ["Avantgarde", "Elegance"],
      "E 500": ["Avantgarde", "Elegance"],
      "E 53 AMG": [],
      "E 55 AMG": [],
      "E 63 AMG": [],
    },
    "EQE": {
      "280": [],
      "300+": [],
      "350": [],
      "350+": ["AMG", "Premium Plus"],
      "43": [],
      "53 AMG": [],
    },
    "EQS": {
      "350 AMG": [],
      "450": [],
      "450+": [],
      "53 AMG": [],
      "580": [],
    },
    "Maybach S": {
      "S 450": [],
      "S 500": [],
      "S 560": [],
      "S 580": [],
      "S 600": [],
      "S 680": [],
    },
    "R Serisi": {
      "R 280": [],
      "R 320": [],
      "R 350": ["350", "350 L"],
    },
    "S Serisi": {
      "S 280": [],
      "S 300": [],
      "S 320": ["320", "320 CDI", "320 CDI L", "320 L"],
      "S 350": ["350", "350 CDI", "350 CDI L", "350 L", "350 L BlueEfficiency", "350 L BlueTEC", "350 L Business", "350 TD", "BlueTEC 4Matic", "BlueTEC AMG"],
      "S 400": ["400 CDI", "400 L", "400 L AMG", "400 L CDI", "400 d", "AMG", "Hybrid", "Sport"],
      "S 420": ["420 CDI", "420 L", "420 L CDI"],
      "S 450": ["450", "450 D Inspration", "450 L", "450 Sport"],
      "S 500": ["500", "500 AMG", "500 L", "500 L Inspiration"],
      "S 55 AMG": [],
      "S 550": [],
      "S 580": ["AMG Line", "Executive Line"],
      "S 600": [],
      "S 63 AMG": [],
    },
    "SL": {
      "280": [],
      "300": [],
      "320": [],
      "350": [],
      "400": [],
      "43 AMG": [],
      "500": [],
      "55 AMG": [],
      "63 AMG": [],
    },
    "SLC": {
    },
    "SLK": {
      "200": [],
      "200 Kompressor": [],
      "230 Kompressor": [],
      "250": [],
      "280": [],
      "300 AMG": [],
      "320": [],
      "350": [],
    },
    "SLS AMG": {
    },
  },
  "Mini": {
    "Cooper": {
      "1.5": ["Cabrio", "Chili", "Classic", "Favoured", "Iconic", "JCW", "Pepper", "Premium", "Pure", "Resolute Edition", "Salt", "Salt Pepper Chili", "Sidewalk", "Signature", "Türkiye Paketi"],
      "1.5 D": ["Chili", "Pepper", "Salt", "Salt Chili", "Salt Pepper Chili", "Türkiye Paketi"],
      "1.6": ["Baker Street", "Cabrio", "Coupe", "Roadster", "Türkiye Paketi"],
      "1.6 D": [],
      "2.0": ["Favoured", "JCW"],
    },
    "Cooper Clubman": {
      "1.5": ["1.5", "Chili", "Iconic", "Pepper", "Untold Edition"],
      "1.5 D": ["One Classic", "One Iconic", "One Salt", "One Signature", "One Türkiye Paketi"],
      "1.6": [],
      "1.6 S": [],
      "2.0": ["JCW", "JCW Iconic"],
    },
    "Cooper Electric": {
      "Classic": [],
      "Iconic": [],
      "Inspired": [],
      "Signature": [],
    },
    "Cooper S": {
      "1.6": ["1.6", "Cabrio", "Coupe", "Roadster"],
      "2.0": ["2.0", "Favoured"],
    },
    "Cooper SD": {
    },
    "John Cooper": {
      "1.6": ["Works", "Works Clubman"],
      "2.0": [],
    },
    "One": {
      "1.4": [],
      "1.6": [],
    },
  },
  "Mitsubishi": {
    "3000GT": {
    },
    "Attrage": {
      "Intense": [],
      "Intense Plus": [],
    },
    "Carisma": {
      "1.6": ["Avance", "Classic", "Comfort", "GL", "GLX"],
      "1.8 GDI": ["Avance", "Comfort", "Elegance", "L", "LX"],
      "1.9 DI-D": ["Avance", "Comfort"],
    },
    "Colt": {
      "1.1": [],
      "1.3": ["Elegance", "Inform", "Instyle", "Invite", "Invite CZ3 AMT"],
      "1.5": ["CZT", "Instyle", "Invite"],
      "1.5 DI-D": ["Inform", "Invite"],
      "1.6": [],
    },
    "Eclipse": {
    },
    "Galant": {
      "1.6": [],
      "1.8": [],
      "2.0": ["Comfort", "GLS"],
    },
    "Grandis": {
    },
    "Lancer": {
      "1.3": [],
      "1.5": ["GLX", "Inform", "Invite"],
      "1.6": ["Comfort", "GLX", "Inform", "Invite", "Plus"],
      "1.8": ["GTi", "Intense"],
    },
    "Sigma": {
    },
    "Space Star": {
      "1.2 Intense": [],
      "1.2 Invite": [],
      "1.3": [],
      "1.6": [],
      "1.9 DI-D": [],
    },
    "Space Wagon": {
    },
  },
  "Nissan": {
    "200 SX": {
      "1.8 Turbo": [],
      "2.0 Turbo": [],
    },
    "300 ZX": {
    },
    "350 Z": {
      "Coupe": [],
      "Roadster": [],
    },
    "Almera": {
      "1.5": ["Comfort", "Luxury", "Tekna", "Visia"],
      "1.6": ["GX", "SLX"],
      "1.8": [],
    },
    "Altima": {
    },
    "Bluebird": {
    },
    "GT-R": {
      "Black Edition": [],
      "R35": [],
    },
    "Laurel Altima": {
    },
    "Maxima": {
      "2.0 QX": [],
      "3.0 QX": [],
    },
    "Micra": {
      "1.0": ["Platinum", "Platinum Premium", "Tekna", "Visia"],
      "1.2": ["Desire", "Match", "Mood", "Passion", "Platinum", "Punch", "Puzzle", "Sport", "Street", "Tekna", "Tekna Pack", "Visia"],
      "1.3": ["GX", "LX", "Magic", "SLX"],
      "1.4": ["Elegance", "Tekna"],
      "1.5 dCi": ["Mood", "Passion"],
      "1.6": [],
    },
    "NX Coupe": {
    },
    "Note": {
      "1.2": ["Tekna", "Visia"],
      "1.4": ["Tekna", "Visia"],
      "1.5 dCi": ["Platinum", "Tekna", "Tekna Pack", "Visia"],
      "1.6": ["Tekna", "Visia"],
    },
    "Pixo": {
    },
    "Primera": {
      "1.6": ["1.6", "Comfort", "GX", "LX", "SLX", "Special", "Tekna", "Traveler", "Visia"],
      "1.8": [],
      "1.9 dCi": [],
      "2.0": ["Elegance", "GT", "SE", "Tekna"],
      "2.0 TD": ["Elegance", "Luxe"],
    },
    "Pulsar": {
      "1.2": ["N-Tec", "Tekna", "Visia"],
      "1.5": ["N-Tec", "Tekna"],
    },
    "Skyline": {
    },
    "Sunny": {
      "EX": [],
      "LX": [],
      "SLX": [],
    },
    "Tino": {
    },
    "Z": {
    },
  },
  "Opel": {
    "Adam": {
      "1.2": ["Glam", "Jam"],
      "1.4": [],
    },
    "Agila": {
      "Club": [],
      "Comfort": [],
    },
    "Ampera": {
    },
    "Ascona": {
      "1.6": ["C GLS", "C L"],
      "2.0": [],
    },
    "Astra": {
      "1.0 T": [],
      "1.2 GL": [],
      "1.2 T": ["Edition", "Elegance", "GS", "GS Line", "Ultimate"],
      "1.3 CDTI": ["Active", "Business", "Classic", "Cosmo", "EcoFLEX Cosmo", "EcoFLEX Enjoy", "EcoFLEX Enjoy Plus", "EcoFLEX Sport", "Edition", "Edition Plus", "Elegance", "Enjoy", "Enjoy 111.Yıl", "Enjoy Active", "Enjoy Elegance", "Enjoy Plus", "Essentia", "Essentia Konfor", "Sport"],
      "1.4": ["Classic", "Classic Twinport", "Club", "Cosmo", "Edition", "Enjoy", "Enjoy Plus", "Essentia", "GL", "GLS", "Life", "Sport", "Start"],
      "1.4 T": ["120.Yıl", "Black Edition", "Business", "Cosmo", "Cosmo Still", "Design", "Dynamic", "Edition", "Edition Plus", "Elegance", "Enjoy", "Enjoy Active", "Enjoy Plus", "Excellence", "GS Line", "GTC Sport", "Opc Line Sport", "Sport", "Sport Elegance", "Sport Stil"],
      "1.5 D": ["Edition", "Elegance", "GS Line"],
      "1.6": ["1.6", "100.Yıl", "Business", "CD", "CDX", "Cabrio", "Classic", "Classic Twinport", "Club", "Comfort", "Cosmo", "Coupe", "Edition", "Edition Plus", "Elegance", "Elegance Twinport", "Enjoy", "Enjoy 111. Yıl", "Enjoy Elegance", "Enjoy Plus", "Enjoy Twinport", "Essentia", "Essentia Konfor", "Expression", "G", "GL", "GLS", "GLX", "GTC Sport", "Sport", "Sportive"],
      "1.6 CDTI": ["120.Yıl", "Black Edition", "Business", "Cosmo", "Design", "Dynamic", "Dynamic Elite", "Edition", "Edition Plus", "Elite", "Enjoy", "Enjoy Active", "Excellence", "OPC Line Sport", "Sport"],
      "1.6 T": ["Cosmo", "Dynamic", "Enjoy", "Opc Line Sport", "Sport", "T GTC Sport"],
      "1.7 CDTI": ["Classic", "Enjoy"],
      "1.7 DTI": ["Classic", "Comfort", "GL"],
      "1.8": ["Comfort", "Cosmo", "Coupe"],
      "1.9 CDTI": ["Caravan", "Cosmo", "Enjoy", "GTC Sport", "Sport"],
      "2.0": ["GSi", "Sport"],
      "2.0 CDTI": [],
      "2.0 DTI Comfort": [],
      "2.0 T": ["2.0 T", "Cosmo", "GTC OPC", "GTC Sport"],
      "2.2": [],
    },
    "Astra-e": {
      "GS": [],
      "Ultimate": [],
    },
    "Calibra": {
      "2.0": [],
      "2.0 Turbo": [],
    },
    "Cascada": {
      "1.6 XHT Cosmo": [],
      "2.0 DTH Cosmo": [],
    },
    "Corsa": {
      "1.0": ["Color Edition", "ECO Club", "Enjoy", "Essentia", "Sport"],
      "1.0 T": [],
      "1.2": ["City", "Club", "Comfort", "Design", "Edition", "Elegance", "Enjoy", "Essentia", "Essential", "Innovation", "Silverline", "Swing", "Ultimate"],
      "1.2 T": ["Dynamic", "Edition", "Elegance", "GS", "Innovation", "Ultimate"],
      "1.2 Twinport": ["Active", "Enjoy", "Enjoy 111", "Essentia"],
      "1.3 CDTI": ["Active", "Black&White", "Color Edition", "Cosmo", "Enjoy", "Enjoy 111", "Essentia", "Silverline", "Sport"],
      "1.4": ["100. Yıl", "120.Yıl", "Black Edition", "CD", "Color Edition", "Comfort", "Cosmo", "Design", "Elegance", "Enjoy", "Essentia", "GLS", "Sport", "Swing"],
      "1.4 Twinport": ["Active", "Color Edition", "Cosmo", "Enjoy", "Enjoy 111", "Essentia", "Silverline", "Sport"],
      "1.5 D": ["Dynamic", "Edition", "Innovation"],
      "1.5 D Swing": [],
      "1.5 TD": [],
      "1.6": ["GSi", "OPC"],
      "1.7 DTI Comfort": [],
    },
    "Corsa-e": {
      "GS": [],
      "Ultimate": [],
    },
    "GT (Roadster)": {
    },
    "Insignia": {
      "1.4 T": ["Edition", "Edition Elegance"],
      "1.5 D": ["Edition", "Elegance", "Exclusive", "Grand Sport Edition", "Grand Sport Elegance", "Ultimate"],
      "1.5 T": ["Grand Sport Enjoy", "Grand Sport Excellence"],
      "1.6": ["Cosmo", "Edition"],
      "1.6 CDTI": ["Business", "Cosmo", "Country Tourer Cosmo", "Design", "Edition", "Edition Elegance", "Elite", "Grand Sport T 120.Yıl", "Grand Sport T Design", "Grand Sport T Elite", "Grand Sport T Enjoy", "Grand Sport T Excellence", "Grand Sport T Exclusive", "Sport", "Sports Tourer Cosmo", "Sports Tourer Excellence"],
      "1.6 D": ["Grand Sport Enjoy", "Grand Sport Innovation", "Sports Tourer Innovation"],
      "1.6 T": ["Cosmo", "Edition", "Edition Elegance", "Sport", "Sports Tourer Cosmo", "Sports Tourer Edition"],
      "2.0 CDTI": ["Cosmo", "Cosmo Active Select", "Cosmo Flexride", "Edition", "Edition Elegance", "Edition Elegance Active", "Grand Sport Exclusive", "Sports Tourer Cosmo", "Sports Tourer Edition", "Sports Tourer Sport"],
      "2.0 T": ["Cosmo", "Grand Sport Excellence", "Grand Sport GSI", "Sport"],
      "2.8": ["Cosmo", "OPC", "Sport"],
    },
    "Kadett": {
      "1.2": [],
      "1.3": ["D", "GL"],
      "1.4": ["GL", "GT"],
      "1.6": ["GL", "GT", "LS"],
      "1.6 D": ["1.6 D", "2.0"],
    },
    "Meriva": {
      "1.3 CDTI": ["Cosmo", "Enjoy", "Essentia"],
      "1.4 T": ["Cosmo", "Enjoy"],
      "1.6": ["Cosmo", "Enjoy", "Essentia"],
      "1.6 CDTI": ["Active", "Cosmo"],
      "1.7 CDTI": ["1.7 CDTI", "Cosmo", "Enjoy"],
    },
    "Omega": {
      "2.0": ["2.0", "CD"],
      "2.0 DTI": [],
      "2.2": ["2.2", "Comfort"],
      "2.5": ["CD", "Elegance"],
      "2.5 TD": ["2.5 TD", "Edition", "Elegance"],
      "2.6": [],
      "3.0": ["MV6", "Sport"],
    },
    "Rekord": {
      "1.7": [],
      "2.0": [],
    },
    "Signum": {
      "1.9 CDTI": [],
      "2.2": [],
      "3.0 CDTi": [],
    },
    "Tigra": {
      "1.4 TT Sport": [],
      "1.6": [],
      "1.8 TT Sport": [],
    },
    "Vectra": {
      "1.6": ["1.6", "Comfort", "Design Edition", "Edition", "Elegance", "Essentia", "GL", "GLS"],
      "1.7 GL": [],
      "1.8": ["CD", "Comfort", "Elegance", "GL"],
      "1.9 CDTI": ["Comfort", "Design", "Elegance"],
      "2.0": ["100. Yıl", "CD", "CDX", "Elegance", "GL", "GLS", "GT"],
      "2.0 DTI": ["CD", "Comfort"],
      "2.0 T": [],
      "2.2": ["Cosmo", "Elegance", "GTS"],
      "2.2 DTI": ["Comfort", "Elegance"],
      "2.5": ["CDX", "Sport"],
      "3.0 CDTI": [],
      "3.2 GTS": [],
    },
    "Zafira": {
      "1.6": ["Comfort", "Cosmo", "Edition", "Elegance", "Enjoy", "GL"],
      "1.6 CDTI": [],
      "1.8": ["Comfort", "Elegance", "Enjoy"],
      "1.9 CDTI": ["Cosmo", "Enjoy"],
      "2.0 CDTI": [],
      "2.0 DTI": ["Comfort", "Elegance"],
      "2.0 T": [],
      "2.2 16V": [],
      "2.2 DTI": [],
    },
  },
  "Peugeot": {
    "1007": {
    },
    "106": {
      "GTI": [],
      "Quicksilver": [],
      "XN": [],
      "XR": [],
      "XS": [],
      "XSi": [],
      "XT": [],
    },
    "107": {
      "1.0": ["Trendy", "Urban Move"],
      "1.4 HDi": [],
    },
    "205": {
      "1.0": [],
      "1.1": [],
      "1.4": [],
      "1.6": [],
      "1.9": [],
    },
    "206": {
      "1.4": ["Color Line", "Comfort", "Desire", "Executive", "Feline", "Fever", "Generation", "Look", "Panoramic", "Pop Art", "Sporty", "Trendy", "X-Design", "X-Line", "XR", "XS", "XT"],
      "1.4 HDi": ["Comfort", "Desire", "Feline", "Fever", "Generation", "Look", "Panoramic", "Pop Art", "Premium", "Sporty", "Trendy", "X-Design", "X-Line", "XT"],
      "1.6": ["1.6 CC", "Executive", "Quiksilver", "Roland Garros", "Sport", "XS", "XSi", "XT"],
      "1.6 HDi": [],
      "1.9": [],
      "2.0": ["CC", "GTI", "RC"],
      "2.0 HDi": [],
    },
    "206 +": {
      "1.4": ["Comfort", "Envy", "Sportium", "Urban Move"],
      "1.4 HDi": ["Comfort", "Envy", "Sportium", "Urban Move"],
    },
    "207": {
      "1.4": ["Access", "Comfort", "Envy", "Millesim", "Premium", "Sportium", "Trendy"],
      "1.4 HDi": ["Active", "Allure", "Comfort", "Dynamic", "Envy", "Millesim", "Premium", "Sportium", "Trendy", "Urban Move"],
      "1.4 VTi": ["Active", "Dynamic", "Limited", "Premium", "Trendy"],
      "1.6": [],
      "1.6 HDi": ["Active", "Allure", "Dynamic", "Dynamic CC", "Feline", "Outdoor", "Premium", "Premium Outdoor", "Trendy"],
      "1.6 THP": ["GT", "RC", "RC Le Mans"],
      "1.6 VTi": ["Active", "Allure", "Dynamic", "Feline CC", "Outdoor", "Outdoor Premium", "Premium", "Sportium", "Urban Move"],
    },
    "208": {
      "1.0 VTi": [],
      "1.2 PureTech": ["Access", "Active", "Active Prime", "Allure", "Allure Selection", "GT", "GT Line", "Prime", "Prime Selection", "Signature"],
      "1.2 VTi": ["Access", "Active", "Allure", "Urban Soul"],
      "1.4 HDi": ["Access", "Active", "Urban Soul"],
      "1.5 BlueHDi": ["Active", "Active Dynamic", "Allure", "Signature", "Signature Dynamic"],
      "1.6 BlueHDi": [],
      "1.6 HDi": ["Access", "Active", "Allure"],
      "1.6 THP": ["Allure", "GTI"],
      "1.6 VTi": [],
      "1.6 e-HDi": [],
    },
    "301": {
      "1.2 PureTech": ["Access", "Active"],
      "1.2 VTi": ["Access", "Active"],
      "1.5 BlueHDI": ["Active", "Allure"],
      "1.6 BlueHDI": ["Access", "Active", "Allure"],
      "1.6 HDi": ["Access", "Active", "Allure"],
      "1.6 VTi": ["Active", "Allure"],
    },
    "305": {
    },
    "306": {
      "1.4": ["XN", "XR"],
      "1.6": ["Diamond", "Griffe", "Platinum", "SR", "XN", "XR", "XS", "XT"],
      "1.8": ["ST", "XR", "XS", "XT"],
      "1.9": ["XND", "XRD"],
      "2.0": ["GTI", "S 16", "XSi"],
    },
    "307": {
      "1.4": ["Comfort", "Designtech", "Feline", "Look", "Profil", "XR"],
      "1.4 HDi": ["Envy", "Profil", "XR"],
      "1.6": ["CC", "Comfort", "Envy", "Feline", "Look", "Pack", "Premium", "Profil", "Technoplus", "XR", "XS", "XT", "XT Premium"],
      "1.6 HDi": ["Comfort", "Designtech", "Feline", "Look", "Pack", "Premium", "X-Design", "XS", "XT", "XT Premium"],
      "2.0": ["CC", "Sport", "XS", "XSI", "XT"],
      "2.0 HDi": ["Pack", "Premium", "XT"],
    },
    "308": {
      "1.2 Puretech": ["Access", "Active", "Active Dynamic", "Active Prime", "Allure", "Allure Dynamic", "Allure Sport", "GT", "Style", "Style Tech"],
      "1.2 VTi": ["Access", "Active"],
      "1.5 BlueHDI": ["Active Dynamic", "Style", "Style Dynamic", "Style Tech"],
      "1.6 BlueHDi": ["Access", "Active", "Allure", "GT Line", "Style"],
      "1.6 HDi": ["Access", "Active", "Allure", "Business Line", "Classic Edition", "Comfort", "Comfort Pack", "Envy", "Millesim", "Premium", "Premium Pack", "Premium Plus", "Sportium"],
      "1.6 PureTech": [],
      "1.6 THP": ["Active", "Allure", "Feeline", "Feeline Plus", "GTI", "Premium Pack", "Sportium"],
      "1.6 VTi": ["Access", "Active", "Comfort", "Confort Pack", "Envy", "Millesim", "Premium", "Premium Plus"],
      "1.6 e-HDi": ["Access", "Active", "Allure", "Classic Edition", "Classic Edition Plus", "Sportium", "Techno Edition"],
    },
    "309": {
    },
    "405": {
      "1.6": ["GL", "GR"],
      "1.8": [],
      "1.9": [],
    },
    "406": {
      "1.6": [],
      "1.8": [],
      "2.0": ["Coupe", "Premium", "ST", "SV"],
      "2.0 HDi": ["ST", "SV"],
      "2.2": [],
      "3.0": ["Coupe", "SV"],
    },
    "407": {
      "1.6 HDi": ["Blackline", "Comfort", "Executive", "Executive Black", "Millesium", "Premium"],
      "2.0": ["Comfort", "Executive", "Executive Premium"],
      "2.0 HDi": ["Comfort", "Dynamic Premium", "Executive", "Executive Premium", "GT Line"],
      "2.2": [],
      "2.7 HDi": ["Coupe", "Premium"],
    },
    "508": {
      "1.5 BlueHDi": ["Active", "Allure", "Allure Dynamic", "GT", "GT Line", "GT Selection", "Prime"],
      "1.6 BlueHDi": ["Access", "Active", "Allure", "Business"],
      "1.6 HDi": ["Access", "Active"],
      "1.6 Puretech": ["Allure", "GT", "GT Line", "Prime"],
      "1.6 THP": ["Access", "Active", "Allure"],
      "1.6 VTi": ["Access", "Active"],
      "1.6 e-HDi": ["Access", "Active", "Allure", "Style"],
      "2.0 HDi": ["Active", "Allure"],
      "2.2 HDi": [],
    },
    "605": {
      "2.0 SRTi": [],
      "2.0 SRi": [],
    },
    "607": {
      "2.2": [],
      "2.2 HDi": [],
      "3.0": ["Pack", "Standart"],
    },
    "806": {
    },
    "807": {
      "2.0": [],
      "2.2": [],
      "2.2 HDi Executive": [],
    },
    "Pars": {
    },
    "RCZ": {
      "Asphalt": [],
      "Carbon": [],
      "Evolution": [],
      "R": [],
      "Yearling": [],
    },
    "e-208": {
    },
    "e-308": {
    },
  },
  "Pontiac": {
    "Firebird": {
      "5.7 Trans Am": [],
    },
  },
  "Porsche": {
    "718": {
      "718": [],
      "Boxster": [],
      "Boxster T": [],
      "Cayman": [],
      "Cayman GT4 RS": [],
      "Cayman Style Edition": [],
    },
    "911": {
      "Carrera": [],
      "Carrera 2": [],
      "Carrera 4": [],
      "Carrera 4 GTS": [],
      "Carrera 4S": [],
      "Carrera GTS": [],
      "Carrera S": [],
      "GT3": [],
      "GT3 RS": [],
      "Targa 4": [],
      "Targa 4 GTS": [],
      "Targa 4S": [],
      "Turbo": [],
      "Turbo S": [],
      "Turbo S Cabriolet": [],
    },
    "968": {
    },
    "Boxster": {
      "Boxster": [],
      "S": [],
    },
    "Cayman": {
      "Cayman": [],
      "S": [],
    },
    "Panamera": {
      "Panamera": [],
      "Panamera 4": [],
      "Panamera 4 - 10 Years Edition E-Hybrid": [],
      "Panamera 4 E-Hybrid": [],
      "Panamera 4 Platinum Edition": [],
      "Panamera 4 Sport Turismo": [],
      "Panamera 4S": [],
      "Panamera 4S Diesel": [],
      "Panamera 4S E-Hybrid": [],
      "Panamera Diesel": [],
      "Panamera GTS": [],
      "Panamera S": [],
      "Panamera Turbo": [],
      "Panamera Turbo E-Hybrid": [],
      "Panamera Turbo S": [],
      "Panamera Turbo S E-Hybrid": [],
    },
    "Taycan": {
      "4 Cross Turismo": [],
      "4S": [],
      "4S Cross Turismo": [],
      "4S Performance": [],
      "4S Performance Plus": [],
      "GTS": [],
      "GTS Sport Turismo": [],
      "Taycan": [],
      "Turbo": [],
      "Turbo Cross Turismo": [],
      "Turbo S": [],
    },
  },
  "Proton": {
    "315": {
    },
    "413": {
    },
    "415": {
    },
    "416": {
    },
    "418": {
    },
    "420": {
    },
    "Gen-2": {
      "Base Line": [],
      "High Line": [],
      "Low Line": [],
      "Medium Line": [],
      "R3": [],
    },
    "Saga": {
      "Low Line": [],
      "Medium Line": [],
    },
    "Savvy": {
    },
    "Waja": {
    },
  },
  "RKS": {
    "A1": {
    },
    "D2": {
    },
    "M5": {
    },
    "R3": {
    },
  },
  "Regal Raptor": {
    "K4": {
    },
    "K5": {
    },
    "K5 Long": {
    },
    "K5 Pro": {
    },
  },
  "Relive": {
    "Baw1": {
    },
    "EZI": {
    },
    "N1": {
    },
  },
  "Renault": {
    "Clio": {
      "0.9 TCe": ["Icon", "Joy", "Touch"],
      "0.9 TCe Sport Tourer": ["Icon", "Joy", "Touch"],
      "1.0 SCe": ["Equilibre", "Joy"],
      "1.0 TCe": ["Equilibre", "Evolution", "Icon", "Joy", "RS Line", "Techno Esprit Alpine", "Touch"],
      "1.2": ["Authentique", "Dynamique", "Expression", "Extreme", "Icon", "Joy", "Night & Day", "RL", "Tom Tom Edition", "Touch", "Touchrome"],
      "1.2 Grandtour": ["Authentique", "Dynamique", "Executive", "Extreme", "Night & Day"],
      "1.2 SportTourer": ["Icon", "Joy"],
      "1.2 TCe": ["GT Line", "Icon", "Joy", "Touch", "Touchrome"],
      "1.3 TCe": ["Icon", "RS Line", "Touch"],
      "1.4": ["1.4", "Alize", "Authentique", "Dynamique", "Expression", "Extreme", "Fidji", "Privilege", "RN", "RNA", "RT", "RTA", "RXT", "Tom Tom Edition"],
      "1.4 Grandtour": [],
      "1.5 BlueDCI": ["Icon", "Joy", "Touch"],
      "1.5 dCi": ["Alize", "Authentique", "Authentique Edition", "Dynamique", "Executive", "Expression", "Expression Plus", "Extreme", "Extreme Edition", "Fidji", "GT Line", "Icon", "Joy", "Night & Day", "Tom Tom Edition", "Touch"],
      "1.5 dCi Grandtour": ["Authentique Edition", "Dynamique", "Executive", "Extreme", "Night & Day"],
      "1.5 dCi SportTourer": ["Icon", "Joy", "Touch"],
      "1.6": ["Dynamique", "Executive", "Expression", "Extreme", "Extreme Edition", "Night & Day", "RS", "RT", "RTE", "RXT"],
      "1.6 E-Tech": [],
      "1.6 Grandtour": ["Extreme", "Night & Day"],
      "1.8": [],
      "1.9 D": [],
      "2.0": [],
    },
    "Espace": {
      "1.6 dCi": [],
      "1.9 dCi": [],
      "2.0": ["Expression", "RT", "RXE"],
      "2.0 dCi": ["Family", "Initiale"],
      "2.2": ["DT RXE", "RT"],
      "2.2 dCi": ["Expression", "Privilege"],
      "3.0": [],
      "3.0 dCi": [],
      "3.0 dCi Grand": [],
    },
    "Fluence": {
      "1.5 dCi": ["Authentique", "Bold Edition", "Business", "Dynamique", "Elegance", "Expression", "Extreme", "Extreme Edition", "Icon", "Joy", "Privilege", "Touch", "Touch Plus"],
      "1.6": ["Authentique", "Bold Edition", "Business", "Dynamique", "Expression", "Extreme", "Icon", "Joy", "Privilege", "Touch", "Touch Plus"],
      "1.6 dCi": [],
    },
    "Fluence Z.E.": {
    },
    "Grand Modüs": {
      "1.4": ["Authentique", "Dynamique"],
      "1.5 DCI": ["Authentique", "Dynamique"],
      "1.6": ["Authentique", "Dynamique"],
    },
    "Grand Scenic": {
      "1.4 T": [],
      "1.5 dCi": ["Expression", "Extreme", "Icon", "Privilege"],
      "1.6": [],
      "1.9 dCi": ["Dynamique", "Privilege"],
    },
    "Laguna": {
      "1.5 dCi": ["Dynamique", "Executive", "Expression", "Privilege"],
      "1.6": ["1.6", "Authentique", "Dynamique", "Expression", "Privilege", "RXE", "RXT"],
      "1.8": ["1.8", "RXE"],
      "1.9 DTi": ["RXE", "RXT"],
      "1.9 dCi": ["Authentique", "Dynamique", "Expression", "Privilege"],
      "2.0": ["Dynamique", "Expression", "Privilege", "RTI", "RXE", "RXT"],
      "2.0 T": ["Dynamique", "GT", "Privilege"],
      "2.0 dCi": ["Dynamique", "Executive", "Privilege", "Sport Emotion"],
      "2.2 dCi": [],
      "3.0": [],
    },
    "Latitude": {
      "1.5 dCi": ["Executive", "Expression", "Privilege"],
      "2.0 dCi": ["Executive", "Privilege"],
    },
    "Megane": {
      "1.0 TCe": [],
      "1.2 TCe": ["Icon", "Touch", "Touchrome"],
      "1.3 TCe": ["Icon", "Joy", "Joy Comfort", "Touch"],
      "1.4": ["Alize", "Authentique", "Expression", "Extreme", "Premiere", "RTA", "RTE"],
      "1.4 T": ["Color Edition", "Impressor"],
      "1.4 T Sport Tourer": [],
      "1.5 Blue DCI": ["Icon", "Joy", "Joy Comfort", "Touch"],
      "1.5 dCi": ["Authentique", "Bose Edition", "Business", "Color Edition", "Dynamique", "Exception", "Expression", "Expression Plus", "Extreme", "GT-Line", "Icon", "Impressor", "Joy", "Joy Plus", "Play", "Privilege", "Sport Edition", "Sportway", "Touch Plus", "Touchrome"],
      "1.5 dCi Grandtour": ["Authentique", "Privilege"],
      "1.5 dCi Sport Tourer": ["Expression", "Extreme", "GT-Line", "Privilege", "Touch"],
      "1.6": ["Alize", "Authentique", "Business", "Dynamique", "Dynamique Wagon", "Exception", "Expression", "Extreme", "GT Line", "Icon", "Joy", "Legend", "Panorama Edition", "Play", "Privilege", "RNA", "RTA", "RTE", "RXE", "RXT", "RXi", "Sport", "Sport Edition", "Sportway", "Touch", "Touch Plus"],
      "1.6 CC": ["Dynamique", "Privilege"],
      "1.6 Cabrio": [],
      "1.6 Coupe": ["Dynamique", "Expression", "Privilege", "RN"],
      "1.6 Grandtour": ["Dynamique", "Privilege"],
      "1.6 Sport Tourer": [],
      "1.6 dCi": ["GT-Line", "GT-Line Energy", "GT-Line Energy Sport Tourer", "Icon", "Privilege Energy"],
      "1.9 DTi": ["Alize", "Expression", "RTE", "RXE"],
      "1.9 dCi": ["Alize", "Authentique", "Dynamique", "Expression", "Privilege"],
      "1.9 dCi Grandtour": ["Dynamique", "Privilege"],
      "2.0": ["Dynamique", "Privilege", "RXE", "RXT"],
      "2.0 CC": ["Dynamique", "Privilege"],
      "2.0 Coupe": ["2.0 Coupe", "Privilige"],
      "2.0 T": [],
      "2.0 dCi": [],
    },
    "Megane E-Tech": {
      "Iconic": [],
      "Techno": [],
    },
    "Modus": {
      "1.2": [],
      "1.4": ["Authentique", "Dynamique"],
      "1.5 dCi": ["Authentique", "Dynamique"],
      "1.6": ["Authentique", "Dynamique"],
    },
    "R 11": {
      "Flash": [],
      "Flash S": [],
      "GTL": [],
      "GTS": [],
      "GTX": [],
      "Rainbow": [],
      "Turbo": [],
    },
    "R 12": {
      "GTS": [],
      "SW": [],
      "TL": [],
      "TN": [],
      "TS": [],
      "TSW": [],
      "TX": [],
      "Toros": [],
    },
    "R 19": {
      "1.4": ["1.4i", "Beymen Club", "RN", "RT", "TR"],
      "1.4 Europa": ["Prima", "RL", "RN", "RNA", "RTE", "RTE Alize"],
      "1.6": [],
      "1.6 Europa": ["RL", "RNA", "RNE", "RNE Alize", "RT", "RTE", "RTE Alize", "iE"],
      "1.7": [],
      "1.7 Europa": [],
      "1.8": ["1.8", "1.8 Cabriolet"],
      "1.8 Europa": ["1.8 Europa", "RTi"],
      "1.8 RTi": [],
      "1.9": ["GTD", "RN"],
      "1.9 Europa": ["RL", "RN", "RN TD", "RNA", "RT TD"],
    },
    "R 21": {
      "1.6": [],
      "1.7": ["GTS", "GTS Manager", "Nevada TL"],
      "2.0": ["Concorde", "GTD", "GTX", "Manager", "Turbo D"],
    },
    "R 25": {
    },
    "R 5": {
      "1.1": ["Five", "L"],
      "1.4": [],
      "1.6": [],
    },
    "R 9": {
      "1.4": ["Fairway", "GT", "GTC", "GTL", "GTS", "Spring", "TSE", "TX"],
      "1.4 Broadway": ["1.4 Broadway", "GTE", "RL", "RN", "RNi"],
      "1.6": ["Broadway", "Fairway"],
    },
    "R5 E-Tech": {
      "EV40": [],
      "EV52": [],
    },
    "Safrane": {
      "2.0": ["2.0", "RT", "RXE"],
      "2.1": [],
      "2.2": [],
      "2.5": ["2.5", "RXT"],
      "3.0": ["Initiale", "RXE"],
    },
    "Scenic": {
      "1.5 dCi": ["Authentique", "Conquest", "Dynamique", "Exception", "Expression", "Extreme", "Icon", "Privilege", "Sportway", "Touch"],
      "1.6": ["1.6", "Authentique", "Dynamique", "Exception", "Expression", "Extreme", "Privilege", "RTE", "RXE", "RXT", "Sportway"],
      "1.9 DTi": [],
      "1.9 dCi": ["Authentique", "Dynamique", "Expression", "Privilege", "RXE", "RXT"],
      "2.0": ["Dynamique", "Privilege", "RXT", "RXi", "Sportway"],
    },
    "Symbol": {
      "0.9 TCe": ["Joy", "Turbo Touch"],
      "1.0 SCe": ["Joy", "Touch"],
      "1.0 TCe": [],
      "1.2": ["Authentique", "Authentique Edition", "Expression", "Expression Plus", "Joy", "Limited Edition", "SL Collection", "Touch"],
      "1.4": ["Authentique", "Expression", "Expression Plus", "Extreme"],
      "1.5 BlueDCI": ["Joy", "Touch"],
      "1.5 DCI": ["Authentique", "Authentique Edition", "Dynamique", "Expression", "Expression Plus", "Extreme", "Joy", "SL Collection", "Touch", "Touch Plus"],
    },
    "Taliant": {
      "1.0 Sce": [],
      "1.0 T": ["Joy", "Touch"],
    },
    "Talisman": {
      "1.3 Tce": ["Icon", "Touch"],
      "1.5 dCi": ["Icon", "Touch"],
      "1.6 dCi": ["Icon", "Touch"],
    },
    "Tondar": {
    },
    "Twingo": {
      "1.2": ["Alize", "Base", "Easy", "Expression", "Pack", "Wind"],
      "1.3": [],
    },
    "Twizy": {
    },
    "Vel Satis": {
      "2.0 T": [],
      "3.5": [],
    },
    "ZOE": {
      "Intense": [],
      "ZOE": [],
    },
  },
  "Rolls-Royce": {
    "Ghost": {
      "6.6": [],
      "6.75": [],
    },
    "Phantom": {
    },
    "Spectre": {
    },
    "Wraith": {
    },
  },
  "Rover": {
    "200": {
      "Si": [],
      "Vi": [],
    },
    "214": {
    },
    "216": {
      "Cabrio": [],
      "Coupe": [],
      "SLi": [],
      "Si": [],
    },
    "220": {
    },
    "25": {
      "1.4": ["Classic", "Club"],
      "1.6": ["Classic", "Club"],
    },
    "414": {
    },
    "416": {
    },
    "420": {
    },
    "45": {
      "1.6": ["Classic", "Club", "Comfort Club"],
      "1.8": [],
      "2.0": [],
    },
    "620": {
    },
    "75": {
      "1.8": [],
      "2.0": [],
      "2.5": [],
      "2.5 CDTi": [],
    },
    "820": {
    },
    "MGF": {
    },
  },
  "Saab": {
    "9-3": {
      "1.9 TTiD": [],
      "1.9 TiD": [],
      "1.9 TiDS": ["Arc", "Vector", "Vector Sport"],
      "1.9 TiDSPF": [],
      "2.0": [],
      "2.0 T": ["Aero", "Vector"],
      "2.0 TS": [],
      "2.8 TS": [],
    },
    "9-5": {
      "1.9 TiD": [],
      "2.0": ["TSE", "Vector"],
      "2.0 LPT": [],
      "2.3 T": ["Aero", "Vector"],
      "2.3 TS": [],
      "3.0": [],
    },
    "900": {
    },
    "9000": {
    },
  },
  "Saipa": {
  },
  "Seat": {
    "Alhambra": {
      "1.4 TSI": [],
      "1.9 TDI": [],
      "2.0 TDI": [],
    },
    "Altea": {
      "1.4 TSI": [],
      "1.6": ["Reference", "Stylance", "Style"],
      "1.6 TDI": ["I-Tech XL", "Style XL"],
      "1.9 TDI": ["Stylance XL", "Style"],
      "2.0 TDI": [],
    },
    "Arosa": {
    },
    "Cordoba": {
      "1.4": ["Basic", "Costa", "Elegance", "Reference", "Signo", "Stella", "Stylance"],
      "1.4 TDI": ["Basic", "Elegance", "Reference", "S-Rider", "Signo", "Stella", "Stylance"],
      "1.6": ["Latino", "SE", "SX", "SXE", "Signo", "Signo Vario", "Stella", "Stella Vario"],
      "1.9 TDI": ["SXE Vario", "Signo", "Signo Vario", "Sport"],
    },
    "Exeo": {
      "Reference": [],
      "Style": [],
    },
    "Ibiza": {
      "1.0": ["Referance", "Style"],
      "1.0 EcoTSI": ["FR", "Sport Coupe FR", "Style"],
      "1.2": ["Elegance", "GLX", "Reference"],
      "1.2 Sport Coupe": [],
      "1.2 TDI": [],
      "1.2 TDI Sport Tourer": [],
      "1.2 TSI": ["Copa Plus", "Reference", "Reference Plus", "Sport", "Style"],
      "1.2 TSI Sport Coupe": ["FR", "Sport"],
      "1.2 TSI Sport Tourer": ["Reference", "Style"],
      "1.3": ["CLX", "GLX"],
      "1.4": ["Basic", "Copa", "Copa Plus", "Costa", "Elegance", "Premium", "Reference", "SE", "SXE", "Select", "Signo", "Sport", "Stella", "Stylance", "Style"],
      "1.4 Sport Coupe": ["Reference", "Sport"],
      "1.4 Sport Tourer": ["Copa", "Reference", "Style"],
      "1.4 TDI": ["Elegance", "Reference", "S-Rider", "Signo", "Sport", "Stella", "Stylance", "Style"],
      "1.4 TSI Sport Coupe": ["Bocanegra", "Cupra", "FR"],
      "1.5": ["CLX", "GLX"],
      "1.5 EcoTSI": ["FR", "FR 40. Yıl Özel Seri"],
      "1.6": ["Elegance", "Latino", "Reference", "SE", "SXE", "Signo", "Sport", "Stella"],
      "1.6 Sport Coupe": [],
      "1.6 TDI": ["CR Copa", "CR Style", "Reference", "Style"],
      "1.8": [],
      "1.8 TSI Sport Coupe": [],
      "1.9 TDI": ["Cupra", "Signo", "Sport"],
      "2.0": ["Cupra", "GT"],
    },
    "Leon": {
      "1.0 EcoTSI": ["Ecomotive Style", "Style", "Style Visio"],
      "1.0 TSI": [],
      "1.0 eTSI": ["Style", "Style Plus"],
      "1.2 TSI": ["Reference", "SC Style", "Style"],
      "1.4 EcoTSI": ["Euroleague Edition", "FR", "Xcellence"],
      "1.4 TSI": ["Copa Plus", "FR", "Reference", "SC FR", "Stylance", "Style", "Xcellence"],
      "1.5 EcoTSI": ["FR", "Style", "Xcellence"],
      "1.5 TSI": [],
      "1.5 eHybrid": [],
      "1.5 eTSI": ["FR", "Xcellence"],
      "1.6": ["Reference", "Signo", "Spirit", "Sport", "Stella", "Stylance", "Style"],
      "1.6 TDI": ["CR Style", "Copa Plus", "FR", "SC Style", "ST Style", "Style", "X-Perience", "Xcellence"],
      "1.8": [],
      "1.8 T": ["Cupra", "FR", "Sport"],
      "1.9 TDI": ["Cupra", "Signo", "Sport", "Style"],
      "2.0 TDI": ["CR FR", "Stylance"],
      "2.0 TFSI": ["Cupra", "FR", "Sport Up"],
      "2.0 TSI": [],
    },
    "Marbella": {
    },
    "Toledo": {
      "1.2 TSI": ["Reference", "Style"],
      "1.4 TDI": [],
      "1.4 TSI": ["Reference", "Style"],
      "1.6": ["Comfort", "E", "GLX", "Reference", "SXE", "Signo", "Signo Plus", "Signum", "Stella", "Style"],
      "1.6 TDI": ["Reference", "Style"],
      "1.8": ["GLX", "Signo"],
      "1.9 TDI": ["SXE", "Signo", "Stella"],
      "2.0": [],
      "2.0 TDI": [],
    },
  },
  "Skoda": {
    "Citigo": {
      "Ambition": [],
      "Elegance": [],
    },
    "Fabia": {
      "1.0 GreenTec": ["Ambition", "Style"],
      "1.0 TSI": ["Elite", "Premium", "Premium Colour Concept"],
      "1.4 TDI": ["Ambiente", "Classic", "Comfort", "Elegance", "Special", "Style"],
      "1.4 TSI": [],
      "1.5 TSI": ["Monte Carlo", "Premium"],
      "1.6": ["Ambiente", "Classic", "Elegance"],
      "1.6 TDI": ["Ambiente", "Ambiente Dynamic", "Ambition", "Combi Scout", "Elegance", "Optimal"],
      "1.9 TDI": ["Ambiente", "RS"],
    },
    "Favorit": {
      "1.3": ["Black Line", "GLX", "LX"],
      "1.4": ["Silverline", "Sportline"],
      "135": ["L", "LS", "LX"],
      "136": [],
    },
    "Felicia": {
      "1.3": ["1.3", "GLX", "GLXi", "LX", "LXi", "Magic"],
      "1.6": ["GLXi", "LX"],
      "1.9 D": ["GLX", "LX"],
    },
    "Forman": {
      "135 L": [],
      "135 LS": [],
      "GLX": [],
      "LX": [],
      "Silverline": [],
    },
    "Octavia": {
      "1.0 TSI": ["Ambition", "Optimal", "Style"],
      "1.0 e-Tec": ["Elite", "Premium"],
      "1.2 TSI": ["Ambition", "Elegance", "Optimal", "Style"],
      "1.4 TSI": ["Ambiente", "Ambition Optimal", "Elegance", "Sport", "Style"],
      "1.5 Mhev": ["Elite", "Premium", "Sportline"],
      "1.5 TSI": ["Sport", "Style"],
      "1.5 e-Tec": ["Elite", "Premium", "Prestige", "Scout", "Sportline"],
      "1.6": ["Active", "Ambiente", "Ambiente Optimal", "Ambition", "Business", "Classic", "Collection Plus", "Elegance", "GLX", "SLX", "Tour"],
      "1.6 FSI": ["Ambiente", "Elegance"],
      "1.6 TDI": ["Active", "Ambiente", "Ambition", "Ambition Optimal", "Classic", "Combi Style", "Elegance", "Elegance CR", "Optimal", "Style", "Style CR"],
      "1.8 T": ["Elegance", "L&K", "RS", "SLX"],
      "1.9 TDI": ["Ambiente", "Classic", "Elegance", "GLX", "SLX", "Tour"],
      "2.0 TDI": ["Ambiente", "CR RS", "Elegance", "RS", "Scout"],
      "2.0 TDSI": [],
      "2.0 TSI": [],
    },
    "Rapid": {
      "1.0 TSI GreenTec": ["Ambition", "Spaceback Ambition", "Spaceback Dynamic", "Spaceback Style", "Style"],
      "1.2": ["Active", "Ambition", "Spaceback Ambition"],
      "1.2 TSI": ["Ambition", "Elegance", "Spaceback Ambition", "Spaceback Elegance"],
      "1.2 TSI GreenTec": ["Ambition", "Spaceback Ambition", "Spaceback Monte Carlo", "Spaceback Style", "Style"],
      "1.4 TDI GreenTec": ["Ambition", "Spaceback Ambition", "Spaceback Style", "Style"],
      "1.4 TSI": ["Ambition", "Elegance", "Style"],
      "1.4 TSI GreenTec": ["Spaceback Style", "Style"],
      "1.6 CR TDI": ["Active", "Ambition", "Elegance", "Spaceback Ambition", "Spaceback Elegance", "Style"],
      "1.6 TDI GreenTec": [],
    },
    "Roomster": {
      "1.2": ["1.2", "Active", "Dinamik", "Panorama", "Style"],
      "1.2 TSI": [],
      "1.4": ["1.4", "Comfort", "Panorama", "Style"],
      "1.4 TDI": ["1.4 TDI", "Comfort", "Style"],
      "1.6": ["Comfort", "Scout", "Style"],
      "1.6 CR TDI": ["Active", "Comfort", "Style"],
    },
    "Scala": {
      "1.0 TSI": ["Comfort", "Elite", "Premium"],
      "1.5 TSI": ["Monte Carlo", "Premium"],
      "1.6 TDI": [],
    },
    "Superb": {
      "1.4 TSI": ["Active", "Ambition", "Comfort", "Elegance", "Prestige", "Style"],
      "1.5 TSI": ["Active", "Comfort", "Comfort Plus", "Elite", "Laurin&Klement Crystal", "Premium", "Prestige", "Scout", "Sportline"],
      "1.5 TSI Hybrid": ["Crystal", "Elite", "Laurin&Klement Crystal", "Premium", "Prestige", "Sportline"],
      "1.6 TDI": ["Active", "Ambition", "Comfort", "Elegance", "Elite", "Premium", "Prestige", "Style"],
      "1.8 T": ["Comfort", "Elegance"],
      "1.9 TDI": ["Comfort", "Elegance"],
      "2.0 TDI": ["Crystal", "Elegance", "Laurin & Klement", "Laurin & Klement Crystal", "Prestige"],
      "2.0 TSI": ["Crystal", "Laurin & Klement Crystal", "Prestige"],
      "2.5 TDI": [],
      "3.6 FSI": [],
    },
  },
  "Smart": {
    "Fortwo": {
      "0.6": [],
      "0.7": [],
      "1.0": ["Passion", "Pulse", "Pure"],
    },
    "Roadster": {
    },
  },
  "Subaru": {
    "BRZ": {
    },
    "Impreza": {
      "1.5": ["AWD", "Active", "Comfort", "Elegance", "FWD"],
      "1.6": ["GL", "TS"],
      "1.8": [],
      "2.0": ["Active", "Comfort", "Elegance", "GT", "GX", "WRX", "WRX STi"],
      "2.5": ["WRX", "WRX STI"],
    },
    "Justy": {
      "1.0": [],
      "1.2 GLi": [],
    },
    "Legacy": {
      "2.0": ["2.0", "Active", "Business", "Comfort", "Elegance", "GL", "Limited", "Sportwagon"],
      "2.5": ["GT", "GX", "Outback"],
    },
    "Levorg": {
      "GT-S CVT": [],
      "Sport Plus": [],
    },
    "Vivio": {
    },
  },
  "Suzuki": {
    "Alto": {
      "0.8 GL": [],
      "1.0": [],
      "1.1": ["GL", "GLX"],
    },
    "Baleno": {
      "1.2": ["GL", "Techno"],
      "1.6": ["GLX", "GS"],
    },
    "Liana": {
    },
    "Maruti": {
    },
    "SX4": {
      "1.6": ["GL", "GLX"],
      "1.6 DDIS": [],
      "1.9 DDIS": [],
    },
    "Splash": {
      "1.2 GLS": [],
      "1.3 DDIS": [],
    },
    "Swift": {
      "1.0": ["GA", "GL", "GLX"],
      "1.2": ["GL", "GLX"],
      "1.2 Hibrit": ["GL", "GL Techno", "GLX Premium", "Life", "Pulse"],
      "1.3": ["DDiS GL", "GL", "GLS", "GLX", "Gti", "MT 4x2", "MT 4x4"],
      "1.5 AT": [],
      "1.6 Sport": [],
    },
    "Wagon R": {
    },
  },
  "TOGG": {
    "V1": {
    },
    "V2": {
      "4More": [],
      "Uzun Menzil": [],
    },
  },
  "Tata": {
    "Indica": {
      "1.4 Basic": [],
      "1.4 DLX": [],
      "1.4 TDI": [],
      "1.4 TDI Comfort": [],
      "1.4 TDI Trend": [],
    },
    "Indigo": {
      "1.4 MPFI Comfort": [],
      "1.4 MPFI Trend": [],
      "1.4 TDI Comfort": [],
      "1.4 TDI Trend": [],
    },
    "Manza": {
      "Aura 1.4 Safire": [],
      "Ignis 1.4 Safire": [],
    },
    "Marina": {
      "1.4 TDI Comfort": [],
      "1.4 TDI Trend": [],
    },
    "Vista": {
      "1.3 TDI": ["Aura", "Quadrojet"],
      "1.4 Safire Aura": [],
    },
  },
  "Tesla": {
    "Model 3": {
      "Long Range": [],
      "Standart Plus": [],
    },
    "Model S": {
      "75": [],
      "75D": [],
      "P100D": [],
      "P85D": [],
      "P90D": [],
    },
    "Model X": {
      "100D": [],
      "75D": [],
      "90D": [],
    },
    "Model Y": {
      "Long Range (Juniper)": [],
      "Long Range (Legacy)": [],
      "Performance (Legacy)": [],
      "Premium (Juniper)": [],
      "RWD (Legacy)": [],
      "Standart (Juniper)": [],
    },
  },
  "Tofaş": {
    "Doğan": {
      "1.6": [],
      "1.6 ie": [],
      "L": [],
      "S": [],
      "SL": [],
      "SLX": [],
      "SLX ie": [],
    },
    "Kartal": {
      "1.6": [],
      "1.6 ie": [],
      "Kartal 5 Vites": [],
      "L": [],
      "S": [],
      "SL": [],
      "SLX": [],
      "SLX ie": [],
    },
    "Murat": {
      "124": [],
      "131": [],
    },
    "Serçe": {
    },
    "Şahin": {
      "1.4": [],
      "1.4 ie": [],
      "1.6": [],
      "1.6 ie": [],
      "S": [],
      "Şahin 5 vites": [],
    },
  },
  "Toyota": {
    "Auris": {
      "1.4 D-4D": ["Active", "Active Skypack", "Advance", "Advance Skypack", "Blue", "Class", "Comfort", "Comfort Extra", "Comfort Plus", "Elegant", "Life", "Premium", "Touch"],
      "1.4 D-4D Touring Sports": ["Advance Skypack", "Premium"],
      "1.6": ["Active", "Active Skypack", "Advance", "Advance Skypack", "Blue", "Class", "Comfort", "Comfort Extra", "Elegant", "Premium", "Sport", "Touch"],
      "1.6 Touring Sports": ["Advance Skypack", "Premium"],
      "1.8 Hybrid": ["Active", "Active Skypack", "Advance Skypack", "Premium"],
    },
    "Avalon": {
    },
    "Avensis": {
      "1.6": ["1.6", "Advance", "Comfort", "Elegant", "Elegant Extra", "Linea", "Premium"],
      "1.6 D-4D": ["Advance", "Premium", "Premium Plus"],
      "1.8": ["Comfort", "Elegant", "Elegant Extra", "Terra"],
      "2.0": ["Base", "Comfort", "Elegant", "Executive Comfort", "Executive Elegant", "Liftback", "Premium", "Sol", "Sol Extra", "Verso"],
      "2.0 D-4D": ["2.0 D-4D", "Elegant", "Premium", "Sol"],
      "2.2 D-4D": [],
    },
    "Camry": {
      "2.2 GL": [],
      "2.4": [],
      "2.5 Hybrid Passion": [],
      "3.0": [],
      "3.0 GX": [],
      "3.5": [],
    },
    "Carina": {
      "1.6": ["GLi", "XLi"],
      "2.0": ["2.0", "GLi", "XLD"],
    },
    "Celica": {
    },
    "Corolla": {
      "1.2 T": ["Dream X-Pack", "Flame", "Flame X-Pack"],
      "1.3": ["Base", "Comfort", "ECO", "L", "LE", "Terra", "XE", "XL", "XL SW", "XLi"],
      "1.33": ["Comfort", "Life"],
      "1.4": ["1.4", "Linea Sol", "Linea Terra", "Luna", "Sol", "Terra", "XLi"],
      "1.4 D-4D": ["Active", "Advance", "Class", "Comfort", "Comfort Extra", "Elegant", "Life", "Linea", "Plusline", "Premium", "Premium 50. Yıl", "Sol", "Terra", "Touch"],
      "1.5": ["Dream", "Dream X-Pack", "Flame", "Flame X-Pack", "Passion X-Pack", "Vision", "Vision Plus"],
      "1.6": ["Active", "Advance", "Class", "Comfort", "Comfort Extra", "Comfort Verso", "Dream", "Elegant", "Elegant Verso", "Flame", "Flame X-Pack", "GL", "GLi", "GLi Liftback", "GLi Special", "Life", "Linea", "Linea Luna", "Linea Sol", "Linea Terra", "Luna", "Luna Special", "Passion X-Pack", "Plusline", "Premium", "Premium 50. Yıl", "Sol", "Sol Family", "Sol Special", "Sport", "Terra", "Terra Special", "Touch", "VVT-i Plusline", "VVT-i Sol", "VVT-i Sport", "VVT-i Terra", "Verso", "Vision", "XE", "XEi", "XEi Special", "XEi Special Limited", "XL", "XLi"],
      "1.8": [],
      "1.8 Hybrid": ["Dream", "Dream X-Pack", "Flame", "Flame X-Pack", "Passion X-Pack", "Vision", "Vision Plus"],
      "2.0 D-4D": ["Linea Terra", "Sport"],
      "2.2 D-4D": [],
    },
    "Corona": {
      "1.6 XL": [],
      "2.0 GLi": [],
      "2.0 XL": [],
    },
    "Cressida": {
    },
    "GT86": {
    },
    "MR2": {
    },
    "Previa": {
    },
    "Prius": {
      "1.5 Hybrid": [],
      "1.5 Hybrid Sol": [],
      "1.8 Elegant": [],
      "1.8 Premium": [],
    },
    "Starlet": {
      "1.3": ["XLi", "XLi Plus"],
      "1.4 XLi": [],
    },
    "Supra": {
    },
    "Tercel": {
    },
    "Urban Cruiser": {
      "Comfort": [],
      "Elegant": [],
    },
    "Verso": {
      "1.6": ["Comfort", "Comfort Extra", "Elegant", "Premium", "Premium Navi"],
      "1.6 D-4D": ["Advance", "Comfort Extra", "Elegant", "Premium", "Premium Navi"],
      "1.8": ["Elegant", "Premium"],
      "2.0 D-4D": ["2.0 D-4D", "Comfort Extra", "Premium"],
    },
    "Yaris": {
      "1.0": ["1.0", "Active", "ECO", "Life", "Sol", "Terra", "Terra Plus", "Vision"],
      "1.3": ["Blue", "Luna", "Sol", "Terra", "Terra Plus"],
      "1.33": ["Cool", "Cool Skypack", "Fun", "Fun Skypack", "Fun Special", "Fun Special Skypack", "Sol", "Style", "Style Red", "Style Red Skypack", "Style Skypack", "Style X-Trend", "Style X-Trend Skypack", "Terra", "Terra Sporty"],
      "1.4 D-4D": ["Active", "Cool", "Cool Stil Plus", "Fun", "Sol", "Sol Special", "Terra"],
      "1.5": ["Dream", "Dream X-Pack", "Flame", "Flame X-Pack", "Fun Special", "Luna Verso", "Style X-Trend"],
      "1.5 Hybrid": ["Cool", "Dream", "Flame", "Spirit", "X-Trend"],
    },
  },
  "Vanderhall": {
    "Carmel GT": {
    },
    "Carmel GTS": {
    },
  },
  "Volkswagen": {
    "Arteon": {
      "1.5 TSI": ["Elegance", "R Line"],
      "2.0 TDI": ["Elegance", "R-Line"],
    },
    "Beetle": {
      "1.2 TSI": ["Allstar", "Beetle", "Design", "Style"],
      "1.3": [],
      "1.4 TSI": [],
      "1.6": ["1.6", "Highline", "Smile"],
      "1.6 TDI Design": [],
      "1.9 TDi": [],
      "2.0": ["Diamond", "Pearl"],
    },
    "Bora": {
      "1.6": ["1.6", "Basic", "Comfortline", "Highline", "Pacific", "Primeline", "Trendline"],
      "1.8": [],
      "1.9 TDI": ["Comfortline", "Pacific"],
      "2.3": [],
    },
    "EOS": {
      "1.4 TSI": ["Comfortline", "Highline"],
      "1.6 FSi": ["Comfortline", "Highline"],
      "2.0": [],
    },
    "Golf": {
      "1.0 TSI": ["Comfortline", "Highline", "Impression", "Midline Plus"],
      "1.0 eTSI": ["Life", "R-Line", "Style"],
      "1.2 TSI": ["Allstar", "Comfortline", "Midline Plus"],
      "1.3": [],
      "1.4": ["CL", "Edition"],
      "1.4 TSI": ["Allstar", "Comfortline", "Fan Edition", "GT", "Highline", "Midline", "Pulse", "Tour", "Trendline"],
      "1.5 TSI": ["Comfortline", "Highline", "Impression"],
      "1.5 eTSI": ["Life", "R-Line", "Style"],
      "1.6": ["1.6", "Basicline", "C", "CL", "Comfortline", "Comfortline Plus", "GL", "GT", "GTD", "Goal", "Highline", "Midline", "Midline Plus", "Pacific", "Primeline", "Primeline Plus", "Sport", "Sportline", "TD", "Tour", "Trendline", "Variant"],
      "1.6 FSI": ["Comfortline", "Goal", "Midline", "Plus Comfortline", "Plus Midline", "Plus Primeline", "Sportline", "Tour"],
      "1.6 TDI": ["BlueMotion", "BlueMotion Allstar", "BlueMotion Comfortline", "BlueMotion Highline", "BlueMotion Midline Plus", "Comfortline", "Highline", "Trendline"],
      "1.8": ["1.8", "4motion", "CL", "Cabrio", "GL", "GTI", "Highline"],
      "1.8 T": [],
      "1.9": [],
      "1.9 TDI": ["1.9 TDi", "Comfortline", "Goal", "Highline", "Midline", "Pacific", "Tour", "Variant"],
      "2.0": ["GTi", "Highline"],
      "2.0 TDI": [],
      "2.0 TSI": ["BlueMotion GTI Performans", "GTI", "R 4Motion", "R BlueMotion"],
    },
    "ID.3": {
      "Pro": [],
      "Pure": [],
    },
    "ID.7": {
    },
    "Jetta": {
      "1.2 TSI": ["Comfortline", "Highline", "Trendline"],
      "1.2 TSI BlueMotion": ["Comfortline", "Highline", "Trendline"],
      "1.3 GL": [],
      "1.4 TSI": ["Comfortline", "Exclusive", "Highline", "Midline", "Tour", "Trendline"],
      "1.4 TSI BlueMotion": ["Comfortline", "Highline", "Trendline"],
      "1.6": ["1.6", "CL", "Comfortline", "Exclusive", "FSI Comfortline", "FSI Midline", "GL", "GTD", "Midline", "Primeline", "Tour"],
      "1.6 TDI": ["Comfortline", "Exclusive", "Highline", "Midline", "Primeline", "Trendline"],
      "1.8": [],
      "1.9 TDI": ["Midline", "Primeline", "Tour"],
      "2.0": ["FSI Comfortline", "TDI Comfortline"],
      "2.5": [],
    },
    "Lupo": {
      "1.4": [],
      "Trendline": [],
    },
    "Passat": {
      "1.4 TSI": ["Comfortline", "Exclusive", "Highline", "Trendline"],
      "1.4 TSI BlueMotion": ["Comfortline", "Exclusive", "Highline", "R Line", "Trendline"],
      "1.4 TSI Hybrid": [],
      "1.5 TSI": ["Business", "Elegance", "Highline", "Impression", "R Line", "Trendline"],
      "1.6": ["1.6", "Comfortline", "Exclusive", "Trendline"],
      "1.6 FSI": ["Comfortline", "Exclusive", "Trendline"],
      "1.6 TD GL": [],
      "1.6 TDI BlueMotion": ["1.6 TDI BlueMotion", "Business", "Comfortline", "Elegance", "Exclusive", "Highline", "Impression", "R Line", "Trendline"],
      "1.8": ["1.8", "Basic", "CL", "Comfortline", "Highline", "Trendline"],
      "1.8 T": ["1.8 T", "Basic", "Comfortline", "Exclusive", "Highline", "Trendline"],
      "1.8 TSI": ["Comfortline", "Exclusive", "Highline"],
      "1.9 TDI": ["1.9 TDI", "Comfortline", "Exclusive", "Highline", "Trendline"],
      "2.0": ["Comfortline", "GL", "Trendline"],
      "2.0 FSI": ["Comfortline", "Highline", "Trendline"],
      "2.0 TDI": ["Business", "Comfortline", "Elegance", "Exclusive", "Highline", "Sportline", "Trendline"],
      "2.0 TDI BlueMotion": ["Business", "Comfortline", "Elegance", "Highline"],
      "2.0 TFSI": ["Comfortline", "Highline"],
      "2.0 TSI": [],
      "2.5 TDI": [],
      "2.8": [],
    },
    "Passat Alltrack": {
    },
    "Passat Variant": {
      "1.4 TSI": ["Comfortline", "Highline"],
      "1.4 TSI BlueMotion": ["Comfortline", "Highline"],
      "1.5 TSI": ["Business", "Elegance", "R-Line"],
      "1.5 e-TSI": ["Business", "Elegance", "Impression", "R Line"],
      "1.5 eHybrid": ["Elegance", "Impression"],
      "1.6": [],
      "1.6 FSI": ["Comfortline", "Exclusive"],
      "1.6 TDI BlueMotion": ["Business", "Comfortline", "Elegance", "Highline", "R Line"],
      "1.6 TDi": ["Comfortline", "Highline"],
      "1.8": ["1.8", "CL"],
      "1.8 T": [],
      "1.8 TSI": ["Exclusive", "Highline"],
      "1.9": [],
      "1.9 TDI": ["1.9 TDI", "Comfortline", "Trendline"],
      "2.0": ["GL", "GT"],
      "2.0 FSI": ["Comfortline", "Highline"],
      "2.0 TDI BlueMotion": ["Comfortline", "Exclusive", "Highline"],
      "2.5 TDI": ["Comfortline", "Trendline"],
    },
    "Phaeton": {
      "3.0 TDI": [],
      "3.2 Long": [],
      "5.0 TDI": [],
      "5.0 TDI Long": [],
    },
    "Polo": {
      "1.0": ["Impression", "Trendline"],
      "1.0 TSI": ["Comfortline", "Highline", "Life", "R-Line", "Style", "Trendline"],
      "1.2": [],
      "1.2 TDI": ["BlueMotion", "Trendline"],
      "1.2 TSI": ["Allstar", "Comfortline", "Lounge"],
      "1.4": ["1.4", "Basicline", "Chrome Edition", "Comfortline", "Comfortline Classic", "Cross", "Fan Edition", "Goal", "Highline", "Primeline", "Pulse", "Sportline", "Tour", "Trendline"],
      "1.4 TDI": ["40. Yıl", "Basicline", "BlueMotion", "Comfortline", "Goal", "Highline", "Primeline", "Tour", "Trendline"],
      "1.4 TSI": ["ACT BlueGT", "GTI"],
      "1.6": ["1.6", "Classic", "Comfortline", "Comfortline Classic", "GTI", "Highline", "Highline Classic", "Sportline Classic", "Trendline", "Trendline Classic"],
      "1.6 TDI": ["Comfortline", "Highline", "Trendline"],
      "1.9 SDI": ["1.9 SDI", "Comfortline", "Trendline"],
      "1.9 TDI": ["1.9 TDI", "Comfortline", "Comfortline Classic", "Trendline Classic", "Trendline Variant"],
    },
    "Scirocco": {
      "1.4 TSI": ["Allstar", "GTS", "Sportline", "White Edition"],
      "2.0": ["TFSI Sportline", "TSI R", "TSI Sportline"],
    },
    "Sharan": {
      "1.8 T Comfortline": [],
      "1.8 T Highline": [],
      "1.9 TDI": [],
      "1.9 TDI Comfortline": [],
      "2.0 GL": [],
      "2.0 TDI Comfortline": [],
      "2.0 TDI Highline": [],
      "2.8": [],
    },
    "Touran": {
      "1.4 TSI": ["Comfortline", "Highline"],
      "1.6": ["Comfortline", "Function", "Trendline"],
      "1.6 FSI": ["Comfortline", "Highline", "Trendline"],
      "1.9 TDI": ["Comfortline", "Highline"],
      "2.0 TDI": [],
    },
    "Up Club": {
    },
    "VW CC": {
      "1.4 TSI": ["1.4", "Exclusive", "R-Line", "Sportline"],
      "1.8 TFSI": [],
      "1.8 TSI": [],
      "2.0 TDI": ["2.0 TDI", "Exclusive", "Sportline"],
      "2.0 TSI": [],
    },
    "Vento": {
      "1.6": ["CL", "GL"],
      "1.8": ["CL", "GL"],
      "1.9": [],
      "2.0": ["GL", "GT"],
    },
  },
  "Volta": {
    "EV1": {
    },
    "EV2": {
    },
  },
  "Volvo": {
    "240": {
    },
    "440": {
      "1.7 GLT": [],
      "2.0i": [],
    },
    "850": {
      "2.0 GLE": [],
      "2.0 T5": [],
      "2.3 T5": [],
      "2.5 GLE": [],
      "2.5 GLT": [],
      "2.5 T": [],
    },
    "940": {
      "2.0 GL": [],
      "2.3 GLE": [],
    },
    "960": {
    },
    "C30": {
      "1.6": ["1.6", "Premium", "Sports"],
      "1.6 D": ["1.6 D", "Advance", "Premium", "R-Design", "Sports"],
      "2.0 D": [],
    },
    "C70": {
      "2.0 D": ["2.0 D"],
      "2.5": [],
    },
    "S40": {
      "1.6": ["1.6", "Dynamic", "Premium", "Prime", "R-Design"],
      "1.6 D": ["1.6 D", "Drive", "Dynamic", "Premium", "Prime", "R-Design"],
      "1.8": [],
      "1.9 T4": [],
      "2.0": [],
      "2.0 D": ["2.0 D", "Dynamic", "Premium"],
      "2.0 T": [],
      "2.4": [],
      "2.5 T5": [],
    },
    "S60": {
      "1.5 T3": ["Advance", "Dynamic", "Premium", "R-Design"],
      "1.6": ["1.6", "Advance", "Premium", "R-Design"],
      "1.6 D": ["1.6 D", "Advance", "Premium", "R-Design"],
      "2.0 B5": ["Inscription", "Inscription Plus", "Plus Bright", "Plus Dark"],
      "2.0 D": ["2.0 D", "Advance", "Premium", "R-Design"],
      "2.0 T": ["2.0 T", "Premium", "R-Design", "Sports"],
      "2.0 T5": [],
      "2.3 T5": [],
      "2.4": [],
      "2.4 D": ["2.4 D", "Premium", "R-Design", "Sports"],
      "2.4 T5": [],
      "2.5 R": [],
      "2.5 T": [],
    },
    "S70": {
      "2.0": [],
      "2.0 T": [],
      "2.0 T5": [],
      "2.3 T5": [],
      "2.5 D": [],
      "2.5 T": [],
    },
    "S80": {
      "1.6 D": ["1.6 D", "Advance", "Premium"],
      "1.6 T4": ["1.6 T4", "Advance", "Premium"],
      "2.0 D": ["2.0 D", "Advance", "Premium"],
      "2.0 T": [],
      "2.0 T5": [],
      "2.4": [],
      "2.4 D": [],
      "2.4 D5": ["2.4 D5", "Advance", "Executive", "Premium", "VIP"],
      "2.5 D": [],
      "2.5 T": ["Premium", "VIP"],
      "2.8 T6": [],
      "2.9": [],
      "2.9 T6": ["2.9 T6", "Executive"],
      "3.0 T6": [],
      "4.4": [],
    },
    "S90": {
      "2.0 D B5": ["Inscription", "Plus Bright", "Plus Dark", "Ultimate Bright"],
      "2.0 D D4": ["Inscription", "Momentum"],
      "2.0 D D5": ["Inscription", "Momentum", "R-Design"],
      "2.0 T8": ["Recharge Plus Dark", "Recharge Ultimate Dark"],
      "3.0": [],
    },
    "V40": {
      "1.5": ["Advance", "Inscription", "Momentum", "Premium", "R-Design"],
      "1.6": [],
      "1.6 D": ["1.6 D", "Advance", "Premium", "R-Design"],
      "1.6 T3": [],
      "1.6 T4": ["1.6 T4", "Advance", "Premium", "R-Design"],
      "1.8": [],
      "1.9 D": [],
      "1.9 TD": [],
      "2.0": [],
      "2.0 T": [],
    },
    "V40 Cross Country": {
      "1.5 T3": ["Advance", "Premium"],
      "1.6 D": ["1.6 D", "Advance", "Premium"],
      "1.6 T4": ["Advance", "Premium"],
    },
    "V50": {
      "1.6": [],
      "1.6 D": ["1.6 D", "Drive", "Dynamic", "Premium", "Prime"],
      "1.8": [],
      "2.0 D": [],
      "2.4": [],
      "2.5 T5": [],
    },
    "V60": {
      "1.5 T3": [],
      "1.6 D": [],
      "1.6 T4": ["R-Design", "T4"],
      "2.0 D3": [],
      "2.0 T5": [],
    },
    "V60 Cross Country": {
      "2.0 B4": [],
      "2.0 B5": ["2.0 B5", "Plus Bright", "Ultimate Bright"],
      "2.0 D4": ["2.0 D4", "Advance"],
    },
    "V70": {
      "2.0 D3": [],
      "2.0 D4": [],
      "2.0 T": [],
      "2.0 T5": [],
      "2.3 T-5": [],
      "2.4 D": [],
      "2.4 D5": ["Kinetic", "Premium"],
      "2.4 T": [],
      "2.5 D": [],
      "3.2 Premium": [],
    },
    "V90": {
    },
    "V90 Cross Country": {
      "2.0 B6": ["Pro", "Ultimate Bright"],
      "2.0 D B5": ["Plus Bright", "Pro", "Ultimate Bright"],
      "2.0 D D5": [],
    },
  },
  "Yuki": {
    "Amy": {
    },
    "Hector Pro": {
    },
  },
};
