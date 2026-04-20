# PizzaLab

PizzaLab is a Neapolitan pizza dough calculation lab. The first milestone is a backend API for calculating flour, water, salt, and yeast from baker percentages, fermentation schedule, and dough method.

## Backend

Stack:

- Kotlin
- Spring Boot
- Gradle Kotlin DSL

Planned first endpoint:

```http
POST /api/dough/calculate
```

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

Supported dough methods:

- `DIRECT`
- `POOLISH`
- `BIGA`

Neapolitan dough does not include oil or sugar in the base formula.

Supported fermentation presets:

- `ROOM_24H`: 24 hours at room temperature. Requires `roomTemperatureCelsius`.
- `COLD_24H`: 24 hours in the refrigerator. Requires `coldTemperatureCelsius`.
- `POOLISH_ROOM_16H_COLD_24H`: 16 hours at room temperature, then 24 hours in the refrigerator. Requires `doughMethod: "POOLISH"`, `roomTemperatureCelsius`, and `coldTemperatureCelsius`.
- `BIGA_ROOM_16H_COLD_24H`: 16 hours at room temperature, then 24 hours in the refrigerator. Requires `doughMethod: "BIGA"`, `roomTemperatureCelsius`, and `coldTemperatureCelsius`.
