# Cycling-street trail routing setup

The optional route generator creates the public street geometry used only by the `/heritage-trail` map. It does not change the maps on the home or booking pages.

## Requirements

- Node.js **22.9.0 or newer** (for built-in `fetch` and `--env-file-if-exists`).
- A Mapbox access token with Directions API access, or an OpenRouteService API key.
- Run commands from the Vite project root: `city-bike-tours-main/`.

## Choose a routing provider

### Mapbox

1. Sign in to Mapbox and create a public access token with Directions API access.
2. Put it in your local, untracked `.env` as `MAPBOX_TOKEN=` or `VITE_MAPBOX_TOKEN=`.
3. The generator calls the Mapbox Directions API using the `cycling` profile, GeoJSON geometry and full overview.

Use `MAPBOX_TOKEN` if you only need route generation. `VITE_MAPBOX_TOKEN` is also accepted to reuse the public token already used by the map tiles.

### OpenRouteService

1. Create an account and generate an API key in the OpenRouteService dashboard.
2. Put it in your local, untracked `.env` as `ORS_API_KEY=`.
3. The generator sends a POST request to `/v2/directions/cycling-regular/geojson`, with waypoint coordinates in longitude/latitude order.

The GeoJSON response is a FeatureCollection; route geometry is in `features[0].geometry.coordinates` and distance/duration are in `features[0].properties.summary`.

### Provider selection

Set `TRAIL_PROVIDER=mapbox` or `TRAIL_PROVIDER=ors` to choose explicitly. If omitted, Mapbox is selected when `MAPBOX_TOKEN` or `VITE_MAPBOX_TOKEN` exists; otherwise ORS is selected when `ORS_API_KEY` exists. If no usable key is available, the script exits with a clear message and does not touch the route output.

## Generate the route

From `city-bike-tours-main/`:

```bash
npm run trail:build
```

The command loads the local `.env` file when it exists and writes `src/data/trail-route.json` only after all validations pass. The JSON contains public route coordinates, distance, duration, provider, profile, attribution and stop indexes. It never contains the API key.

Do not commit `.env` or any secret. The generated route JSON is public geographic data and may be committed when it has been generated from a real provider response.

## Adding via points

At the top of `scripts/build-trail.mjs`, edit `TRAIL_VIA`. Coordinates are Leaflet order: `[latitude, longitude]`.

```js
const TRAIL_VIA = {
  monument: [
    [-24.6548, 25.9080],
    [-24.6551, 25.9090],
  ],
};
```

A key is the stop ID after which the points should be inserted on the way to the next stop. Valid IDs are `mainmall` and the site IDs in `src/data.js`. Keep the points on streets that are actually safe and appropriate for cycling. Re-run `npm run trail:build` after changing the order, site coordinates or via points.

## Validation and safe writes

The script converts source coordinates from `[lat, lng]` to API order `[lng, lat]`, then converts the returned geometry back. It simplifies the line with approximately 2 m Douglas–Peucker tolerance while retaining each stop's nearest route vertex. It rejects routes with fewer than 50 coordinates, coordinates outside the Gaborone bounding box, route distances outside 4–30 km, or stop indexes that do not increase around the loop.

An API error or failed validation exits non-zero and leaves an existing `src/data/trail-route.json` untouched. The output is written to a temporary file and renamed only after validation succeeds.

## Troubleshooting

- **401 / unauthorized:** check that the key is active, copied without quotes/spaces, and belongs to the provider selected by `TRAIL_PROVIDER`.
- **422 / invalid coordinates:** API coordinates must be `[longitude, latitude]`; source site coordinates in `src/data.js` are `[latitude, longitude]`. The script performs this conversion automatically. Check custom via points are also entered as `[lat, lng]`.
- **NoRoute / no route found:** one or more waypoints may be inaccessible to the cycling profile or snapped to unsuitable roads. Check the coordinates and add street-following `TRAIL_VIA` points to guide the route.
- **Straight lines are shown:** the optional generated JSON is absent or invalid. Run `npm run trail:build` with a working provider key. The trail page intentionally falls back to the existing straight line and logs one informational message; other pages always retain their original map.
- **Bicycle is not moving:** generate a valid route first, then press Play. Check that the map is on screen and the browser tab is visible. A reduced-motion preference disables autoplay but manual Play remains available. Pause, Restart, speed and Follow controls are only shown when valid route data loads.
- **Mapbox tiles work but route generation does not:** tile access and Directions API access are separate token permissions. Ensure the token has Directions API access.

## Provider terms and attribution

Before storing or redistributing generated route results, review the current provider terms, plan restrictions and caching/storage rules for your account. Keep the provider attribution in `trail-route.json` and visible beside the map attribution. Do not remove or obscure attribution when styling the map.

Provider response reference: https://github.com/GIScience/openrouteservice/blob/main/docs/api-reference/endpoints/directions/requests-and-return-types.md
