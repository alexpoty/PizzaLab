# PizzaLab

PizzaLab is a Neapolitan pizza dough calculation lab. The first milestone is a backend API for calculating flour, water, salt, and yeast from baker percentages, fermentation schedule, and dough method.

## Backend

Stack:

- Kotlin
- Spring Boot
- Gradle Kotlin DSL

## Frontend

Stack:

- React
- TypeScript
- Vite

Run locally:

```bash
cd frontend
npm install
npm run dev
```

Run with Docker:

```bash
docker compose up --build
```

The app runs at `http://localhost:3000`, and the backend API is also exposed at `http://localhost:8080`.

Pull requests targeting `main` publish Docker images to GitHub Container Registry:

- `ghcr.io/alexpoty/pizzalab/backend:pr-<number>`
- `ghcr.io/alexpoty/pizzalab/frontend:pr-<number>`

Planned first endpoint:

```http
POST /api/dough/calculate
```

Metadata endpoint:

```http
GET /api/dough/metadata
```

It returns available dough methods, yeast types, and fermentation presets with compatible methods and required temperatures.

Example request:

```json
{
  "pizzaCount": 4,
  "doughBallWeightGrams": 250,
  "hydrationPercent": 65,
  "saltPercent": 2.8,
  "yeastType": "INSTANT",
  "doughMethod": "DIRECT",
  "fermentationPreset": "ROOM_24H",
  "roomTemperatureCelsius": 20
}
```

Example poolish request:

```json
{
  "pizzaCount": 4,
  "doughBallWeightGrams": 250,
  "hydrationPercent": 65,
  "saltPercent": 2.8,
  "yeastType": "INSTANT",
  "doughMethod": "POOLISH",
  "fermentationPreset": "POOLISH_ROOM_16H_COLD_24H",
  "roomTemperatureCelsius": 20,
  "coldTemperatureCelsius": 4,
  "prefermentFlourPercent": 30
}
```

Manual fermentation schedules are also supported:

```json
{
  "pizzaCount": 4,
  "doughBallWeightGrams": 250,
  "hydrationPercent": 65,
  "saltPercent": 2.8,
  "yeastType": "INSTANT",
  "doughMethod": "POOLISH",
  "prefermentFlourPercent": 30,
  "fermentationSchedule": {
    "mode": "MIXED",
    "roomHours": 16,
    "roomTemperatureCelsius": 20,
    "coldHours": 24,
    "coldTemperatureCelsius": 4
  }
}
```

For `POOLISH` and `BIGA`, the response includes both `preferment` and `finalMix` blocks.
When a preferment method includes cold fermentation, yeast is split between the preferment and final mix; top-level `yeastGrams` is the total yeast amount.
The response also includes `yeastCalculation` details for explaining the selected yeast amount.

Example yeast calculation block:

```json
{
  "yeastCalculation": {
    "yeastType": "INSTANT",
    "doughMethod": "DIRECT",
    "roomEffectHours": 5.7,
    "coldEffectHours": 0.0,
    "effectiveFermentationHours": 5.7,
    "methodFactor": 1.0,
    "freshYeastEquivalentGrams": 1.2,
    "selectedYeastGrams": 0.4
  }
}
```

Supported dough methods:

- `DIRECT`
- `POOLISH`
- `BIGA`

Neapolitan dough does not include oil or sugar in the base formula.

Supported fermentation presets:

- `ROOM_24H`: 24 hours at room temperature. Requires `roomTemperatureCelsius`.
- `COLD_24H`: 24 hours in the refrigerator. Requires `coldTemperatureCelsius`.
- `COLD_48H`: 48 hours in the refrigerator. Requires `coldTemperatureCelsius`.
- `POOLISH_ROOM_16H_COLD_24H`: 16 hours at room temperature, then 24 hours in the refrigerator. Requires `doughMethod: "POOLISH"`, `roomTemperatureCelsius`, and `coldTemperatureCelsius`.
- `BIGA_ROOM_16H_COLD_24H`: 16 hours at room temperature, then 24 hours in the refrigerator. Requires `doughMethod: "BIGA"`, `roomTemperatureCelsius`, and `coldTemperatureCelsius`.

## Yeast model

The first yeast model is calibrated from AVPN-style Neapolitan dough ranges:

- fresh yeast is the reference type;
- dry yeast is calculated as one third of fresh yeast;
- fresh yeast is clamped to 0.1-3 g per 1 liter of water;
- temperature changes use a Q10-style yeast activity factor;
- cold fermentation applies an additional retardation factor;
- direct cold fermentation is calibrated to 1.8% fresh yeast for 24h at 5°C and 0.7% fresh yeast for 48h at 5°C;
- poolish and biga use lower yeast factors than direct dough.

This model is intentionally explicit and test-covered so it can be calibrated with real bake results later.
