import "dotenv/config";
import { db } from "../lib/db";
import {
  blogPosts,
  faqs,
  mountainInfo,
  trailInfo,
  trailWaypoints,
  weatherInfo,
} from "../lib/schema";

async function main() {
  console.log("🌱 Clearing existing seedable tables...");
  await db.delete(trailWaypoints);
  await db.delete(trailInfo);
  await db.delete(weatherInfo);
  await db.delete(faqs);
  await db.delete(mountainInfo);
  await db.delete(blogPosts);

  console.log("🏔  Inserting mountain info...");
  const [mountain] = await db
    .insert(mountainInfo)
    .values({
      name: "Narangala",
      tamilName: "தங்கமலை",
      sinhalaName: "නාරංගල",
      nickname: "Golden Mountain",
      elevationMeters: "1527.00",
      coordinatesLat: "6.9965000",
      coordinatesLon: "81.0640000",
      district: "Badulla",
      province: "Uva Province",
      nearbyTowns: "Ella, Badulla, Hali Ella, Keenakele",
      shortDescription:
        "Narangala is a prominent peak in Sri Lanka's Uva Province, offering 360-degree panoramic views of the surrounding valleys and reservoirs.",
      fullDescription: `Narangala Mountain is a hidden gem in the Badulla District, standing at 1,527 meters above sea level. Known locally as Thanga-malai (Golden Mountain), it features a distinctive rectangular plateau and triangular peak. The mountain is steeped in legend, with stories suggesting King Walagamba hid nine pots of gold in a cave here. The hike offers breathtaking views of the Mahaweli flood plains, Namunukula range, and Randenigala reservoir.

The mountain's unique golden-hued grasslands, especially during the dry season, give it its nickname. The trail takes you through beautiful tea estates, turpentine groves, and steep grasslands before reaching the summit. On clear days, you can see as far as Trincomalee on the east coast.

The climb is manageable for most fitness levels, making it a popular destination for both experienced hikers and beginners. The summit provides a perfect spot for camping, with stunning sunrise and sunset views.`,
      keyFeatures:
        "Rectangular-shaped plateau, Triangular-pointed peak, Golden-hued grasslands, 360-degree panoramic views, Ancient cave with legends",
      legendStory: `Legend of King Walagamba's Gold:

According to local folklore, King Walagamba hid nine pots of gold in a cave on this mountain during his exile. This gave rise to the name 'NawaRanKala' (Nine Gold Pots), which over time evolved into 'Narangala'.`,
      historicalSignificance:
        "The mountain served as a strategic fortress for King Walagamba during his 14-year exile in the 1st century BCE.",
      religiousSignificance:
        "Narangala holds significance for Buddhist, Hindu, and indigenous traditions.",
      metaTitle:
        "Narangala Mountain - Complete Guide to Hiking the Golden Mountain",
      metaDescription:
        "Discover Narangala Mountain in Badulla, Sri Lanka. Complete hiking guide, trail maps, weather updates, local services, and legends of the Golden Mountain.",
      metaKeywords:
        "Narangala, Narangala Mountain, Badulla hiking, Uva Province, Sri Lanka hiking, Golden Mountain, Thanga-malai",
    })
    .returning();

  console.log("🥾 Inserting trail info...");
  const [trail] = await db
    .insert(trailInfo)
    .values({
      name: "Main Trail to Narangala Summit",
      trailheadLocation: "Keenakele Village / Thangamalai Estate",
      trailheadAltitude: "850.00",
      distanceKm: "3.00",
      ascentMeters: "677.00",
      descentMeters: "677.00",
      avgAscentTimeHours: "1.5",
      avgDescentTimeHours: "1.0",
      fullRoundTripHours: "2.5",
      difficulty: "moderate",
      difficultyRating: 5,
      trailType: "Out & Back",
      surfaceType:
        "Tea estate paths, turpentine groves, steep grasslands, rocky sections near summit",
      bestMonthsStart: 12,
      bestMonthsEnd: 3,
      bestTimeOfDay: "Early morning (5:00 AM - 7:00 AM) for sunrise views",
      requiresGuide: false,
      requiresPermit: false,
      permitInfo:
        "No permit required for hiking. However, if camping overnight, please inform local authorities.",
      safetyTips: `• Start early to avoid afternoon heat and afternoon rains
• Carry at least 2-3 liters of water per person
• Wear proper hiking shoes with good grip
• Download offline maps before starting (mobile coverage is limited)
• Inform someone about your hiking plans
• Carry a basic first aid kit
• Avoid hiking during heavy rain or thunderstorms
• Stay on marked trails to avoid getting lost
• Carry snacks and energy bars
• Bring a rain jacket (weather changes quickly)`,
      emergencyNotes: `Emergency Contacts:
• Badulla General Hospital: +94 55 222 2261
• Police Emergency: 119
• Ambulance: 110
• Hali Ella Police Station: +94 55 222 5222

What to do in emergency:
1. Stay calm and assess the situation
2. If possible, move to an area with mobile coverage
3. Call emergency services with your exact location
4. If you have GPS coordinates, provide them
5. Do not attempt dangerous rescues yourself`,
      waterAvailability:
        "No water sources available on the trail. Bring all water you need.",
      mobileCoverage:
        "Coverage is limited and spotty. Dialog and Mobitel have the best coverage.",
    })
    .returning();

  console.log("📍 Inserting waypoints...");
  const waypoints = [
    {
      name: "Trailhead - Keenakele Village",
      waypointType: "start",
      description:
        "Starting point of the hike. Parking available. Local shops for water and snacks.",
      latitude: "6.9833000",
      longitude: "81.0500000",
      altitudeMeters: "850.00",
      distanceFromStartKm: "0.00",
      estimatedTimeFromStartMinutes: 0,
      order: 0,
    },
    {
      name: "Thangamalai Tea Estate",
      waypointType: "checkpoint",
      description:
        "Beautiful tea estate section. The path winds through working tea plantations.",
      latitude: "6.9855000",
      longitude: "81.0523000",
      altitudeMeters: "910.00",
      distanceFromStartKm: "0.40",
      estimatedTimeFromStartMinutes: 10,
      order: 1,
    },
    {
      name: "First Viewpoint",
      waypointType: "viewpoint",
      description:
        "First clear view of the valley below. Good spot for rest and photos.",
      latitude: "6.9872000",
      longitude: "81.0545000",
      altitudeMeters: "990.00",
      distanceFromStartKm: "0.80",
      estimatedTimeFromStartMinutes: 20,
      order: 2,
    },
    {
      name: "Turpentine Forest Section",
      waypointType: "checkpoint",
      description:
        "Entering the turpentine forest. Shaded section, cooler temperatures.",
      latitude: "6.9898000",
      longitude: "81.0572000",
      altitudeMeters: "1080.00",
      distanceFromStartKm: "1.30",
      estimatedTimeFromStartMinutes: 35,
      order: 3,
    },
    {
      name: "Mid-Trail Rest Point",
      waypointType: "rest_area",
      description:
        "Flat area suitable for rest. Some natural rock seating. Halfway point.",
      latitude: "6.9915000",
      longitude: "81.0588000",
      altitudeMeters: "1180.00",
      distanceFromStartKm: "1.80",
      estimatedTimeFromStartMinutes: 50,
      order: 4,
    },
    {
      name: "The Legendary Gold Cave",
      waypointType: "cave",
      description:
        "Historical cave where King Walagamba is said to have hidden nine pots of gold.",
      latitude: "6.9928000",
      longitude: "81.0602000",
      altitudeMeters: "1310.00",
      distanceFromStartKm: "2.20",
      estimatedTimeFromStartMinutes: 65,
      order: 5,
    },
    {
      name: "Grassland Ridge",
      waypointType: "viewpoint",
      description:
        "Exit forest into golden grasslands. Stunning 180-degree views. Windy section.",
      latitude: "6.9945000",
      longitude: "81.0620000",
      altitudeMeters: "1420.00",
      distanceFromStartKm: "2.60",
      estimatedTimeFromStartMinutes: 80,
      order: 6,
    },
    {
      name: "Final Ascent",
      waypointType: "checkpoint",
      description:
        "Steepest section of the trail. Short but challenging. Take it slow.",
      latitude: "6.9958000",
      longitude: "81.0632000",
      altitudeMeters: "1490.00",
      distanceFromStartKm: "2.85",
      estimatedTimeFromStartMinutes: 87,
      order: 7,
    },
    {
      name: "Narangala Summit Peak",
      waypointType: "summit",
      description:
        "Highest point of Narangala Mountain. 360-degree panoramic views of Mahaweli flood plains, Namunukula range, and Randenigala reservoir.",
      latitude: "6.9965000",
      longitude: "81.0640000",
      altitudeMeters: "1527.00",
      distanceFromStartKm: "3.00",
      estimatedTimeFromStartMinutes: 95,
      order: 8,
    },
    {
      name: "End Point - Return Trail",
      waypointType: "end",
      description:
        "Return to trailhead. Descent takes approximately 1 hour from summit.",
      latitude: "6.9833000",
      longitude: "81.0500000",
      altitudeMeters: "850.00",
      distanceFromStartKm: "6.00",
      estimatedTimeFromStartMinutes: 155,
      order: 9,
    },
  ].map((wp) => ({ ...wp, trailId: trail.id }));

  await db.insert(trailWaypoints).values(waypoints);

  console.log("❓ Inserting FAQs...");
  await db.insert(faqs).values([
    {
      question: "How long does it take to hike Narangala?",
      answer:
        "The ascent takes about 1.5-2 hours depending on your fitness level. The descent takes about 1 hour. With breaks for photos and rest, plan for 3-4 hours total.",
      category: "hiking",
      order: 1,
    },
    {
      question: "Do I need a guide to hike Narangala?",
      answer:
        "No, the trail is well-marked and relatively easy to follow. However, hiring a local guide supports the community and provides richer cultural context.",
      category: "hiking",
      order: 2,
    },
    {
      question: "What is the best time to visit Narangala?",
      answer:
        "Early morning (5:00 AM - 7:00 AM) is best for sunrise views. The dry season from December to March offers the clearest views.",
      category: "general",
      order: 3,
    },
    {
      question: "Is there an entry fee?",
      answer:
        "No, there is no official entry fee for Narangala Mountain. It's open to all visitors free of charge.",
      category: "permits",
      order: 4,
    },
    {
      question: "How do I get to Narangala from Ella?",
      answer:
        "From Ella: Take a bus or tuk-tuk to Badulla (30-40 mins), then transfer to a bus heading to Keenakele village (20 mins). Total: 60-90 minutes. Direct tuk-tuk from Ella: LKR 2000-3000.",
      category: "transport",
      order: 5,
    },
    {
      question: "Is there mobile phone coverage on the trail?",
      answer:
        "Coverage is limited and spotty. Dialog and Mobitel work in some sections. Download offline maps before starting.",
      category: "safety",
      order: 6,
    },
    {
      question: "What should I pack for the hike?",
      answer:
        "Essentials: 2-3 liters of water, snacks, proper hiking shoes, rain jacket, sunscreen, hat, basic first aid kit, power bank, flashlight, camera, insect repellent.",
      category: "hiking",
      order: 7,
    },
    {
      question: "Can I camp on Narangala Mountain?",
      answer:
        "Yes, camping is allowed at the summit. Bring your own tent and sleeping bag. No facilities — practice Leave No Trace principles.",
      category: "accommodation",
      order: 8,
    },
    {
      question: "Are there restrooms or shops on the trail?",
      answer:
        "No restrooms on the trail. Small shops at the trailhead. Carry everything you need.",
      category: "food",
      order: 9,
    },
    {
      question: "Is the trail suitable for beginners?",
      answer:
        "Yes, suitable for beginners with moderate fitness. The path is clear but steep in sections. Take breaks as needed.",
      category: "hiking",
      order: 10,
    },
    {
      question: "What wildlife might I see?",
      answer:
        "Monkeys, various bird species (including endemic Sri Lankan birds), butterflies, and occasionally monitor lizards.",
      category: "general",
      order: 11,
    },
    {
      question: "Are there any dangerous animals?",
      answer:
        "No dangerous predators. You might see snakes (rare, usually non-venomous) or wild boar (keep distance).",
      category: "safety",
      order: 12,
    },
  ]);

  console.log("📝 Inserting blog posts...");
  await db.insert(blogPosts).values([
    {
      title: "Complete Guide to Hiking Narangala Mountain",
      slug: "complete-guide-narangala-hike",
      excerpt:
        "Everything you need to know about hiking Narangala — from getting there to what to pack, where to stay, and safety tips for a memorable adventure.",
      content: `# Complete Guide to Hiking Narangala Mountain

## Overview
Narangala Mountain, also known as the Golden Mountain, is one of Sri Lanka's most rewarding yet underrated hikes. Standing at 1,527 meters, it offers spectacular 360-degree views without the crowds of more famous destinations.

## Getting There

### From Ella (Recommended)
1. **Bus Route:** Ella to Badulla (30-40 mins), then to Keenakele (20 mins)
2. **Tuk-Tuk Direct:** LKR 2000-3000
3. **Private Vehicle:** Park at Keenakele village

## Best Time to Visit

- **December - March (DRY):** Best visibility, ideal for photography
- **April - May:** Possible afternoon showers, still good hiking
- **June - September:** Good conditions, cooler temperatures
- **October - November (MONSOON):** Heavy rains, not recommended

## What to Pack

- 2-3 liters of water
- Energy snacks
- Proper hiking shoes
- Rain jacket
- Sunscreen and hat
- First aid kit
- Power bank
- Flashlight/headlamp

## Trail Description

The trail is 3km one-way with 677m elevation gain. It passes through tea estates, turpentine forest, the legendary Gold Cave, and golden grasslands before reaching the summit.

## Safety Tips

1. Check weather forecast
2. Inform someone of your plans
3. Download offline maps
4. Stay on marked trails
5. Watch your step on steep sections

Emergency numbers: Police 119, Ambulance 110.`,
      author: "Narangala Admin",
      categories: "Hiking Guide, Beginner Tips, Complete Guide",
      tags: "narangala, hiking, sri lanka, badulla, travel guide",
    },
    {
      title: "The Legend of King Walagamba's Hidden Gold",
      slug: "legend-king-walagamba-hidden-gold",
      excerpt:
        "Discover the fascinating legend behind Narangala's name and the mysterious gold cave that has intrigued treasure hunters for centuries.",
      content: `# The Legend of King Walagamba's Hidden Gold

## The Tale of Nine Gold Pots

Deep within the slopes of Narangala Mountain lies a cave that has captured the imagination of locals and visitors for over 2000 years.

## Who Was King Walagamba?

King Walagamba (Vattagamini Abhaya) ruled the Anuradhapura Kingdom during the 1st century BCE. His reign was marked by a famous 14-year exile that would forever link him to Narangala Mountain.

## The Gold Legend

> "Before fleeing his palace, King Walagamba gathered nine large pots and filled them with gold coins, jewels, and royal artifacts. He secretly transported them to Narangala Mountain and hid them deep within a cave."

The name breaks down as:
- **Nawa** = nine
- **Ran** = gold  
- **Kala** = pot

Combined: Nawa-Ran-Kala → Narangala

## Has Anyone Found the Treasure?

Many have searched — Portuguese expeditions, British colonial officers, and modern treasure hunters. No gold has ever been recovered.

## The Cave Today

Located approximately 2.2 km from the trailhead at 1,310m elevation. Small entrance, dry interior. You'll find local offerings (flowers, incense) but no treasure.

## The Legend Continues

Every year, thousands of hikers visit Narangala, each hearing the legend. Perhaps the real gold is the mountain itself — its golden grasslands, priceless views, and rich cultural heritage.`,
      author: "Narangala Historian",
      categories: "History, Legend, Culture",
      tags: "history, legend, king walagamba, gold, treasure, folklore",
    },
    {
      title: "Sunrise at Narangala: A Photographer's Paradise",
      slug: "sunrise-narangala-photographers-paradise",
      excerpt:
        "Capture the magic of golden hour at Narangala's summit. Photography tips, best spots, and camera settings for stunning mountain photos.",
      content: `# Sunrise at Narangala: A Photographer's Paradise

## Why Narangala for Photography?

Narangala offers photographers something rare: unobstructed 360-degree views combined with the famous golden grasslands that glow in early morning light.

## Best Photography Spots

### 1. Grassland Ridge (2.6km mark)
Best for golden grass foreground shots, valley views, hiker portraits. Time: 6:00-7:30 AM.

### 2. The Summit Peak
Best for 360-degree panoramas, sunrise, cloud inversions. Time: 5:45-7:00 AM.

### 3. Turpentine Forest
Best for moody forest shots, misty mornings. Time: 7:00-9:00 AM.

## Camera Settings for Sunrise

- Aperture: f/8 to f/11
- ISO: 100-400
- Shutter: bracket exposures
- Focus: manual, at hyperfocal distance
- Use a tripod

## Best Times for Photos

- **Blue Hour (5:15-5:45 AM):** Moody shots, silhouettes
- **Golden Hour (5:45-6:30 AM):** Dramatic skies, long shadows
- **Morning Light (6:30-9:00 AM):** Landscape details

## Composition Techniques

- Rule of thirds
- Leading lines (trail, grass patterns)
- Framing (foreground grass, rocks)
- Foreground interest (hikers for scale)

## Common Mistakes

- Arriving after sunrise
- Forgetting extra batteries
- Not checking weather
- Shooting only at summit`,
      author: "Travel Photographer",
      categories: "Photography, Sunrise, Tips",
      tags: "photography, sunrise, camera tips, instagram, drone",
    },
  ]);

  console.log("🌤  Inserting sample weather (today)...");
  const today = new Date().toISOString().slice(0, 10);
  await db.insert(weatherInfo).values({
    date: today,
    condition: "partly_cloudy",
    temperatureCelsius: "22.5",
    feelsLikeCelsius: "23.0",
    humidityPercent: 75,
    windSpeedKmh: 12,
    precipitationMm: "0.0",
    sunriseTime: "06:05",
    sunsetTime: "18:15",
    isHikingRecommended: true,
    recommendationText:
      "Clear morning expected. Great conditions for sunrise at the summit.",
    updatedBy: "seed",
  });

  console.log("✅ Full seed complete");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});