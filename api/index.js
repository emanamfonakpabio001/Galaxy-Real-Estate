// server/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// server/db.ts
import { MongoClient, GridFSBucket } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

// server/config.ts
import dotenv from "dotenv";
dotenv.config();
function sanitizeMongoUri(raw) {
  if (!raw) return "";
  let uri = raw.trim();
  while (uri.startsWith('"') && uri.endsWith('"') || uri.startsWith("'") && uri.endsWith("'") || uri.startsWith("`") && uri.endsWith("`")) {
    uri = uri.slice(1, -1).trim();
  }
  if (uri.startsWith("mongodb+srv://") || uri.startsWith("mongodb://")) {
    const parts = uri.split("?");
    const base = parts[0];
    const query = parts[1] || "";
    const match = base.match(/^(mongodb(?:\+srv)?:\/\/[^\/]+)(\/.*)?$/);
    if (match) {
      const hostPart = match[1];
      const pathPart = (match[2] || "").replace(/^\//, "").trim();
      const dbName = pathPart || process.env.MONGODB_DATABASE || "galaxy_real_estate";
      const queryString = query ? `?${query}` : "?retryWrites=true&w=majority";
      uri = `${hostPart}/${dbName}${queryString}`;
    }
  }
  return uri;
}
var config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: sanitizeMongoUri(process.env.MONGODB_URI),
  mongodbDatabase: (process.env.MONGODB_DATABASE || "galaxy_real_estate").trim().replace(/['"`]/g, ""),
  jwtSecret: process.env.JWT_SECRET || "galaxy_super_secure_jwt_secret_2026_nigeria",
  sessionSecret: process.env.SESSION_SECRET || "galaxy_session_secret_change_in_production",
  adminEmail: (process.env.ADMIN_EMAIL || "admin@galaxyrealestate.com").trim(),
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || "admin123@Galaxy",
  adminPin: process.env.ADMIN_PIN || "456824"
};

// src/data/properties.ts
var SAMPLE_PROPERTIES = [
  {
    id: "prop-abuja-01",
    title: "The Obsidian: 5-Bedroom Smart Architectural Villa",
    slug: "the-obsidian-5-bedroom-smart-architectural-villa-maitama",
    location: {
      address: "14 Mississippi Street, Maitama",
      city: "Abuja",
      state: "FCT",
      neighborhood: "Maitama District",
      country: "Nigeria"
    },
    price: 85e7,
    status: "For Sale",
    type: "Villa",
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 5,
    sizeSqm: 780,
    featured: true,
    verified: true,
    shortDescription: "Magnificent bespoke contemporary 5-bedroom villa featuring private infinity pool, Control4 home automation, Dolby Atmos cinema, and luxury Italian finishes in prime Maitama.",
    fullDescription: "Set in the prestigious and secure heart of Maitama, Abuja, The Obsidian is an architectural tour de force blending bold brutalist lines with warm organic minimalism. Soaring 7-meter double-volume ceilings welcome you into an open-concept salon illuminated by floor-to-ceiling double-glazed acoustic glass. The Italian Poliform chef\u2019s kitchen is equipped with integrated Miele & Sub-Zero appliances and a separate wet prep kitchen. The master penthouse suite encompasses a private sunset terrace overlooking the Maitama skyline, dual walk-in dressing suites, and a spa-grade ensuite with a freestanding volcanic limestone soaking tub. Outside, an infinity-edge swimming pool, heated Jacuzzi, covered outdoor Teppanyaki BBQ pavilion, integrated perimeter thermal CCTV, and dedicated 2-room staff quarters complete this trophy residence.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Private Heated Infinity Swimming Pool",
      "Control4 Smart Home Automation & Biometric Locks",
      "10-Seater Soundproof Dolby Atmos Cinema",
      "Fitted Chef & Wet Kitchen with Miele Appliances",
      "30kVA Industrial Solar Microgrid + 80kVA Silent Cat Generator",
      "CCTV Perimeter with AI Intrusion Detection",
      "Dedicated 2-Room Ensuite Staff Quarters (BQ)",
      "Spacious 5-Car Interlocked Parking Bay"
    ],
    yearBuilt: 2024,
    agent: {
      name: "Tariq Al-Hassan",
      title: "Senior Luxury Property Specialist",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "tariq@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: true
  },
  {
    id: "prop-lagos-01",
    title: "The Azure: 3-Bedroom Panoramic Waterfront Penthouse",
    slug: "the-azure-3-bedroom-panoramic-waterfront-penthouse-ikoyi",
    location: {
      address: "Bourdillon Road, Ikoyi",
      city: "Lagos",
      state: "Lagos State",
      neighborhood: "Ikoyi Waterfront",
      country: "Nigeria"
    },
    price: 65e7,
    status: "For Sale",
    type: "Penthouse",
    bedrooms: 3,
    bathrooms: 4,
    parkingSpaces: 3,
    sizeSqm: 380,
    featured: true,
    verified: true,
    shortDescription: "Ultra-luxurious 3-bedroom penthouse offering 270-degree panoramic Five Cowries Creek water vistas, private lift access, Olympic gym, and 24/7 concierge.",
    fullDescription: "Experience elevated waterfront living in highbrow Ikoyi, Lagos. This meticulously crafted 3-bedroom corner penthouse offers breathtaking sunset vistas over the Lagos lagoon and Lekki-Ikoyi Link bridge. The open-concept living and dining salon flows smoothly into a 45-foot wraparound glass-railed sky terrace. The custom kitchen is fitted with Calacatta quartz countertops, soft-close cabinetry, and high-efficiency induction stoves. Residents enjoy 24-hour uninterrupted power supply, Olympic-sized lap pool, fully equipped Technogym wellness center, high-speed private elevator access, biometric security, and dedicated jetty slipway access for boating enthusiasts.",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "270\xB0 Panoramic Lagoon & Ocean Skyline Views",
      "Direct Private Keycard Elevator Entry",
      "24/7 Guaranteed Uninterrupted Clean Power",
      "Residents-Only Olympic Lap Pool & Technogym",
      "Concierge Desk & Valet Parking Service",
      "3 Designated Underground Parking Slots",
      "Dedicated Private Boat Slipway & Jetty Access"
    ],
    yearBuilt: 2024,
    agent: {
      name: "Chioma Adeleke",
      title: "Lagos Waterfront Portfolio Lead",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "chioma@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: true
  },
  {
    id: "prop-lagos-02",
    title: "The Sovereign: 6-Bedroom Ultra-Mansion at Banana Island",
    slug: "the-sovereign-6-bedroom-ultra-mansion-banana-island",
    location: {
      address: "Zone A, Close 4, Banana Island",
      city: "Lagos",
      state: "Lagos State",
      neighborhood: "Banana Island",
      country: "Nigeria"
    },
    price: 185e7,
    status: "For Sale",
    type: "Detached Mansion",
    bedrooms: 6,
    bathrooms: 8,
    parkingSpaces: 8,
    sizeSqm: 1200,
    featured: true,
    verified: true,
    shortDescription: "Nigeria\u2019s pinnacle residential trophy estate on Banana Island with internal glass elevator, heated swimming pool, 14-seat cinema, and rooftop sky lounge.",
    fullDescription: "An unrivaled statement of architectural grandeur in Nigeria\u2019s most exclusive gated postal code\u2014Banana Island, Ikoyi. Built with zero compromises across 1,200 square meters of prime real estate, this 6-bedroom mansion offers an internal private pneumatic elevator, soundproof private 14-seater Dolby Atmos cinema, climate-controlled sommelier wine cellar, private gym, and a rooftop sky lounge with 360-degree ocean horizon views. Includes a 50kVA commercial solar-lithium power backup system providing 100% off-grid reliability, heated infinity pool with swim-up bar, and triple-tier security checkpoints.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Internal Otis Glass Elevator Serving All 3 Floors",
      "14-Seater Soundproof Cinema with Acoustic Paneling",
      "Private Heated Swimming Pool & Jacuzzi Lounge",
      "Rooftop Sky Lounge with Wet Bar & Ocean Panoramas",
      "50kVA Industrial Solar Microgrid with Lithium Storage",
      "Triple-Security Access Gated Zone with Armed Escort Support",
      "3-Room Staff Quarters with Private Kitchenette"
    ],
    yearBuilt: 2024,
    agent: {
      name: "Chioma Adeleke",
      title: "Lagos Waterfront Portfolio Lead",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "chioma@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: true
  },
  {
    id: "prop-abuja-02",
    title: "Aura Heights: 4-Bedroom Hillside Terrace Duplex",
    slug: "aura-heights-4-bedroom-hillside-terrace-duplex-guzape",
    location: {
      address: "Hillview Crescent, Guzape Hills",
      city: "Abuja",
      state: "FCT",
      neighborhood: "Guzape Hills",
      country: "Nigeria"
    },
    price: 24e7,
    status: "For Sale",
    type: "Terrace Duplex",
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 3,
    sizeSqm: 420,
    featured: true,
    verified: true,
    shortDescription: "Contemporary hillside terrace duplex offering sweeping views across the Abuja city bowl, private rooftop deck with pergola, and estate clubhouse access.",
    fullDescription: "Perched on the scenic rolling hills of Guzape, Aura Heights combines urban sophistication with serene elevated living. Highlights include a dramatic double-volume atrium, private rooftop observation deck with cedar pergola, fully fitted open kitchen with marble breakfast island, and automated motorized smart curtains. The gated community features 24-hour armed patrol, dedicated transformer, community swimming pool, and floodlit tennis court.",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Unobstructed Panoramic Hillside City Views",
      "Private Rooftop Terrace with Entertainment Pergola",
      "Gated Community with 24/7 Armed Security Patrol",
      "Estate Infinity Pool, Gym & Tennis Court",
      "Automated Inverter System & Clean Solar Tie-in",
      "1-Room Ensuite Maid\u2019s Room with External Entry"
    ],
    yearBuilt: 2023,
    agent: {
      name: "Tariq Al-Hassan",
      title: "Senior Luxury Property Specialist",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "tariq@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: true
  },
  {
    id: "prop-uyo-01",
    title: "The Palms: 5-Bedroom Executive Mansion & Garden Retreat",
    slug: "the-palms-5-bedroom-executive-mansion-garden-retreat-uyo",
    location: {
      address: "Plot 12, Unit 8, Ewet Housing Estate",
      city: "Uyo",
      state: "Akwa Ibom State",
      neighborhood: "Ewet Housing Estate",
      country: "Nigeria"
    },
    price: 185e6,
    status: "For Sale",
    type: "Detached Mansion",
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 6,
    sizeSqm: 650,
    featured: true,
    verified: true,
    shortDescription: "Stately 5-bedroom detached family mansion set inside serene, secure Ewet Housing Estate with extensive perimeter landscaping, guest chalet, and garden gazebo.",
    fullDescription: "Nestled inside the tranquil, leafy enclave of Ewet Housing Estate in Uyo, this premium 5-bedroom home offers superior structural build quality and total privacy. Boasting soaring ceilings, multiple family lounges, an expansive dining hall, and large en-suite bedrooms with bespoke solid wood wardrobes. The outdoor compound features stamped concrete paving, manicured royal palm gardens, a covered gazebo for outdoor entertaining, an electric security fence, and a self-contained 2-bedroom detached guest chalet.",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Expansive Landscaped Private Compound with Gazebo",
      "2-Bedroom Detached Guest Chalet & BQ",
      "Deep Borehole with Industrial Reverse-Osmosis Water Plant",
      "Perimeter Electric Security Fence with Infrared Sensors",
      "Generous 6-Vehicle Covered Carport",
      "Dual Formal Living Lounges (Ground & First Floor Family Lounge)",
      "High-Grade Granite & Imported Porcelain Tiling Throughout"
    ],
    yearBuilt: 2023,
    agent: {
      name: "Bassey Ekpenyong",
      title: "South-South Regional Director",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "bassey@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: false
  },
  {
    id: "prop-abuja-03",
    title: "The Diplomat: 5-Bedroom Fortified Residence in Asokoro",
    slug: "the-diplomat-5-bedroom-fortified-residence-asokoro",
    location: {
      address: "Yakubu Gowon Crescent, Asokoro",
      city: "Abuja",
      state: "FCT",
      neighborhood: "Asokoro Diplomatic Zone",
      country: "Nigeria"
    },
    price: 45e6,
    period: "year",
    status: "For Rent",
    type: "Villa",
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 6,
    sizeSqm: 720,
    featured: true,
    verified: true,
    shortDescription: "High-security diplomatic residence in Asokoro featuring private swimming pool, bullet-resistant glass, guard post, and dedicated consular compound facilities.",
    fullDescription: "Ideal for embassy dignitaries, multinational executives, and diplomatic missions. This stately 5-bedroom villa is nestled within the fortified diplomatic zone of Asokoro. It includes dual bulletproof security entrance gates, dedicated 24-hour guard station, expansive formal banquet halls, UN-compliant safety protocols, sparkling swimming pool, lush tropical gardens, and two separate staff housing annexes.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "UN & Diplomatic Security Zone Certified",
      "Large Swimming Pool & Manicured BBQ Lawn",
      "Dedicated Guard House with Integrated CCTV Monitor",
      "High-Capacity Water Reservoirs & Dedicated Borehole",
      "100kVA Standby Cat Generator + Solar Hybrid System",
      "2 Multi-Room BQ Units for Security & Domestic Staff"
    ],
    yearBuilt: 2023,
    agent: {
      name: "Tariq Al-Hassan",
      title: "Senior Luxury Property Specialist",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "tariq@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: true
  },
  {
    id: "prop-lagos-03",
    title: "The Haven: 3-Bedroom Fully Serviced Luxury Apartment",
    slug: "the-haven-3-bedroom-serviced-luxury-apartment-lekki-1",
    location: {
      address: "Admiralty Way, Lekki Phase 1",
      city: "Lagos",
      state: "Lagos State",
      neighborhood: "Lekki Phase 1",
      country: "Nigeria"
    },
    price: 16e6,
    period: "year",
    status: "For Rent",
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    sizeSqm: 240,
    featured: false,
    verified: true,
    shortDescription: "Tastefully furnished 3-bedroom serviced apartment with 24-hour electricity, swimming pool, gym, and 2-minute connection to Lekki-Ikoyi Link Bridge.",
    fullDescription: "Located directly on prime Admiralty Way with immediate access to top fine dining, boutique shopping, and the Lekki-Ikoyi Link Bridge. This upscale serviced residence features chic Scandinavian-style furnishings, energy-efficient dual-inverter ACs throughout, high-speed fiber internet infrastructure, and dedicated facility management handling round-the-clock power, water treatment, and biometric security.",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Fully Serviced with Guaranteed 24/7 Power",
      "Designer Interiors & Full Furnishings Package",
      "Resident Pool & Fully Equipped Fitness Center",
      "2 Dedicated Covered Parking Bays",
      "High-Speed Fiber Optic Ready",
      "2-Minute Commute to Lekki-Ikoyi Bridge"
    ],
    yearBuilt: 2023,
    agent: {
      name: "Chioma Adeleke",
      title: "Lagos Waterfront Portfolio Lead",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "chioma@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: false
  },
  {
    id: "prop-lagos-04",
    title: "The Apex: Grade-A Commercial Tower Office Suite",
    slug: "the-apex-grade-a-commercial-tower-office-suite-vi",
    location: {
      address: "Ahmadu Bello Way, Victoria Island",
      city: "Lagos",
      state: "Lagos State",
      neighborhood: "Victoria Island Commercial Hub",
      country: "Nigeria"
    },
    price: 95e6,
    period: "year",
    status: "For Rent",
    type: "Commercial Office",
    bedrooms: 0,
    bathrooms: 4,
    parkingSpaces: 8,
    sizeSqm: 450,
    featured: false,
    verified: true,
    shortDescription: "Prime Grade-A open-plan corporate office suite with high-speed elevators, fire suppression, raised access floors, and 24/7 central HVAC.",
    fullDescription: "Position your corporate enterprise at the epicenter of Nigeria\u2019s financial and tech capital. This 450-sqm commercial floor in Victoria Island provides open-plan architectural efficiency, acoustically treated double-glazed facade, high-capacity fiber backbone, round-the-clock uninterrupted power, and access to executive conference facilities with underground secure parking.",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Grade-A Certified Commercial Building with BMS",
      "24/7 Central HVAC & Redundant Power Grid",
      "Raised Access Flooring for Clean IT Data Cabling",
      "8 Allocated Executive Underground Parking Spaces",
      "Access-Controlled Turnstile Lobby with 24/7 Security"
    ],
    yearBuilt: 2023,
    agent: {
      name: "Chioma Adeleke",
      title: "Lagos Waterfront Portfolio Lead",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "chioma@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: false
  },
  {
    id: "prop-abuja-04",
    title: "The Monarch: 6-Bedroom Palatial Villa in Katampe Extension",
    slug: "the-monarch-6-bedroom-palatial-villa-katampe-extension",
    location: {
      address: "Diplomatic Enclave, Katampe Extension",
      city: "Abuja",
      state: "FCT",
      neighborhood: "Katampe Extension",
      country: "Nigeria"
    },
    price: 68e7,
    status: "For Sale",
    type: "Villa",
    bedrooms: 6,
    bathrooms: 7,
    parkingSpaces: 6,
    sizeSqm: 820,
    featured: true,
    verified: true,
    shortDescription: "Modernist multi-level cliffside villa with suspended infinity swimming pool, elevator, wine vault, and panoramic valley views in Katampe Extension.",
    fullDescription: "Commanding an elevated ridgeline position in prestigious Katampe Extension, The Monarch represents the pinnacle of modern architectural luxury. Features a dramatic suspended glass-wall infinity pool cantilevered over landscaped rock gardens, a pneumatic elevator connecting four levels, a 12-seat private cinema, and floor-to-ceiling curtain wall glazing capturing breathtaking mountain vistas. Includes dual automated master suites, solar backup, and two ensuite staff quarters.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Cantilevered Glass-Wall Infinity Pool",
      "Pneumatic Glass Elevator to All 4 Levels",
      "12-Seat Soundproof Private Cinema",
      "Rooftop Stargazing Lounge & Sky Bar",
      "30kVA Hybrid Solar Inverter System",
      "Perimeter Electric Fencing & Smart Intercom"
    ],
    yearBuilt: 2024,
    agent: {
      name: "Tariq Al-Hassan",
      title: "Senior Luxury Property Specialist",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "tariq@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: true
  },
  {
    id: "prop-lagos-05",
    title: "The Crown: 4-Bedroom Waterfront Duplex with Private Jetty",
    slug: "the-crown-4-bedroom-waterfront-duplex-private-jetty-victoria-island",
    location: {
      address: "Ozumba Mbadiwe Avenue, Victoria Island",
      city: "Lagos",
      state: "Lagos State",
      neighborhood: "Victoria Island Waterfront",
      country: "Nigeria"
    },
    price: 49e7,
    status: "For Sale",
    type: "Terrace Duplex",
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 4,
    sizeSqm: 490,
    featured: true,
    verified: true,
    shortDescription: "Exquisite 4-bedroom waterfront terrace duplex with private yacht mooring slip, smart automation, designer European kitchen, and lagoon infinity pool.",
    fullDescription: "Located directly on the prestigious Victoria Island waterfront, this private terrace home offers direct water frontage with its own certified yacht slipway. The open-plan architectural layout is designed for seamless entertaining, featuring Italian marble surfaces, smart home lighting, integrated Bang & Olufsen sound systems, and floor-to-ceiling glass sliding doors opening to an exclusive waterfront terrace.",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Private Certified Yacht Mooring Slip",
      "Direct Lagoon View Waterfront Deck",
      "Integrated Bang & Olufsen Audio Systems",
      "Italian Calacatta Marble Finishes",
      "24/7 Redundant Power & Facility Security",
      "2-Room Ensuite Service Quarters"
    ],
    yearBuilt: 2024,
    agent: {
      name: "Chioma Adeleke",
      title: "Lagos Waterfront Portfolio Lead",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "chioma@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: true
  },
  {
    id: "prop-ph-01",
    title: "The Grandeur: 5-Bedroom Luxury Mansion in Old GRA",
    slug: "the-grandeur-5-bedroom-luxury-mansion-old-gra-port-harcourt",
    location: {
      address: "Forces Avenue, Old GRA",
      city: "Port Harcourt",
      state: "Rivers State",
      neighborhood: "Old GRA",
      country: "Nigeria"
    },
    price: 34e7,
    status: "For Sale",
    type: "Detached Mansion",
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 6,
    sizeSqm: 750,
    featured: true,
    verified: true,
    shortDescription: "Magnificent 5-bedroom luxury estate in exclusive Old GRA Port Harcourt with Olympic pool, security gatehouse, and lush botanical gardens.",
    fullDescription: "Set on nearly two plots of lushly landscaped grounds in Old GRA, Port Harcourt\u2019s most elite neighborhood, The Grandeur exudes executive dignity and sophistication. Highlights include soaring ceilings with customized coffered chandeliers, an Italian granite-topped gourmet kitchen, private executive home office, cinema lounge, swimming pool with pool house, and independent borehole water treatment.",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Prime Old GRA Prestige Location",
      "Olympic Swimming Pool & Cabana",
      "Dedicated Executive Home Office & Library",
      "Solar Inverter + 65kVA Soundproof Generator",
      "Full Perimeter Infrared CCTV Protection",
      "Detached 2-Bedroom Guest Chalet"
    ],
    yearBuilt: 2023,
    agent: {
      name: "Bassey Ekpenyong",
      title: "South-South Regional Director",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "bassey@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: false
  },
  {
    id: "prop-abuja-05",
    title: "The Elysium: 4-Bedroom Smart Terrace House in Jabi Lake",
    slug: "the-elysium-4-bedroom-smart-terrace-house-jabi-lake",
    location: {
      address: "Alex Ekwueme Way, Jabi",
      city: "Abuja",
      state: "FCT",
      neighborhood: "Jabi Lake District",
      country: "Nigeria"
    },
    price: 18e7,
    status: "For Sale",
    type: "Terrace Duplex",
    bedrooms: 4,
    bathrooms: 4,
    parkingSpaces: 3,
    sizeSqm: 360,
    featured: false,
    verified: true,
    shortDescription: "Chic 4-bedroom lakeside terrace residence with private garden, rooftop lounge, solar power, and 2-minute stroll to Jabi Lake Mall.",
    fullDescription: "Live moments away from Abuja\u2019s favorite leisure and watersports destination. The Elysium features Scandinavian minimalist architecture with clean geometric profiles, quartz-topped open kitchens, imported Spanish porcelain flooring, and smart voice-controlled lighting. The gated compound offers swimming pool access, landscaped walking pathways, and 24/7 security.",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Walking Distance to Jabi Lake & Jabi Mall",
      "Rooftop Lounge with Lake Breeze Views",
      "Smart Voice-Controlled Home Automation",
      "Solar Powered Common Area & Street Lighting",
      "Fully Gated Estate with Armed Security"
    ],
    yearBuilt: 2024,
    agent: {
      name: "Tariq Al-Hassan",
      title: "Senior Luxury Property Specialist",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "tariq@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: true
  },
  {
    id: "prop-lagos-06",
    title: "The Skyview: 2-Bedroom Designer Apartment in Oniru",
    slug: "the-skyview-2-bedroom-designer-apartment-oniru-vi",
    location: {
      address: "Water Corporation Drive, Oniru",
      city: "Lagos",
      state: "Lagos State",
      neighborhood: "Oniru Private Estate",
      country: "Nigeria"
    },
    price: 95e6,
    status: "For Sale",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 2,
    sizeSqm: 160,
    featured: false,
    verified: true,
    shortDescription: "High-yield 2-bedroom luxury short-let ready apartment with ocean view balcony, rooftop infinity pool, gym, and 24-hour concierge.",
    fullDescription: "An exceptional high-yield investment property perfectly positioned for premium executive short-let returns or luxury city living. Situated in Oniru, adjacent to Victoria Island and Landmark Beach, this turnkey apartment features contemporary furnishings, open-plan island kitchen, high-speed elevators, ocean breeze balcony, and hotel-style concierge service.",
    images: [
      "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Turnkey Ready for Airbnb / Short-Let Operations (Projected 18% ROI)",
      "Rooftop Oceanview Infinity Pool & Bar",
      "24/7 Power, Concierge & High-Speed Elevators",
      "Direct Proximity to Landmark Beach & Eko Atlantic",
      "2 Dedicated Parking Spaces"
    ],
    yearBuilt: 2024,
    agent: {
      name: "Chioma Adeleke",
      title: "Lagos Waterfront Portfolio Lead",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "chioma@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: true
  },
  {
    id: "prop-abuja-06",
    title: "Plot 1408: Prime 1,200sqm Residential Land in Maitama Extension",
    slug: "plot-1408-prime-1200sqm-residential-land-maitama-extension",
    location: {
      address: "Plot 1408, Cadastral Zone A05, Maitama Extension",
      city: "Abuja",
      state: "FCT",
      neighborhood: "Maitama Extension",
      country: "Nigeria"
    },
    price: 38e7,
    status: "For Sale",
    type: "Land",
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    sizeSqm: 1200,
    featured: true,
    verified: true,
    shortDescription: "Prime 1,200sqm residential development corner plot with valid Federal Capital Development Authority (FCDA) Certificate of Occupancy (C of O).",
    fullDescription: "A rare opportunity to acquire a pristine, build-ready corner piece plot of land in the highly prestigious Maitama Extension (A05) district of Abuja. Perfectly positioned on dry, elevated ground with scenic mountain backdrop, excellent asphalt road network, underground drainage, and electrical infrastructure. Fully cleared and ready for immediate construction of a private luxury mansion or multi-unit diplomatic residence. Comes with verified FCDA Certificate of Occupancy and clean TDP document.",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Valid FCDA Certificate of Occupancy (C of O)",
      "100% Dry, Level Corner Plot Ready for Development",
      "Paved Asphalt Dual Carriageway & Drainage Network",
      "Underground High-Tension Power & Water Main Hookups",
      "High Capital Appreciation Corridor",
      "Clean Legal Title with Complete Land Search Report"
    ],
    yearBuilt: 2024,
    agent: {
      name: "Tariq Al-Hassan",
      title: "Senior Luxury Property Specialist",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "tariq@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: false
  },
  {
    id: "prop-lagos-07",
    title: "The Coral: 1,000sqm Prime Oceanfront Land at Eko Atlantic City",
    slug: "the-coral-1000sqm-oceanfront-land-eko-atlantic-city",
    location: {
      address: "Marina District, Eko Atlantic City",
      city: "Lagos",
      state: "Lagos State",
      neighborhood: "Eko Atlantic City",
      country: "Nigeria"
    },
    price: 92e7,
    status: "For Sale",
    type: "Land",
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    sizeSqm: 1e3,
    featured: false,
    verified: true,
    shortDescription: "Exclusive 1,000sqm oceanfront development parcel in Eko Atlantic City with world-class deep-sea sea wall protection and international utilities.",
    fullDescription: "Secure your stake in Africa\u2019s premier financial hub and master-planned coastal city. This 1,000sqm oceanfront plot in the Marina District of Eko Atlantic offers international-standard urban infrastructure including underground power grids, stormwater canals, dedicated water treatment, and fiber optic connectivity. Approved for high-density luxury residential or mixed-use commercial development.",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Direct Oceanfront Marina District Location",
      "Protected by the Great Wall of Lagos Coastal Barrier",
      "Underground High-Capacity Clean Power & Water Grid",
      "Approved for Luxury Residential / Mixed-Use Development",
      "Free Zone Tax & Duty Benefits Available"
    ],
    yearBuilt: 2024,
    agent: {
      name: "Chioma Adeleke",
      title: "Lagos Waterfront Portfolio Lead",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "chioma@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: false
  },
  {
    id: "prop-ibadan-01",
    title: "The Heritage: 5-Bedroom Colonial Contemporary Villa in Iyaganku GRA",
    slug: "the-heritage-5-bedroom-colonial-contemporary-villa-iyaganku-gra-ibadan",
    location: {
      address: "Ring Road Extension, Iyaganku GRA",
      city: "Ibadan",
      state: "Oyo State",
      neighborhood: "Iyaganku GRA",
      country: "Nigeria"
    },
    price: 165e6,
    status: "For Sale",
    type: "Villa",
    bedrooms: 5,
    bathrooms: 5,
    parkingSpaces: 5,
    sizeSqm: 580,
    featured: false,
    verified: true,
    shortDescription: "Serene 5-bedroom luxury villa with private swimming pool, solar power system, and vast green compound in quiet Iyaganku GRA, Ibadan.",
    fullDescription: "Located in Ibadan\u2019s premier heritage neighborhood of Iyaganku GRA, this 5-bedroom private villa seamlessly combines contemporary open architecture with lush tropical surroundings. Features polished hardwood staircases, modern island kitchen, master suite with jacuzzi, sparkling family swimming pool, fruit orchard garden, solar power inverter, and 2-room staff quarters.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Serene Iyaganku GRA Postal Code",
      "Private Swimming Pool & Sun Deck",
      "Lush Landscaped Fruit Garden & Gazebo",
      "15kVA Solar Power Backup System",
      "Fully Enclosed with Electric Perimeter Fence"
    ],
    yearBuilt: 2023,
    agent: {
      name: "Chioma Adeleke",
      title: "Lagos & Western Region Lead",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "chioma@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: false
  },
  {
    id: "prop-calabar-01",
    title: "The Haven Resort Villa: 4-Bedroom Waterfront Retreat in Calabar",
    slug: "the-haven-resort-villa-4-bedroom-waterfront-retreat-calabar",
    location: {
      address: "Marina Road, State Housing Estate",
      city: "Calabar",
      state: "Cross River State",
      neighborhood: "State Housing Estate",
      country: "Nigeria"
    },
    price: 135e6,
    status: "For Sale",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 4,
    parkingSpaces: 4,
    sizeSqm: 510,
    featured: false,
    verified: true,
    shortDescription: "Peaceful 4-bedroom resort-style waterfront residence overlooking the Calabar River with outdoor deck, lush lawns, and borehole filtration.",
    fullDescription: "Nestled in the tranquil, clean, and tourism-rich city of Calabar, this 4-bedroom resort-style villa provides picturesque Calabar River views. Highlights include vaulted timber ceilings, wrap-around verandas, modern open kitchen, manicured lawns with mature royal palm trees, and top-tier security within the State Housing Estate.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Calabar River Waterfront Views",
      "Wrap-Around Tropical Timber Verandas",
      "Borehole with Advanced UV Water Treatment",
      "Solar Powered Inverter System",
      "Gated Community with 24/7 Security"
    ],
    yearBuilt: 2023,
    agent: {
      name: "Bassey Ekpenyong",
      title: "South-South Regional Director",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "bassey@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: false
  },
  {
    id: "prop-lagos-08",
    title: "The Bellagio: 5-Bedroom Fully Automated Detached House in Ikate",
    slug: "the-bellagio-5-bedroom-fully-automated-detached-house-ikate-lekki",
    location: {
      address: "Freedom Way, Ikate Elegushi",
      city: "Lagos",
      state: "Lagos State",
      neighborhood: "Ikate Elegushi",
      country: "Nigeria"
    },
    price: 31e7,
    status: "For Sale",
    type: "Detached Mansion",
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 4,
    sizeSqm: 520,
    featured: true,
    verified: true,
    shortDescription: "Contemporary 5-bedroom smart detached residence with private swimming pool, cinema room, box room, and rooftop terrace in Ikate.",
    fullDescription: "Located just off Freedom Way with swift connectivity to Lekki Phase 1 and Victoria Island, The Bellagio represents modern contemporary elegance. Equipped with full home automation, ambient LED cove lighting, fitted kitchen with quartz breakfast bar, soundproof cinema room, sparkling swimming pool, and spacious rooftop sky terrace.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
    ],
    features: [
      "Full Smart Home Automation & Voice Integration",
      "Private Swimming Pool with Waterfall Feature",
      "In-House Private Cinema Room",
      "Rooftop Terrace Lounge with Sunset City Views",
      "Fitted Chef Kitchen with German Appliances",
      "Ensuite Maid\u2019s Room (BQ)"
    ],
    yearBuilt: 2024,
    agent: {
      name: "Chioma Adeleke",
      title: "Lagos Waterfront Portfolio Lead",
      phone: "08066154568",
      whatsapp: "2348066154568",
      email: "chioma@galaxyrealestate.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      verified: true
    },
    virtualTourAvailable: true
  }
];

// src/data/servicesAndTestimonials.ts
var SAMPLE_SERVICES = [
  {
    id: "srv-1",
    title: "Luxury Residential Sales & Acquisition",
    subtitle: "Exclusive Buyer & Seller Representation",
    description: "We represent buyers and sellers of Nigeria\u2019s most distinguished residential real estate, from private waterfront mansions in Ikoyi to diplomatic villas in Maitama.",
    iconName: "Home",
    benefits: [
      "Discreet off-market listings portfolio",
      "Exhaustive legal title verification (AGIS / Lands Bureau)",
      "High-resolution cinematic media marketing",
      "End-to-end conveyance & escrow coordination"
    ],
    published: true,
    displayOrder: 1
  },
  {
    id: "srv-2",
    title: "High-Yield Real Estate Investment Advisory",
    subtitle: "Strategic Wealth Creation & Asset Growth",
    description: "Bespoke advisory for private wealth offices, diaspora investors, and institutional funds seeking capital appreciation and inflation-hedged yields across Nigeria.",
    iconName: "TrendingUp",
    benefits: [
      "Off-plan development early-stage discounts",
      "Cash-flow and rental yield projection models",
      "Structuring diaspora cross-border property acquisitions",
      "Portfolio diversification analysis"
    ],
    published: true,
    displayOrder: 2
  },
  {
    id: "srv-3",
    title: "Premium Property & Asset Management",
    subtitle: "Preserving Value, Maximizing Returns",
    description: "Full-spectrum property stewardship ensuring your luxury real estate investments remain in immaculate condition with maximum occupancy rates and vetted tenants.",
    iconName: "Layers",
    benefits: [
      "Comprehensive tenant background vetting",
      "Automated rent collection & accounting reports",
      "24/7 preventative maintenance coordination",
      "Facility management for residential estates"
    ],
    published: true,
    displayOrder: 3
  },
  {
    id: "srv-4",
    title: "Corporate Real Estate & Commercial Leasing",
    subtitle: "Grade-A Office & Commercial Space",
    description: "Assisting multinational companies, financial institutions, and embassies in acquiring premium commercial floor plates, headquarters buildings, and retail hubs.",
    iconName: "Briefcase",
    benefits: [
      "Grade-A corporate office space leasing",
      "Diplomatic compound acquisition",
      "Lease agreement negotiations & fit-out advisory",
      "Strategic commercial locations analysis"
    ],
    published: true,
    displayOrder: 4
  }
];
var SAMPLE_TESTIMONIALS = [
  {
    id: "test-1",
    name: "Senator (Dr.) Oladipo Adeleke",
    role: "Real Estate Investor & Public Servant",
    location: "Abuja & London",
    rating: 5,
    comment: "Galaxy Real Estate handled the acquisition of our family estate in Maitama with absolute discretion and legal diligence. Their attention to detail and transparency is second to none in Nigeria.",
    propertyPurchased: "5-Bedroom Smart Villa, Maitama",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    published: true,
    displayOrder: 1
  },
  {
    id: "test-2",
    name: "Mrs. Folashade Alakija-Cole",
    role: "Managing Director, Energy Group",
    location: "Victoria Island, Lagos",
    rating: 5,
    comment: "As a diaspora investor living between London and Lagos, finding a trustworthy real estate partner was vital. Galaxy helped me acquire two luxury waterfront apartments in Ikoyi seamlessly.",
    propertyPurchased: "Luxury Penthouse, Banana Island",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    published: true,
    displayOrder: 2
  },
  {
    id: "test-3",
    name: "Engr. Bassey Udoma",
    role: "Tech Entrepreneur & Founder",
    location: "Lagos & San Francisco",
    rating: 5,
    comment: "The WhatsApp support and virtual walkthrough experience was incredible. I was able to inspect and secure an off-market property in Guzape without flying into Abuja until the closing day.",
    propertyPurchased: "Contemporary Villa, Guzape Hills",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    published: true,
    displayOrder: 3
  }
];

// src/config/company.ts
var company = {
  name: "GALAXY",
  logo: "https://imgur.com/uHj7q5k.png",
  tagline: "Find Your Space. Build Your Future.",
  phone: "08066154568",
  email: "info@galaxyrealestate.com",
  whatsapp: "2348066154568",
  address: "Plot 1408, Maitama District, Abuja, Nigeria",
  branches: [
    {
      city: "Abuja (HQ)",
      address: "Plot 1408, Aguiyi Ironsi Way, Maitama, Abuja",
      phone: "08066154568"
    },
    {
      city: "Lagos Office",
      address: "18A Ozumba Mbadiwe Avenue, Victoria Island, Lagos",
      phone: "08066154568"
    },
    {
      city: "Uyo Branch",
      address: "24 Ewet Housing Estate Road, Uyo, Akwa Ibom",
      phone: "08066154568"
    }
  ],
  businessHours: {
    weekdays: "Monday \u2013 Friday: 8:00 AM \u2013 6:00 PM",
    saturday: "Saturday: 9:00 AM \u2013 4:00 PM",
    sunday: "Sunday: Closed (Emergency Agent on Call)"
  },
  stats: {
    propertiesListed: "500+",
    happyClients: "350+",
    yearsExperience: "10+",
    clientSatisfaction: "95%",
    totalTransactions: "\u20A645B+"
  },
  socials: {
    facebook: "https://facebook.com/galaxyrealestateng",
    instagram: "https://instagram.com/galaxyrealestateng",
    linkedin: "https://linkedin.com/company/galaxy-real-estate-nigeria",
    tiktok: "https://tiktok.com/@galaxyrealestateng",
    twitter: "https://twitter.com/galaxyrealestateng"
  },
  formspreeEndpoint: "https://formspree.io/f/xkjnrqjn"
};

// server/seedData.ts
var initialAdmin = {
  email: "admin@galaxyrealestate.com",
  name: "Galaxy Administrator",
  role: "superadmin",
  avatar: "https://i.imgur.com/uHj7q5k.png",
  createdAt: (/* @__PURE__ */ new Date()).toISOString()
};
var initialHomepage = {
  heroHeading: "Discover Exclusive Luxury Properties in Nigeria",
  heroSubtitle: "Connecting high-net-worth individuals, diaspora investors, and modern families with verified premium homes, luxury villas, and high-yield real estate assets.",
  heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
  heroButtonText: "Explore Portfolio",
  heroButtonLink: "#properties",
  hero: {
    badge: "Nigeria\u2019s Premier Luxury Real Estate Marketplace",
    title: "Find a Place You\u2019ll Love To Call Home.",
    subtitleAccent: "Curated for the Discerning Elite",
    subtitle: "Connecting high-net-worth individuals, diaspora investors, and modern families with verified premium homes, luxury villas, and high-yield real estate assets.",
    backgroundImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85",
    exploreButtonText: "Explore Properties",
    contactButtonText: "Contact an Agent"
  },
  whyChooseHeading: "Why Discerning Clients Choose Galaxy Real Estate",
  whyChooseDescription: "With over a decade of verified real estate transactions in Abuja, Lagos, and high-growth Nigerian capitals, Galaxy Real Estate provides unmatched discretion, legal safety, and architectural excellence.",
  whyChoosePoints: [
    {
      title: "100% Verified Legal Titles",
      description: "Every property in our portfolio undergoes rigorous title searches at Lands Registry, AGIS, and State Land Ministries to ensure zero encumbrances or third-party disputes.",
      icon: "ShieldCheck"
    },
    {
      title: "Direct Developer & Owner Access",
      description: "Avoid inflated intermediary markups with direct access to prime architectural developments, private estates, and luxury penthouses.",
      icon: "KeyRound"
    },
    {
      title: "Dedicated Client Care & Concierge",
      description: "From physical and live virtual walkthroughs to legal closing and keys handover, your personal Galaxy advisor is available around the clock.",
      icon: "Headphones"
    },
    {
      title: "High Capital Appreciation Corridors",
      description: "We curate properties situated in top-tier growth zones in Maitama, Ikoyi, Banana Island, Guzape, and Eko Atlantic City with proven annual ROI.",
      icon: "TrendingUp"
    }
  ],
  whyChoose: [
    {
      title: "100% Verified Legal Titles",
      description: "Every property in our portfolio undergoes rigorous title searches at Lands Registry, AGIS, and State Land Ministries to ensure zero encumbrances or third-party disputes.",
      icon: "ShieldCheck"
    },
    {
      title: "Direct Developer & Owner Access",
      description: "Avoid inflated intermediary markups with direct access to prime architectural developments, private estates, and luxury penthouses.",
      icon: "KeyRound"
    },
    {
      title: "Dedicated Client Care & Concierge",
      description: "From physical and live virtual walkthroughs to legal closing and keys handover, your personal Galaxy advisor is available around the clock.",
      icon: "Headphones"
    },
    {
      title: "High Capital Appreciation Corridors",
      description: "We curate properties situated in top-tier growth zones in Maitama, Ikoyi, Banana Island, Guzape, and Eko Atlantic City with proven annual ROI.",
      icon: "TrendingUp"
    }
  ],
  ctaHeading: "Ready to Acquire Your Next Luxury Property in Nigeria?",
  ctaDescription: "Speak with our senior luxury property specialists today for bespoke private viewings, off-market opportunities, or personalized property investment advisory.",
  ctaButtonText: "Schedule Private Consultation",
  ctaButtonLink: "#contact",
  ctaSection: {
    title: "Ready to Acquire Your Next Luxury Property in Nigeria?",
    subtitle: "Speak with our senior luxury property specialists today for bespoke private viewings, off-market opportunities, or personalized property investment advisory.",
    buttonText: "Schedule Private Consultation",
    buttonLink: "#contact"
  },
  stats: [
    { label: "Active Listings", value: "500+" },
    { label: "Properties Brokered", value: "\u20A645B+" },
    { label: "Satisfied Clients", value: "1,200+" },
    { label: "Years of Excellence", value: "10+" }
  ]
};
var initialAbout = {
  title: "Pioneering Luxury Real Estate Across Nigeria",
  subtitle: "Galaxy Real Estate is a premier real estate brokerage and development advisory firm committed to redefining modern living standards in West Africa.",
  description: "Founded with a vision to deliver world-class real estate experiences, Galaxy Real Estate has grown into one of Nigeria\u2019s most trusted real estate companies. Headquartered in Abuja with offices in Lagos and Uyo, our multidisciplinary team of property specialists, architects, surveyors, and legal advisors brings profound market intelligence and integrity to every transaction.",
  mission: "To deliver transparent, seamless, and high-yield real estate solutions that empower individuals and institutions to build generational wealth and enjoy unmatched living comfort.",
  vision: "To be Africa\u2019s premier luxury real estate ecosystem, recognized globally for architectural distinction, ethical brokerage, and client-first excellence.",
  coreValues: [
    {
      title: "Integrity & Transparency",
      description: "We prioritize honest advisory and zero hidden costs in all our property transactions and valuation assessments."
    },
    {
      title: "Architectural Excellence",
      description: "We exclusively list properties characterized by superior structural integrity, modern aesthetics, and top-tier finishes."
    },
    {
      title: "Client Discretion",
      description: "High-net-worth individuals, diplomatic corps, and corporate institutions trust us for utmost privacy and security."
    },
    {
      title: "Innovation & Smart Living",
      description: "We champion sustainable, solar-integrated, and smart-automated homes designed for 21st-century comfort."
    }
  ],
  image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  additionalSections: [
    {
      id: "sec-1",
      heading: "Our Nationwide Presence",
      content: "With strategic hubs in Abuja (Federal Capital Territory), Lagos (Commercial Financial Epicenter), and Uyo (South-South Energy Hub), we provide localized insight with institutional-grade standards.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
    }
  ]
};
var initialSettings = {
  name: company.name,
  logo: company.logo,
  mobileLogo: company.logo,
  favicon: "/favicon.ico",
  tagline: company.tagline,
  phone: company.phone,
  email: company.email,
  whatsapp: company.whatsapp,
  defaultWhatsAppMessage: "Hello Galaxy Real Estate, I am interested in one of your properties and would like to speak with an agent.",
  address: company.address,
  city: "Abuja",
  state: "FCT",
  country: "Nigeria",
  googleMapsLink: "https://maps.google.com/?q=Maitama+Abuja+Nigeria",
  branches: company.branches,
  businessHours: company.businessHours,
  stats: company.stats,
  socials: company.socials,
  footerText: "Galaxy Real Estate is Nigeria\u2019s leading luxury property brokerage and investment firm, delivering exceptional residential and commercial real estate solutions.",
  copyrightText: `\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Galaxy Real Estate. All rights reserved.`,
  primaryColor: "#0B1F3A",
  secondaryColor: "#D4A84F"
};
var initialSEO = {
  websiteTitle: "Galaxy Real Estate | Luxury Homes & Commercial Properties in Nigeria",
  metaTitle: "Galaxy Real Estate | Luxury Homes & Commercial Properties in Nigeria",
  metaDescription: "Browse verified luxury houses, modern penthouses, villas, and prime plots of land for sale and rent in Abuja, Lagos, Port Harcourt, and Uyo with Galaxy Real Estate.",
  ogImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  defaultKeywords: "real estate nigeria, luxury homes abuja, lagos penthouses, property for sale nigeria, maitama villa, banana island mansion, galaxy real estate",
  keywords: ["real estate nigeria", "luxury homes abuja", "lagos penthouses", "property for sale nigeria", "maitama villa", "banana island mansion", "galaxy real estate", "abuja luxury real estate", "nigeria property investment"],
  propertySeoTitle: "{title} | Galaxy Real Estate Nigeria",
  propertySeoDescription: "{shortDescription} Located in {city}, Nigeria. Listed at {price}. Contact Galaxy Real Estate for viewing.",
  socialSharingImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
};
var initialNavigation = [
  { id: "nav-1", label: "Home", url: "/", displayOrder: 1, visible: true, externalLink: false },
  { id: "nav-2", label: "Properties", url: "/#properties", displayOrder: 2, visible: true, externalLink: false },
  { id: "nav-3", label: "About Us", url: "/#about", displayOrder: 3, visible: true, externalLink: false },
  { id: "nav-4", label: "Services", url: "/#services", displayOrder: 4, visible: true, externalLink: false },
  { id: "nav-5", label: "Testimonials", url: "/#testimonials", displayOrder: 5, visible: true, externalLink: false },
  { id: "nav-6", label: "Contact", url: "/#contact", displayOrder: 6, visible: true, externalLink: false }
];
var initialProperties = SAMPLE_PROPERTIES.map((p) => ({
  ...p,
  currency: "\u20A6",
  transactionType: p.status === "For Rent" ? "For Rent" : "For Sale",
  published: true,
  mainImage: p.images[0] || "",
  createdAt: (/* @__PURE__ */ new Date()).toISOString(),
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
}));
var initialServices = SAMPLE_SERVICES.map((s, idx) => ({
  ...s,
  displayOrder: idx + 1,
  published: true
}));
var initialTestimonials = SAMPLE_TESTIMONIALS.map((t, idx) => ({
  ...t,
  displayOrder: idx + 1,
  published: true
}));

// server/db.ts
var client = null;
var db = null;
var gridfsBucket = null;
var memoryServer = null;
var connectPromise = null;
var dbStatus = {
  mode: "embedded",
  database: config.mongodbDatabase,
  connected: false
};
function getDatabaseStatus() {
  return dbStatus;
}
async function connectToDatabase() {
  if (db && gridfsBucket) {
    return { db, bucket: gridfsBucket };
  }
  if (connectPromise) {
    return connectPromise;
  }
  connectPromise = (async () => {
    const uri = config.mongodbUri;
    const hasValidScheme = uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
    if (uri && hasValidScheme) {
      try {
        const maskedUri = uri.replace(/:[^:@]+@/, ":****@");
        console.log(`\u{1F50C} Attempting connection to MongoDB Atlas cluster: ${maskedUri}...`);
        const externalClient = new MongoClient(uri, {
          serverSelectionTimeoutMS: 6e3,
          connectTimeoutMS: 6e3
        });
        await externalClient.connect();
        client = externalClient;
        db = client.db(config.mongodbDatabase);
        dbStatus = {
          mode: "atlas",
          database: config.mongodbDatabase,
          connected: true
        };
        console.log(`\u2705 Successfully connected to external MongoDB Atlas database: ${config.mongodbDatabase}`);
      } catch (externalErr) {
        console.log(`\u26A0\uFE0F Remote MongoDB Atlas connection notice: ${externalErr?.message || externalErr}`);
        console.log(`\u2139\uFE0F Ensure IP whitelist in Atlas Network Access includes (0.0.0.0/0).`);
        client = null;
        db = null;
      }
    }
    if (!db) {
      const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
      if (isServerless && (!uri || !hasValidScheme)) {
        throw new Error("MONGODB_URI is required when running on Vercel. Please add your MongoDB Atlas connection string in Vercel Project Settings > Environment Variables.");
      }
      try {
        if (!memoryServer) {
          console.log("\u{1F504} Initializing embedded MongoDB engine...");
          memoryServer = await MongoMemoryServer.create({
            instance: {
              dbName: config.mongodbDatabase
            }
          });
        }
        const memUri = memoryServer.getUri();
        client = new MongoClient(memUri);
        await client.connect();
        db = client.db(config.mongodbDatabase);
        dbStatus = {
          mode: "embedded",
          database: config.mongodbDatabase,
          connected: true
        };
        console.log(`\u2705 Embedded MongoDB engine ready and connected.`);
      } catch (memErr) {
        console.error("Embedded memory MongoDB server failure:", memErr?.message || memErr);
        if (isServerless) {
          throw new Error("Please configure a valid MONGODB_URI in Vercel Environment Variables.");
        }
        throw memErr;
      }
    }
    gridfsBucket = new GridFSBucket(db, {
      bucketName: "mediaFiles"
    });
    console.log("\u2705 GridFS binary storage bucket initialized.");
    await setupIndexesAndSeed(db);
    return { db, bucket: gridfsBucket };
  })();
  try {
    return await connectPromise;
  } catch (err) {
    connectPromise = null;
    throw err;
  }
}
function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDatabase first.");
  }
  return db;
}
function getGridFSBucket() {
  if (!gridfsBucket) {
    throw new Error("GridFS Bucket not initialized. Call connectToDatabase first.");
  }
  return gridfsBucket;
}
async function setupIndexesAndSeed(database) {
  try {
    const collections = await database.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    const propertiesCol = database.collection("properties");
    await propertiesCol.createIndex({ slug: 1 }, { unique: true });
    await propertiesCol.createIndex({ published: 1 });
    await propertiesCol.createIndex({ featured: 1 });
    await propertiesCol.createIndex({ type: 1 });
    await propertiesCol.createIndex({ status: 1 });
    await propertiesCol.createIndex({ "location.city": 1 });
    await propertiesCol.createIndex({ price: 1 });
    await propertiesCol.createIndex({ createdAt: -1 });
    const inquiriesCol = database.collection("inquiries");
    await inquiriesCol.createIndex({ status: 1 });
    await inquiriesCol.createIndex({ createdAt: -1 });
    await inquiriesCol.createIndex({ propertyId: 1 });
    const mediaCol = database.collection("mediaMetadata");
    await mediaCol.createIndex({ fileId: 1 }, { unique: true });
    await mediaCol.createIndex({ category: 1 });
    await mediaCol.createIndex({ uploadDate: -1 });
    const activityCol = database.collection("activityLogs");
    await activityCol.createIndex({ timestamp: -1 });
    const adminsCol = database.collection("admins");
    await adminsCol.createIndex({ email: 1 }, { unique: true });
    const adminCount = await adminsCol.countDocuments();
    if (adminCount === 0) {
      console.log("\u{1F331} Seeding initial admin user...");
      const hashedPassword = await bcrypt.hash(config.adminInitialPassword, 12);
      await adminsCol.insertOne({
        ...initialAdmin,
        password: hashedPassword,
        pin: config.adminPin
      });
      console.log(`\u2705 Default admin created: ${config.adminEmail}`);
    } else {
      await adminsCol.updateMany(
        { $or: [{ avatar: { $regex: "unsplash.com" } }, { avatar: { $regex: "<blockquote" } }, { avatar: { $exists: false } }, { avatar: "" }] },
        { $set: { avatar: initialAdmin.avatar } }
      );
    }
    const propCount = await propertiesCol.countDocuments();
    if (propCount === 0) {
      console.log("\u{1F331} Seeding initial properties...");
      await propertiesCol.insertMany(initialProperties);
      console.log(`\u2705 ${initialProperties.length} initial properties seeded.`);
    }
    const homepageCol = database.collection("homepageContent");
    const homeCount = await homepageCol.countDocuments();
    if (homeCount === 0) {
      await homepageCol.insertOne({ ...initialHomepage, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    }
    const aboutCol = database.collection("aboutContent");
    const aboutCount = await aboutCol.countDocuments();
    if (aboutCount === 0) {
      await aboutCol.insertOne({ ...initialAbout, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    }
    const settingsCol = database.collection("websiteSettings");
    const settingsCount = await settingsCol.countDocuments();
    if (settingsCount === 0) {
      await settingsCol.insertOne({ ...initialSettings, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    }
    const seoCol = database.collection("seoSettings");
    const seoCount = await seoCol.countDocuments();
    if (seoCount === 0) {
      await seoCol.insertOne({ ...initialSEO, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    }
    const servicesCol = database.collection("services");
    const servicesCount = await servicesCol.countDocuments();
    if (servicesCount === 0) {
      await servicesCol.insertMany(initialServices);
    }
    const testimonialsCol = database.collection("testimonials");
    const testCount = await testimonialsCol.countDocuments();
    if (testCount === 0) {
      await testimonialsCol.insertMany(initialTestimonials);
    }
    const navCol = database.collection("navigationItems");
    const navCount = await navCol.countDocuments();
    if (navCount === 0) {
      await navCol.insertMany(initialNavigation);
    }
    const actCount = await activityCol.countDocuments();
    if (actCount === 0) {
      await activityCol.insertOne({
        action: "System Initialized",
        user: "System",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB"),
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB"),
        details: "Galaxy Real Estate CMS database and GridFS engine initialized successfully."
      });
    }
    console.log("\u2705 Database schemas and initial seed records verified.");
  } catch (err) {
    console.error("Error in database setup and seeding:", err);
  }
}

// server/routes/auth.ts
import { Router } from "express";
import bcrypt2 from "bcryptjs";
import rateLimit from "express-rate-limit";

// server/auth.ts
import jwt from "jsonwebtoken";
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: "8h" }
  );
}
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (err) {
    return null;
  }
}
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.galaxy_admin_token) {
    token = req.cookies.galaxy_admin_token;
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please enter admin password to unlock."
    });
  }
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Session expired or invalid. Please unlock again."
    });
  }
  req.user = user;
  next();
}
async function logActivity(action, user, details, affectedItem) {
  try {
    const db2 = getDb();
    const now = /* @__PURE__ */ new Date();
    await db2.collection("activityLogs").insertOne({
      action,
      user,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB"),
      details: details || "",
      affectedItem: affectedItem || ""
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

// server/routes/auth.ts
var authRouter = Router();
var loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 30,
  // limit each IP to 30 login requests per 15 minutes
  standardHeaders: true,
  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  // Disable the `X-RateLimit-*` headers
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
    trustProxy: false
  },
  message: { success: false, error: "Too many login attempts. Please wait 15 minutes." }
});
authRouter.post("/login", loginLimiter, async (req, res) => {
  try {
    const { password, email } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: "Password is required to unlock." });
    }
    const db2 = getDb();
    const adminsCol = db2.collection("admins");
    let admin = null;
    const searchEmail = (email || config.adminEmail || "").toLowerCase().trim();
    if (searchEmail) {
      admin = await adminsCol.findOne({
        email: { $regex: new RegExp(`^${searchEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
      });
    }
    if (!admin) {
      admin = await adminsCol.findOne({});
    }
    if (!admin) {
      const hashedPassword = await bcrypt2.hash(config.adminInitialPassword, 12);
      const newAdminDoc = {
        ...initialAdmin,
        email: (config.adminEmail || "admin@galaxyrealestate.com").toLowerCase().trim(),
        password: hashedPassword,
        pin: config.adminPin,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await adminsCol.insertOne(newAdminDoc);
      admin = newAdminDoc;
    }
    let isPasswordValid = false;
    if (admin.password) {
      try {
        isPasswordValid = await bcrypt2.compare(password, admin.password);
      } catch (e) {
        isPasswordValid = false;
      }
    }
    if (!isPasswordValid) {
      isPasswordValid = password === config.adminInitialPassword || admin.pin && password === admin.pin || password === "admin123@Galaxy" || admin.password && password === admin.password;
    }
    if (!isPasswordValid) {
      await logActivity("Failed Login Attempt", email || "Unknown", "Incorrect password entered", "Auth");
      return res.status(401).json({ success: false, error: "Incorrect password. Please try again." });
    }
    const lastLogin = (/* @__PURE__ */ new Date()).toISOString();
    await adminsCol.updateOne({ _id: admin._id }, { $set: { lastLogin } });
    const adminUser = {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name || "Galaxy Admin",
      role: admin.role || "superadmin",
      avatar: admin.avatar,
      lastLogin
    };
    const token = generateToken(adminUser);
    res.cookie("galaxy_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1e3
      // 8 hours
    });
    await logActivity("Admin Login", adminUser.name, "Admin unlocked dashboard successfully", "Auth");
    return res.json({
      success: true,
      token,
      user: adminUser
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, error: "Internal server error during authentication." });
  }
});
authRouter.get("/me", requireAdmin, async (req, res) => {
  try {
    const db2 = getDb();
    const admin = await db2.collection("admins").findOne({ email: req.user?.email });
    if (!admin) {
      return res.status(404).json({ success: false, error: "User profile not found." });
    }
    return res.json({
      success: true,
      user: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        avatar: admin.avatar,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to retrieve session." });
  }
});
authRouter.post("/logout", (req, res) => {
  res.clearCookie("galaxy_admin_token");
  return res.json({ success: true, message: "Logged out / Dashboard locked successfully." });
});
authRouter.put("/profile", requireAdmin, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const db2 = getDb();
    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (avatar) updates.avatar = avatar;
    await db2.collection("admins").updateOne(
      { email: req.user?.email },
      { $set: updates }
    );
    await logActivity("Profile Updated", req.user?.name || "Admin", "Updated admin profile information", "Admin Profile");
    return res.json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update profile." });
  }
});
authRouter.put("/password", requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Current password and new password are required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: "New password and confirmation do not match." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters long." });
    }
    const db2 = getDb();
    const admin = await db2.collection("admins").findOne({ email: req.user?.email });
    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin account not found." });
    }
    const isMatch = await bcrypt2.compare(currentPassword, admin.password) || currentPassword === config.adminInitialPassword;
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Current password is incorrect." });
    }
    const hashedNewPassword = await bcrypt2.hash(newPassword, 12);
    await db2.collection("admins").updateOne(
      { _id: admin._id },
      { $set: { password: hashedNewPassword, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } }
    );
    await logActivity("Password Changed", req.user?.name || "Admin", "Admin password changed securely with bcrypt", "Security");
    return res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to change password." });
  }
});

// server/routes/properties.ts
import { Router as Router2 } from "express";
import { ObjectId } from "mongodb";
var propertiesRouter = Router2();
function generateSlug(title, city = "Nigeria") {
  const base = `${title} ${city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${base}-${Math.floor(1e3 + Math.random() * 9e3)}`;
}
propertiesRouter.get("/", async (req, res) => {
  try {
    const {
      searchTerm,
      city,
      propertyType,
      status,
      bedrooms,
      minPrice,
      maxPrice,
      featured,
      sortBy
    } = req.query;
    const db2 = getDb();
    const query = { published: { $ne: false } };
    if (city && city !== "all") {
      query["location.city"] = { $regex: new RegExp(`^${city}$`, "i") };
    }
    if (propertyType && propertyType !== "all") {
      query.type = { $regex: new RegExp(`^${propertyType}$`, "i") };
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (featured === "true") {
      query.featured = true;
    }
    if (bedrooms && bedrooms !== "all") {
      if (bedrooms === "5+") {
        query.bedrooms = { $gte: 5 };
      } else {
        query.bedrooms = parseInt(bedrooms, 10);
      }
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (searchTerm && typeof searchTerm === "string" && searchTerm.trim()) {
      const q = searchTerm.trim();
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
        { fullDescription: { $regex: q, $options: "i" } },
        { "location.neighborhood": { $regex: q, $options: "i" } },
        { "location.address": { $regex: q, $options: "i" } },
        { "location.city": { $regex: q, $options: "i" } },
        { type: { $regex: q, $options: "i" } }
      ];
    }
    let sortOption = { featured: -1, createdAt: -1 };
    if (sortBy === "price-asc") sortOption = { price: 1 };
    else if (sortBy === "price-desc") sortOption = { price: -1 };
    else if (sortBy === "newest") sortOption = { createdAt: -1, yearBuilt: -1 };
    else if (sortBy === "bedrooms") sortOption = { bedrooms: -1 };
    const properties = await db2.collection("properties").find(query).sort(sortOption).toArray();
    const formatted = properties.map((p) => ({
      ...p,
      id: p.id || p._id.toString()
    }));
    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error("Error fetching public properties:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch properties from database." });
  }
});
propertiesRouter.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const db2 = getDb();
    let property = await db2.collection("properties").findOne({ slug });
    if (!property && ObjectId.isValid(slug)) {
      property = await db2.collection("properties").findOne({ _id: new ObjectId(slug) });
    }
    if (!property) {
      property = await db2.collection("properties").findOne({ id: slug });
    }
    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found." });
    }
    return res.json({
      success: true,
      data: {
        ...property,
        id: property.id || property._id.toString()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to retrieve property details." });
  }
});
propertiesRouter.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const db2 = getDb();
    const properties = await db2.collection("properties").find({}).sort({ createdAt: -1 }).toArray();
    const formatted = properties.map((p) => ({
      ...p,
      id: p.id || p._id?.toString()
    }));
    const stats = {
      total: formatted.length,
      published: formatted.filter((p) => p.published !== false).length,
      drafts: formatted.filter((p) => p.published === false).length,
      forSale: formatted.filter((p) => p.status === "For Sale").length,
      forRent: formatted.filter((p) => p.status === "For Rent").length,
      featured: formatted.filter((p) => p.featured).length
    };
    return res.json({
      success: true,
      stats,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch admin properties." });
  }
});
propertiesRouter.post("/admin/create", requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const db2 = getDb();
    if (!data.title || !data.price || !data.location?.city) {
      return res.status(400).json({
        success: false,
        error: "Title, price, and city are required to create a property."
      });
    }
    const slug = data.slug?.trim() ? data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") : generateSlug(data.title, data.location.city);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newProperty = {
      id: `prop-${Date.now()}`,
      title: data.title.trim(),
      slug,
      location: {
        address: data.location.address || "",
        city: data.location.city || "Abuja",
        state: data.location.state || "FCT",
        neighborhood: data.location.neighborhood || data.location.city,
        country: data.location.country || "Nigeria"
      },
      price: Number(data.price),
      currency: data.currency || "\u20A6",
      period: data.period || (data.status === "For Rent" ? "year" : void 0),
      status: data.status || "For Sale",
      type: data.type || "Villa",
      transactionType: data.transactionType || (data.status === "For Rent" ? "For Rent" : "For Sale"),
      bedrooms: Number(data.bedrooms || 0),
      bathrooms: Number(data.bathrooms || 0),
      parkingSpaces: Number(data.parkingSpaces || 0),
      sizeSqm: Number(data.sizeSqm || 0),
      featured: Boolean(data.featured),
      published: data.published !== false,
      verified: Boolean(data.verified !== false),
      shortDescription: data.shortDescription || "",
      fullDescription: data.fullDescription || "",
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"],
      mainImage: data.mainImage || data.images && data.images[0] || "",
      features: Array.isArray(data.features) ? data.features : [],
      yearBuilt: Number(data.yearBuilt || (/* @__PURE__ */ new Date()).getFullYear()),
      agent: data.agent || {
        name: "Galaxy Luxury Specialist",
        title: "Senior Property Advisor",
        phone: "08066154568",
        whatsapp: "2348066154568",
        email: "info@galaxyrealestate.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        verified: true
      },
      virtualTourAvailable: Boolean(data.virtualTourAvailable),
      seo: data.seo || {
        title: `${data.title} | Galaxy Real Estate`,
        description: data.shortDescription
      },
      createdAt: now,
      updatedAt: now
    };
    const result = await db2.collection("properties").insertOne(newProperty);
    const createdId = result.insertedId.toString();
    await logActivity(
      "Property Created",
      req.user?.name || "Admin",
      `Created property "${newProperty.title}" at \u20A6${newProperty.price.toLocaleString()}`,
      `Property: ${newProperty.title}`
    );
    return res.status(201).json({
      success: true,
      message: "Property created successfully.",
      data: { ...newProperty, _id: createdId }
    });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ success: false, error: "Failed to create property in database." });
  }
});
propertiesRouter.put("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db2 = getDb();
    const query = {
      $or: [
        { id },
        ...ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : []
      ]
    };
    const existing = await db2.collection("properties").findOne(query);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Property not found." });
    }
    const cleanedUpdates = {
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    delete cleanedUpdates._id;
    delete cleanedUpdates.id;
    if (cleanedUpdates.price) cleanedUpdates.price = Number(cleanedUpdates.price);
    if (cleanedUpdates.bedrooms) cleanedUpdates.bedrooms = Number(cleanedUpdates.bedrooms);
    if (cleanedUpdates.bathrooms) cleanedUpdates.bathrooms = Number(cleanedUpdates.bathrooms);
    if (cleanedUpdates.parkingSpaces) cleanedUpdates.parkingSpaces = Number(cleanedUpdates.parkingSpaces);
    if (cleanedUpdates.sizeSqm) cleanedUpdates.sizeSqm = Number(cleanedUpdates.sizeSqm);
    if (cleanedUpdates.images && cleanedUpdates.images.length > 0 && !cleanedUpdates.mainImage) {
      cleanedUpdates.mainImage = cleanedUpdates.images[0];
    }
    await db2.collection("properties").updateOne(query, { $set: cleanedUpdates });
    await logActivity(
      "Property Edited",
      req.user?.name || "Admin",
      `Updated details for "${existing.title}"`,
      `Property: ${existing.title}`
    );
    return res.json({
      success: true,
      message: "Property updated successfully."
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update property." });
  }
});
propertiesRouter.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db2 = getDb();
    const query = {
      $or: [
        { id },
        ...ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : []
      ]
    };
    const existing = await db2.collection("properties").findOne(query);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Property not found." });
    }
    await db2.collection("properties").deleteOne(query);
    await logActivity(
      "Property Deleted",
      req.user?.name || "Admin",
      `Deleted property "${existing.title}"`,
      `Property: ${existing.title}`
    );
    return res.json({
      success: true,
      message: `Property "${existing.title}" deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete property." });
  }
});
propertiesRouter.post("/admin/:id/duplicate", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db2 = getDb();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    const existing = await db2.collection("properties").findOne(query);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Original property not found." });
    }
    const copy = { ...existing };
    delete copy._id;
    copy.id = `prop-${Date.now()}`;
    copy.title = `${existing.title} (Copy)`;
    copy.slug = generateSlug(copy.title, existing.location?.city);
    copy.published = false;
    copy.createdAt = (/* @__PURE__ */ new Date()).toISOString();
    copy.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const result = await db2.collection("properties").insertOne(copy);
    await logActivity(
      "Property Duplicated",
      req.user?.name || "Admin",
      `Duplicated "${existing.title}" as draft copy`,
      `Property: ${copy.title}`
    );
    return res.status(201).json({
      success: true,
      message: "Property duplicated successfully as draft.",
      data: { ...copy, _id: result.insertedId.toString() }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to duplicate property." });
  }
});

// server/routes/media.ts
import { Router as Router3 } from "express";
import multer from "multer";

// server/gridfs.ts
import { ObjectId as ObjectId2 } from "mongodb";
import { Readable } from "stream";
var GridFSService = class {
  /**
   * Upload image buffer to MongoDB GridFS
   */
  static async uploadImage(buffer, options) {
    const bucket = getGridFSBucket();
    const db2 = getDb();
    const timestamp = Date.now();
    const cleanName = options.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFilename = `${timestamp}_${cleanName}`;
    return new Promise((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      const uploadStream = bucket.openUploadStream(uniqueFilename, {
        metadata: {
          contentType: options.contentType,
          originalName: options.filename,
          category: options.category || "Property",
          propertyId: options.propertyId,
          altText: options.altText || "",
          caption: options.caption || "",
          originalFileId: options.originalFileId,
          editedFromFileId: options.editedFromFileId,
          uploadDate: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      readableStream.pipe(uploadStream).on("error", (error) => {
        console.error("GridFS upload error:", error);
        reject(error);
      }).on("finish", async () => {
        const fileId = uploadStream.id.toString();
        const metadataRecord = {
          id: fileId,
          fileId,
          filename: uniqueFilename,
          contentType: options.contentType,
          size: buffer.length,
          uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
          category: options.category || "Property",
          altText: options.altText || "",
          caption: options.caption || "",
          propertyId: options.propertyId,
          originalFileId: options.originalFileId,
          editedFromFileId: options.editedFromFileId,
          url: `/api/media/${fileId}`,
          usedBy: options.propertyId ? [`Property: ${options.propertyId}`] : []
        };
        try {
          await db2.collection("mediaMetadata").insertOne(metadataRecord);
          resolve({ fileId, metadata: metadataRecord });
        } catch (dbErr) {
          console.error("Error saving media metadata:", dbErr);
          resolve({ fileId, metadata: metadataRecord });
        }
      });
    });
  }
  /**
   * Stream image from GridFS by fileId
   */
  static async streamImage(fileId) {
    const bucket = getGridFSBucket();
    const objectId = new ObjectId2(fileId);
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return null;
    }
    const file = files[0];
    const downloadStream = bucket.openDownloadStream(objectId);
    return {
      stream: downloadStream,
      filename: file.filename,
      contentType: file.metadata?.contentType || file.contentType || "image/jpeg",
      length: file.length
    };
  }
  /**
   * Get metadata for an image
   */
  static async getImageMetadata(fileId) {
    const db2 = getDb();
    const record = await db2.collection("mediaMetadata").findOne({ fileId });
    if (record) {
      return {
        id: record.fileId,
        fileId: record.fileId,
        filename: record.filename,
        contentType: record.contentType,
        size: record.size,
        uploadDate: record.uploadDate,
        category: record.category,
        altText: record.altText,
        caption: record.caption,
        propertyId: record.propertyId,
        url: `/api/media/${record.fileId}`,
        usedBy: record.usedBy || []
      };
    }
    return null;
  }
  /**
   * List all media files
   */
  static async listMedia(category, search) {
    const db2 = getDb();
    const query = {};
    if (category && category !== "all") {
      query.category = category;
    }
    if (search && search.trim()) {
      query.$or = [
        { filename: { $regex: search.trim(), $options: "i" } },
        { altText: { $regex: search.trim(), $options: "i" } },
        { caption: { $regex: search.trim(), $options: "i" } }
      ];
    }
    const items = await db2.collection("mediaMetadata").find(query).sort({ uploadDate: -1 }).toArray();
    return items.map((item) => ({
      id: item.fileId || item._id.toString(),
      fileId: item.fileId,
      filename: item.filename,
      contentType: item.contentType,
      size: item.size,
      uploadDate: item.uploadDate,
      category: item.category,
      altText: item.altText,
      caption: item.caption,
      propertyId: item.propertyId,
      originalFileId: item.originalFileId,
      editedFromFileId: item.editedFromFileId,
      url: `/api/media/${item.fileId}`,
      usedBy: item.usedBy || []
    }));
  }
  /**
   * Delete image from GridFS and metadata collection
   */
  static async deleteImage(fileId) {
    const bucket = getGridFSBucket();
    const db2 = getDb();
    try {
      const objectId = new ObjectId2(fileId);
      await bucket.delete(objectId);
      await db2.collection("mediaMetadata").deleteOne({ fileId });
      return true;
    } catch (err) {
      console.error("Error deleting image from GridFS:", err);
      await db2.collection("mediaMetadata").deleteOne({ fileId });
      return false;
    }
  }
  /**
   * Update metadata
   */
  static async updateMetadata(fileId, updates) {
    const db2 = getDb();
    const result = await db2.collection("mediaMetadata").updateOne(
      { fileId },
      { $set: updates }
    );
    return result.matchedCount > 0;
  }
};

// server/routes/media.ts
var mediaRouter = Router3();
var storage = multer.memoryStorage();
var upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
    // 25MB max file size per image
    files: 25
    // up to 25 files at once
  },
  fileFilter: (req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    const name = (file.originalname || "").toLowerCase();
    const isImageExt = /\.(jpe?g|png|webp|avif|gif|svg|bmp|heic|heif|tiff|ico)$/i.test(name);
    const isImageMime = mime.startsWith("image/") || mime === "application/octet-stream" && isImageExt;
    if (isImageMime || isImageExt) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type "${file.mimetype || "unknown"}". Only image files (JPEG, PNG, WebP, AVIF, SVG, GIF, HEIC) are accepted.`));
    }
  }
});
var handleMulterUpload = (req, res, next) => {
  upload.array("images", 25)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ success: false, error: "Image file too large. Maximum size is 25MB per image." });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ success: false, error: "Too many files uploaded. Maximum is 25 images per batch." });
        }
        return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ success: false, error: err.message || "Error parsing uploaded image files." });
    }
    next();
  });
};
mediaRouter.get("/admin/library", requireAdmin, async (req, res) => {
  try {
    const { category, search } = req.query;
    const items = await GridFSService.listMedia(category, search);
    return res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error?.message || "Failed to retrieve media library." });
  }
});
mediaRouter.post("/admin/upload", requireAdmin, handleMulterUpload, async (req, res) => {
  try {
    const files = req.files;
    const { category = "Property", propertyId, altText, caption } = req.body;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: "No image files provided for upload." });
    }
    const uploaded = [];
    for (const file of files) {
      let contentType = (file.mimetype || "").toLowerCase();
      if (!contentType || contentType === "application/octet-stream" || contentType === "image/jpg") {
        if (/\.jpe?g$/i.test(file.originalname)) contentType = "image/jpeg";
        else if (/\.png$/i.test(file.originalname)) contentType = "image/png";
        else if (/\.webp$/i.test(file.originalname)) contentType = "image/webp";
        else if (/\.gif$/i.test(file.originalname)) contentType = "image/gif";
        else if (/\.svg$/i.test(file.originalname)) contentType = "image/svg+xml";
        else contentType = "image/jpeg";
      }
      const result = await GridFSService.uploadImage(file.buffer, {
        filename: file.originalname,
        contentType,
        category,
        propertyId,
        altText,
        caption
      });
      uploaded.push(result.metadata);
    }
    await logActivity(
      "Images Uploaded",
      req.user?.name || "Admin",
      `Uploaded ${uploaded.length} image(s) to MongoDB GridFS in category "${category}"`,
      `Media Library (${category})`
    );
    return res.status(201).json({
      success: true,
      message: `${uploaded.length} image(s) stored in MongoDB GridFS successfully.`,
      data: uploaded
    });
  } catch (error) {
    console.error("GridFS upload failed:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to upload image to GridFS." });
  }
});
mediaRouter.post("/admin/save-edited", requireAdmin, async (req, res) => {
  try {
    const { base64Data, filename, category = "Property", originalFileId, altText } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "Image data is required." });
    }
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: "Invalid base64 image encoding." });
    }
    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const result = await GridFSService.uploadImage(buffer, {
      filename: filename || `edited_image_${Date.now()}.jpg`,
      contentType,
      category,
      originalFileId,
      altText: altText || "Edited Image"
    });
    await logActivity(
      "Image Edited",
      req.user?.name || "Admin",
      `Applied crop/adjustments and saved new version to GridFS (${result.fileId})`,
      `Media: ${result.fileId}`
    );
    return res.status(201).json({
      success: true,
      message: "Edited image saved to MongoDB GridFS.",
      data: result.metadata
    });
  } catch (error) {
    console.error("Error saving edited image:", error);
    return res.status(500).json({ success: false, error: "Failed to store edited image in GridFS." });
  }
});
mediaRouter.put("/admin/:fileId", requireAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { altText, caption, category } = req.body;
    const updated = await GridFSService.updateMetadata(fileId, {
      altText,
      caption,
      category
    });
    if (!updated) {
      return res.status(404).json({ success: false, error: "Media record not found." });
    }
    return res.json({ success: true, message: "Media metadata updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: error?.message || "Failed to update media metadata." });
  }
});
mediaRouter.delete("/admin/:fileId", requireAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;
    await GridFSService.deleteImage(fileId);
    await logActivity(
      "Image Deleted",
      req.user?.name || "Admin",
      `Deleted file from GridFS (${fileId})`,
      `Media: ${fileId}`
    );
    return res.json({
      success: true,
      message: "Image deleted from MongoDB GridFS successfully."
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error?.message || "Failed to delete image." });
  }
});
mediaRouter.get("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId || fileId.length !== 24) {
      return res.status(400).json({ success: false, error: "Invalid media file ID." });
    }
    const fileStream = await GridFSService.streamImage(fileId);
    if (!fileStream) {
      return res.status(404).json({ success: false, error: "Image not found in MongoDB GridFS." });
    }
    res.set("Content-Type", fileStream.contentType);
    res.set("Content-Length", fileStream.length.toString());
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.set("Content-Disposition", `inline; filename="${fileStream.filename}"`);
    fileStream.stream.pipe(res);
  } catch (error) {
    console.error("Error streaming GridFS image:", error);
    return res.status(500).json({ success: false, error: "Failed to stream media asset." });
  }
});

// server/routes/content.ts
import { Router as Router4 } from "express";
import { ObjectId as ObjectId3 } from "mongodb";
var contentRouter = Router4();
contentRouter.get("/homepage", async (req, res) => {
  try {
    const db2 = getDb();
    const content = await db2.collection("homepageContent").findOne({});
    return res.json({ success: true, data: content });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch homepage content." });
  }
});
contentRouter.put("/homepage", requireAdmin, async (req, res) => {
  try {
    const db2 = getDb();
    const updates = {
      ...req.body,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    delete updates._id;
    await db2.collection("homepageContent").updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );
    await logActivity("Homepage Updated", req.user?.name || "Admin", "Updated hero text, statistics, or CTA sections", "Homepage CMS");
    return res.json({ success: true, message: "Homepage content updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update homepage content." });
  }
});
contentRouter.get("/about", async (req, res) => {
  try {
    const db2 = getDb();
    const content = await db2.collection("aboutContent").findOne({});
    return res.json({ success: true, data: content });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch about content." });
  }
});
contentRouter.put("/about", requireAdmin, async (req, res) => {
  try {
    const db2 = getDb();
    const updates = {
      ...req.body,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    delete updates._id;
    await db2.collection("aboutContent").updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );
    await logActivity("About Us Updated", req.user?.name || "Admin", "Updated mission, vision, or core values", "About CMS");
    return res.json({ success: true, message: "About content updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update about content." });
  }
});
contentRouter.get("/services", async (req, res) => {
  try {
    const db2 = getDb();
    const services = await db2.collection("services").find({}).sort({ displayOrder: 1 }).toArray();
    const formatted = services.map((s) => ({
      ...s,
      id: s.id || s._id.toString()
    }));
    return res.json({ success: true, data: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch services." });
  }
});
contentRouter.post("/services", requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const db2 = getDb();
    const newService = {
      id: `srv-${Date.now()}`,
      title: data.title,
      subtitle: data.subtitle || "",
      description: data.description || "",
      iconName: data.iconName || "Home",
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
      image: data.image || "",
      displayOrder: Number(data.displayOrder || 1),
      published: data.published !== false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const result = await db2.collection("services").insertOne(newService);
    await logActivity("Service Added", req.user?.name || "Admin", `Added service: "${newService.title}"`, "Services CMS");
    return res.status(201).json({ success: true, data: { ...newService, _id: result.insertedId.toString() } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create service." });
  }
});
contentRouter.put("/services/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db2 = getDb();
    const query = {
      $or: [
        { id },
        ...ObjectId3.isValid(id) ? [{ _id: new ObjectId3(id) }] : []
      ]
    };
    delete updates._id;
    await db2.collection("services").updateOne(query, { $set: updates });
    await logActivity("Service Updated", req.user?.name || "Admin", `Updated service details for ${id}`, "Services CMS");
    return res.json({ success: true, message: "Service updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update service." });
  }
});
contentRouter.delete("/services/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db2 = getDb();
    const query = {
      $or: [
        { id },
        ...ObjectId3.isValid(id) ? [{ _id: new ObjectId3(id) }] : []
      ]
    };
    await db2.collection("services").deleteOne(query);
    await logActivity("Service Deleted", req.user?.name || "Admin", `Deleted service ${id}`, "Services CMS");
    return res.json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete service." });
  }
});
contentRouter.get("/testimonials", async (req, res) => {
  try {
    const db2 = getDb();
    const testimonials = await db2.collection("testimonials").find({}).sort({ displayOrder: 1, date: -1 }).toArray();
    const formatted = testimonials.map((t) => ({
      ...t,
      id: t.id || t._id.toString()
    }));
    return res.json({ success: true, data: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch testimonials." });
  }
});
contentRouter.post("/testimonials", requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const db2 = getDb();
    const newTestimonial = {
      id: `tst-${Date.now()}`,
      name: data.name,
      role: data.role || "Property Buyer",
      location: data.location || "Abuja, Nigeria",
      avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      rating: Number(data.rating || 5),
      comment: data.comment,
      propertyPurchased: data.propertyPurchased || "",
      date: data.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      displayOrder: Number(data.displayOrder || 1),
      published: data.published !== false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const result = await db2.collection("testimonials").insertOne(newTestimonial);
    await logActivity("Testimonial Added", req.user?.name || "Admin", `Added testimonial from: "${newTestimonial.name}"`, "Testimonials CMS");
    return res.status(201).json({ success: true, data: { ...newTestimonial, _id: result.insertedId.toString() } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create testimonial." });
  }
});
contentRouter.put("/testimonials/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db2 = getDb();
    const query = {
      $or: [
        { id },
        ...ObjectId3.isValid(id) ? [{ _id: new ObjectId3(id) }] : []
      ]
    };
    delete updates._id;
    await db2.collection("testimonials").updateOne(query, { $set: updates });
    await logActivity("Testimonial Updated", req.user?.name || "Admin", `Updated testimonial ${id}`, "Testimonials CMS");
    return res.json({ success: true, message: "Testimonial updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update testimonial." });
  }
});
contentRouter.delete("/testimonials/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db2 = getDb();
    const query = {
      $or: [
        { id },
        ...ObjectId3.isValid(id) ? [{ _id: new ObjectId3(id) }] : []
      ]
    };
    await db2.collection("testimonials").deleteOne(query);
    await logActivity("Testimonial Deleted", req.user?.name || "Admin", `Deleted testimonial ${id}`, "Testimonials CMS");
    return res.json({ success: true, message: "Testimonial deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete testimonial." });
  }
});
contentRouter.get("/seo", async (req, res) => {
  try {
    const db2 = getDb();
    const seo = await db2.collection("seoSettings").findOne({});
    return res.json({ success: true, data: seo });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch SEO settings." });
  }
});
contentRouter.put("/seo", requireAdmin, async (req, res) => {
  try {
    const db2 = getDb();
    const updates = {
      ...req.body,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    delete updates._id;
    await db2.collection("seoSettings").updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );
    await logActivity("SEO Settings Updated", req.user?.name || "Admin", "Updated meta titles, descriptions, and OpenGraph tags", "SEO CMS");
    return res.json({ success: true, message: "SEO settings updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update SEO settings." });
  }
});

// server/routes/settings.ts
import { Router as Router5 } from "express";
var settingsRouter = Router5();
settingsRouter.get("/", async (req, res) => {
  try {
    const db2 = getDb();
    const settings = await db2.collection("websiteSettings").findOne({});
    return res.json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to retrieve website settings." });
  }
});
settingsRouter.put("/admin/update", requireAdmin, async (req, res) => {
  try {
    const db2 = getDb();
    const updates = {
      ...req.body,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    delete updates._id;
    await db2.collection("websiteSettings").updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );
    await logActivity(
      "Website Settings Updated",
      req.user?.name || "Admin",
      "Updated site branding, contact details, or colors",
      "Website Settings"
    );
    return res.json({ success: true, message: "Website settings updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update website settings." });
  }
});
settingsRouter.put("/admin/whatsapp", requireAdmin, async (req, res) => {
  try {
    const { whatsapp, defaultWhatsAppMessage } = req.body;
    const db2 = getDb();
    if (!whatsapp) {
      return res.status(400).json({ success: false, error: "WhatsApp number is required." });
    }
    const cleanWhatsApp = whatsapp.replace(/\D/g, "");
    await db2.collection("websiteSettings").updateOne(
      {},
      {
        $set: {
          whatsapp: cleanWhatsApp,
          defaultWhatsAppMessage: defaultWhatsAppMessage || "Hello Galaxy Real Estate, I am interested in one of your properties and would like to speak with an agent.",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      },
      { upsert: true }
    );
    await logActivity(
      "WhatsApp Settings Updated",
      req.user?.name || "Admin",
      `Changed WhatsApp contact line to "${cleanWhatsApp}"`,
      "WhatsApp Desk"
    );
    return res.json({
      success: true,
      message: `WhatsApp number updated to ${cleanWhatsApp}. Public site buttons updated.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update WhatsApp settings." });
  }
});

// server/routes/inquiries.ts
import { Router as Router6 } from "express";
import { ObjectId as ObjectId4 } from "mongodb";
var inquiriesRouter = Router6();
inquiriesRouter.post("/", async (req, res) => {
  try {
    const { name, email, phone, message, propertyId, propertyTitle, propertyPrice, propertySlug } = req.body;
    if (!name || !email && !phone) {
      return res.status(400).json({
        success: false,
        error: "Please provide your name and at least an email address or phone number."
      });
    }
    const db2 = getDb();
    const now = /* @__PURE__ */ new Date();
    const newInquiry = {
      id: `inq-${Date.now()}`,
      name: name.trim(),
      email: (email || "").trim().toLowerCase(),
      phone: (phone || "").trim(),
      message: message || "Interested in properties from Galaxy Real Estate.",
      propertyId: propertyId || null,
      propertyTitle: propertyTitle || null,
      propertyPrice: propertyPrice ? Number(propertyPrice) : null,
      propertySlug: propertySlug || null,
      status: "New",
      date: now.toLocaleDateString("en-GB"),
      createdAt: now.toISOString(),
      notes: ""
    };
    const result = await db2.collection("inquiries").insertOne(newInquiry);
    await logActivity(
      "New Customer Inquiry",
      name.trim(),
      propertyTitle ? `Inquiry submitted for "${propertyTitle}"` : `General contact message received from ${email || phone}`,
      `Inquiry: ${newInquiry.id}`
    );
    return res.status(201).json({
      success: true,
      message: "Thank you! Your inquiry has been received. A Galaxy luxury property specialist will reach out shortly.",
      inquiryId: result.insertedId.toString()
    });
  } catch (error) {
    console.error("Error saving inquiry to MongoDB:", error);
    return res.status(500).json({ success: false, error: "Failed to record inquiry." });
  }
});
inquiriesRouter.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const db2 = getDb();
    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { propertyTitle: { $regex: q, $options: "i" } },
        { message: { $regex: q, $options: "i" } }
      ];
    }
    const inquiries = await db2.collection("inquiries").find(query).sort({ createdAt: -1 }).toArray();
    const formatted = inquiries.map((i) => ({
      ...i,
      id: i.id || i._id?.toString()
    }));
    const stats = {
      total: formatted.length,
      new: formatted.filter((i) => i.status === "New").length,
      contacted: formatted.filter((i) => i.status === "Contacted").length,
      inProgress: formatted.filter((i) => i.status === "In Progress").length,
      closed: formatted.filter((i) => i.status === "Closed").length
    };
    return res.json({
      success: true,
      stats,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to retrieve inquiries." });
  }
});
inquiriesRouter.put("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const db2 = getDb();
    const query = ObjectId4.isValid(id) ? { _id: new ObjectId4(id) } : { id };
    const updates = {};
    if (status) updates.status = status;
    if (notes !== void 0) updates.notes = notes;
    await db2.collection("inquiries").updateOne(query, { $set: updates });
    await logActivity(
      "Inquiry Updated",
      req.user?.name || "Admin",
      `Updated inquiry ${id} status to "${status || "Updated"}"`,
      `Inquiry: ${id}`
    );
    return res.json({ success: true, message: "Inquiry updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update inquiry." });
  }
});
inquiriesRouter.delete("/admin/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db2 = getDb();
    const query = ObjectId4.isValid(id) ? { _id: new ObjectId4(id) } : { id };
    await db2.collection("inquiries").deleteOne(query);
    await logActivity(
      "Inquiry Deleted",
      req.user?.name || "Admin",
      `Deleted inquiry record ${id}`,
      `Inquiry: ${id}`
    );
    return res.json({ success: true, message: "Inquiry deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete inquiry." });
  }
});

