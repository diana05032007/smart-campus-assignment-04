// Compatibility barrel: keeps existing imports working after the data layer
// was split into src/data/bookings.ts, src/data/roomCatalog.ts and src/constants.ts.
export { CURRENT_TIME } from "./constants";
export { bookings } from "./data/bookings";
export { rooms } from "./data/roomCatalog";
