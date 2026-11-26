export type LatLng = [number, number];

export type ParkingLot = {
  id: string;
  shortCode: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  available: number;
  total: number;
  walkMinutes: number;
  spotPrefix: string;
};

export type CampusLandmark = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
};

export const PARKING_LOTS: ParkingLot[] = [
  {
    id: "north-gate",
    shortCode: "N1",
    name: "North Gate Deck",
    area: "North entrance",
    latitude: 31.25915,
    longitude: 75.70665,
    available: 32,
    total: 54,
    walkMinutes: 2,
    spotPrefix: "N",
  },
  {
    id: "academic-core",
    shortCode: "A2",
    name: "Academic Core",
    area: "Blocks 25–34",
    latitude: 31.25605,
    longitude: 75.7037,
    available: 24,
    total: 42,
    walkMinutes: 3,
    spotPrefix: "A",
  },
  {
    id: "uni-mall",
    shortCode: "U3",
    name: "Uni Mall Parking",
    area: "Student centre",
    latitude: 31.25275,
    longitude: 75.70385,
    available: 37,
    total: 60,
    walkMinutes: 2,
    spotPrefix: "U",
  },
  {
    id: "sports-complex",
    shortCode: "S4",
    name: "Sports Complex",
    area: "Sports village",
    latitude: 31.2485,
    longitude: 75.70515,
    available: 19,
    total: 44,
    walkMinutes: 5,
    spotPrefix: "S",
  },
  {
    id: "south-gate",
    shortCode: "G5",
    name: "South Gate Lot",
    area: "South entrance",
    latitude: 31.247,
    longitude: 75.70265,
    available: 28,
    total: 48,
    walkMinutes: 4,
    spotPrefix: "G",
  },
  {
    id: "residence-hub",
    shortCode: "R6",
    name: "Residence Hub",
    area: "Hostel district",
    latitude: 31.25765,
    longitude: 75.7081,
    available: 16,
    total: 36,
    walkMinutes: 4,
    spotPrefix: "R",
  },
];

export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  { id: "main-gate", name: "Main Gate", type: "Entrance", latitude: 31.2509, longitude: 75.6994 },
  { id: "student-square", name: "Student Square", type: "Campus life", latitude: 31.2535, longitude: 75.70215 },
  { id: "central-library", name: "Central Library", type: "Library", latitude: 31.2549, longitude: 75.70435 },
  { id: "block-34", name: "Block 34", type: "Academic block", latitude: 31.2568, longitude: 75.70475 },
  { id: "sports-ground", name: "Sports Ground", type: "Sports", latitude: 31.24945, longitude: 75.7038 },
  { id: "hostel-zone", name: "Hostel Zone", type: "Residence", latitude: 31.25825, longitude: 75.70775 },
];

// Generalised outline of the Lovely Professional University campus from OpenStreetMap.
export const CAMPUS_BOUNDARY: LatLng[] = [
  [31.25097, 75.69735],
  [31.25054, 75.69754],
  [31.24873, 75.69804],
  [31.24657, 75.69996],
  [31.24575, 75.7003],
  [31.24581, 75.70475],
  [31.24713, 75.70487],
  [31.24811, 75.7059],
  [31.24849, 75.70749],
  [31.24944, 75.70866],
  [31.25041, 75.70653],
  [31.25527, 75.70643],
  [31.25609, 75.70645],
  [31.25761, 75.7086],
  [31.25923, 75.70911],
  [31.25995, 75.707],
  [31.26079, 75.70688],
  [31.25827, 75.70459],
  [31.25561, 75.70381],
  [31.2556, 75.70073],
  [31.25432, 75.69984],
  [31.25315, 75.7001],
  [31.2525, 75.70001],
  [31.25191, 75.69832],
  [31.25115, 75.69737],
  [31.25097, 75.69735],
];

export const CAMPUS_BOUNDS = {
  south: 31.2457534,
  west: 75.6973474,
  north: 31.2607949,
  east: 75.7091258,
};