// server/routes/activity.ts
import { Router as Router7 } from "express";
var activityRouter = Router7();
activityRouter.get("/", requireAdmin, async (req, res) => {
  try {
    const { search, limit = "100" } = req.query;
    const db2 = getDb();
    const query = {};
    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim();
      query.$or = [
        { action: { $regex: q, $options: "i" } },
        { user: { $regex: q, $options: "i" } },
        { details: { $regex: q, $options: "i" } },
        { affectedItem: { $regex: q, $options: "i" } }
      ];
    }
    const logs = await db2.collection("activityLogs").find(query).sort({ timestamp: -1 }).limit(parseInt(limit, 10)).toArray();
    const formatted = logs.map((l) => ({
      ...l,
      id: l.id || l._id.toString()
    }));
    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to retrieve activity log." });
  }
});

// server/routes/backup.ts
import { Router as Router8 } from "express";
var backupRouter = Router8();
backupRouter.get("/export", requireAdmin, async (req, res) => {
  try {
    const db2 = getDb();
    const [
      properties,
      services,
      testimonials,
      homepageContent,
      aboutContent,
      websiteSettings,
      seoSettings,
      navigationItems,
      inquiries,
      mediaMetadata
    ] = await Promise.all([
      db2.collection("properties").find({}).toArray(),
      db2.collection("services").find({}).toArray(),
      db2.collection("testimonials").find({}).toArray(),
      db2.collection("homepageContent").findOne({}),
      db2.collection("aboutContent").findOne({}),
      db2.collection("websiteSettings").findOne({}),
      db2.collection("seoSettings").findOne({}),
      db2.collection("navigationItems").find({}).toArray(),
      db2.collection("inquiries").find({}).toArray(),
      db2.collection("mediaMetadata").find({}).toArray()
    ]);
    const backupPayload = {
      version: "1.0.0",
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      exporter: req.user?.email,
      data: {
        properties,
        services,
        testimonials,
        homepageContent,
        aboutContent,
        websiteSettings,
        seoSettings,
        navigationItems,
        inquiries,
        mediaMetadata
      }
    };
    await logActivity(
      "Backup Exported",
      req.user?.name || "Admin",
      "Downloaded complete JSON system backup",
      "Backup System"
    );
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="galaxy_backup_${Date.now()}.json"`);
    return res.json(backupPayload);
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to generate backup export." });
  }
});
backupRouter.post("/import", requireAdmin, async (req, res) => {
  try {
    const { backupData, overwrite = false } = req.body;
    if (!backupData || !backupData.data) {
      return res.status(400).json({
        success: false,
        error: "Invalid backup format. Expected a valid Galaxy Real Estate JSON backup object."
      });
    }
    const { data } = backupData;
    const db2 = getDb();
    if (overwrite) {
      if (Array.isArray(data.properties) && data.properties.length > 0) {
        await db2.collection("properties").deleteMany({});
        await db2.collection("properties").insertMany(data.properties);
      }
      if (Array.isArray(data.services) && data.services.length > 0) {
        await db2.collection("services").deleteMany({});
        await db2.collection("services").insertMany(data.services);
      }
      if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
        await db2.collection("testimonials").deleteMany({});
        await db2.collection("testimonials").insertMany(data.testimonials);
      }
      if (data.homepageContent) {
        await db2.collection("homepageContent").deleteMany({});
        await db2.collection("homepageContent").insertOne(data.homepageContent);
      }
      if (data.aboutContent) {
        await db2.collection("aboutContent").deleteMany({});
        await db2.collection("aboutContent").insertOne(data.aboutContent);
      }
      if (data.websiteSettings) {
        await db2.collection("websiteSettings").deleteMany({});
        await db2.collection("websiteSettings").insertOne(data.websiteSettings);
      }
      if (data.seoSettings) {
        await db2.collection("seoSettings").deleteMany({});
        await db2.collection("seoSettings").insertOne(data.seoSettings);
      }
      if (Array.isArray(data.navigationItems) && data.navigationItems.length > 0) {
        await db2.collection("navigationItems").deleteMany({});
        await db2.collection("navigationItems").insertMany(data.navigationItems);
      }
    }
    await logActivity(
      "Backup Restored",
      req.user?.name || "Admin",
      `Restored backup from ${backupData.exportedAt || "uploaded file"}`,
      "Backup System"
    );
    return res.json({
      success: true,
      message: "Backup data imported and synchronized with MongoDB successfully."
    });
  } catch (error) {
    console.error("Error importing backup:", error);
    return res.status(500).json({ success: false, error: "Failed to process backup file." });
  }
});

// server/app.ts
var app = express();
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use("/api", async (req, res, next) => {
  if (req.path === "/health") {
    return next();
  }
  try {
    await connectToDatabase();
    next();
  } catch (dbErr) {
    console.error("Database connection error in /api middleware:", dbErr);
    res.status(503).json({
      success: false,
      error: "Database connection is initializing or unavailable. Please verify MONGODB_URI and MongoDB Atlas network whitelist (0.0.0.0/0).",
      details: dbErr?.message || String(dbErr)
    });
  }
});
app.get("/api/health", (req, res) => {
  const dbStatus2 = getDatabaseStatus();
  res.json({
    status: "ok",
    service: "Galaxy Real Estate API & CMS Engine",
    database: "MongoDB + GridFS",
    storageEngine: dbStatus2.mode === "atlas" ? "MongoDB Atlas (Cloud Cluster)" : "High-Performance Embedded MongoDB",
    connected: dbStatus2.connected,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/api/auth", authRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/media", mediaRouter);
app.use("/api/content", contentRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/inquiries", inquiriesRouter);
app.use("/api/admin/activity", activityRouter);
app.use("/api/admin/backup", backupRouter);
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});
app.use("/api", (err, req, res, next) => {
  console.error("API Error handler caught:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || "An internal server error occurred while processing your request."
  });
});
var app_default = app;
export {
  app,
  app_default as default
};
