// ------------------------------------------------------------
// Activities and their MET values
//
// MET = how many times more energy than sitting still.
// 1 MET ≈ 1 kcal per kg body weight per hour.
// Values from the "Compendium of Physical Activities".
// ------------------------------------------------------------

const ACTIVITIES = [
  { id: "walking",   name: "Walking",                met: { light: 2.8, moderate: 3.5, intense: 5.0 } },
  { id: "running",   name: "Running / jogging",      met: { light: 7.0, moderate: 9.8, intense: 11.5 } },
  { id: "strength",  name: "Strength training",      met: { light: 3.5, moderate: 5.0, intense: 6.0 } },
  { id: "hiit",      name: "HIIT / circuit training", met: { light: 6.0, moderate: 8.0, intense: 10.0 } },
  { id: "cycling",   name: "Cycling",                met: { light: 4.0, moderate: 6.8, intense: 10.0 } },
  { id: "spinning",  name: "Spinning / indoor bike", met: { light: 5.0, moderate: 7.0, intense: 8.5 } },
  { id: "swimming",  name: "Swimming",               met: { light: 5.8, moderate: 8.3, intense: 10.0 } },
  { id: "hiking",    name: "Hiking",                 met: { light: 5.3, moderate: 6.0, intense: 7.8 } },
  { id: "stairs",    name: "Stair climbing",         met: { light: 4.0, moderate: 8.0, intense: 9.0 } },
  { id: "rowing",    name: "Rowing machine",         met: { light: 4.8, moderate: 7.0, intense: 8.5 } },
  { id: "elliptical",name: "Cross trainer",          met: { light: 4.6, moderate: 5.0, intense: 6.0 } },
  { id: "yoga",      name: "Yoga",                   met: { light: 2.5, moderate: 3.0, intense: 4.0 } },
  { id: "pilates",   name: "Pilates",                met: { light: 2.8, moderate: 3.0, intense: 3.8 } },
  { id: "dancing",   name: "Dancing / Zumba",        met: { light: 4.5, moderate: 5.5, intense: 7.3 } },
  { id: "racket",    name: "Badminton / tennis",     met: { light: 5.5, moderate: 7.0, intense: 8.0 } },
  { id: "teamsport", name: "Football / basketball / team sport", met: { light: 6.0, moderate: 7.0, intense: 9.0 } },
  { id: "climbing",  name: "Climbing / bouldering",  met: { light: 5.8, moderate: 7.5, intense: 8.0 } },
  { id: "other",     name: "Other",                  met: { light: 3.0, moderate: 5.0, intense: 7.0 } },
];

function findActivity(id) {
  return ACTIVITIES.find(a => a.id === id) || ACTIVITIES[ACTIVITIES.length - 1];
}
