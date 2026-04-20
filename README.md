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
  "fermentationSchedule": {
    "mode": "MIXED",
    "roomHours": 2,
    "roomTemperatureCelsius": 20,
    "coldHours": 24,
    "coldTemperatureCelsius": 4
  }
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
  "prefermentFlourPercent": 30,
  "fermentationSchedule": {
    "mode": "ROOM",
    "roomHours": 12,
    "roomTemperatureCelsius": 20
  }
}
```

For `POOLISH` and `BIGA`, the response includes both `preferment` and `finalMix` blocks.

Supported dough methods:

- `DIRECT`
- `POOLISH`
- `BIGA`

Neapolitan dough does not include oil or sugar in the base formula.
