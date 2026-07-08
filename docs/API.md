# PAYAPRESS PRO — Public API Reference

**Base URL:** `https://calculator.payapress.com/api/v1`  
**Version:** v1  
**Authentication:** None (public)  
**Format:** JSON · UTF-8  
**CORS:** `Access-Control-Allow-Origin: *`  
**Rate limiting:** fair-use; responses are edge-cached ~5 minutes (`s-maxage=300`) — poll no faster than that, prices refresh on the same cadence.

---

## Endpoints

### `GET /calculate` — Busbar Cost

Calculate the material cost of a copper or aluminum busbar given its dimensions, grade, and metal price.

#### Query Parameters

| Parameter | Type | Required | Range / Default | Description |
|-----------|------|----------|-----------------|-------------|
| `width` | number | ✅ | 5 – 400 | Busbar width in **mm** |
| `thickness` | number | ✅ | 1 – 50 | Busbar thickness in **mm** |
| `length` | number | ❌ | 1 – 100,000 · default `1000` | Length in **mm** |
| `grade` | string | ❌ | see table · default `cu-etp` | Material grade ID |
| `copper_price` | number | ❌ | > 0 | Manual metal price (USD/kg). Omit to use live price. |
| `currency` | string | ❌ | ISO 4217 · default `USD` | Output currency code |

#### Supported Material Grades

**Copper**

| `grade` | Label | Purity | Density | Standard |
|---------|-------|--------|---------|----------|
| `cu-etp` | Cu-ETP | 99.90% | 8.89 g/cm³ | EN 13601 / IEC 60317-3 |
| `cu-of` | Cu-OF | 99.95% | 8.92 g/cm³ | EN 13601 |
| `cu-ofe` | Cu-OFE | 99.99% | 8.94 g/cm³ | ASTM C10100 |

**Aluminum**

| `grade` | Label | Purity | Density | Standard |
|---------|-------|--------|---------|----------|
| `al-1350` | Al-1350 EC | 99.50% | 2.703 g/cm³ | IEC 60317-40 |
| `al-6101` | Al-6101 | — | 2.700 g/cm³ | IEC 60317-40 |
| `al-6063` | Al-6063 | — | 2.690 g/cm³ | IEC 60317-40 |

#### Supported Currencies

`USD` `EUR` `GBP` `CHF` `JPY` `CAD` `AUD` `AED` `SAR` `KWD` `QAR` `BHD` `CNY` `INR` `SGD` `KRW` `TRY` `BRL` `MXN` `NOK` `SEK` `ZAR`

#### Example Request

```http
GET /api/v1/calculate?width=60&thickness=8&length=6000&grade=cu-etp&currency=AED
```

#### Example Response `200 OK`

```json
{
  "input": {
    "width_mm": 60,
    "thickness_mm": 8,
    "length_mm": 6000,
    "grade": {
      "id": "cu-etp",
      "label": "Cu-ETP",
      "purity_percent": 99.9,
      "standard": "EN 13601 / IEC 60317-3",
      "density_g_cm3": 8.89
    },
    "copper_price_usd_per_kg": 9.675,
    "currency": "AED"
  },
  "results": {
    "cross_section_mm2": 480,
    "weight_per_meter_kg": 4.2672,
    "weight_total_kg": 25.6032,
    "cost_per_meter_usd": 41.2835,
    "cost_per_m2_usd": 688.0583,
    "cost_total_usd": 247.7010,
    "cost_per_meter_local": 151.5968,
    "cost_per_m2_local": 2526.6138,
    "cost_total_local": 909.5811,
    "exchange_rate": {
      "from": "USD",
      "to": "AED",
      "rate": 3.6725
    }
  },
  "meta": {
    "copper_price_source": "COMEX HG=F",
    "fx_source": "ECB via Frankfurter",
    "calculated_at": "2025-05-25T09:00:00.000Z",
    "api_version": "v1"
  }
}
```

#### Error Responses

```json
{ "error": "INVALID_INPUT", "message": "width must be between 5 and 400 mm", "field": "width" }
{ "error": "SERVICE_UNAVAILABLE", "message": "Cannot fetch live price. Pass copper_price=<USD/kg> to use a manual value." }
```

---

### `GET /copper-price` — Live Copper Price

Returns the current COMEX copper futures price (HG=F via Yahoo Finance), cached for 5 minutes server-side.

#### Example Response

```json
{
  "pricePerLb": 4.3850,
  "pricePerKg": 9.6720,
  "pricePerMT": 9672,
  "currency": "USD",
  "source": "COMEX HG=F",
  "isFallback": false,
  "updatedAt": "2025-05-25T09:00:00.000Z"
}
```

When Yahoo Finance is unavailable, `isFallback: true` is returned with a static fallback price.

---

### `GET /aluminum-price` — Live Aluminum Price

Returns the current LME aluminum futures price (ALI=F via Yahoo Finance), cached for 5 minutes server-side. The raw USD/MT quote is converted to USD/kg server-side.

#### Example Response

```json
{
  "pricePerLb": 1.1023,
  "pricePerKg": 2.4320,
  "pricePerMT": 2432,
  "currency": "USD",
  "source": "LME ALI=F",
  "isFallback": false,
  "updatedAt": "2025-05-25T09:00:00.000Z"
}
```

> **Note:** `/api/aluminum-price` is an internal endpoint. The public v1 API (`/api/v1/calculate`) sources aluminum prices from this endpoint automatically.

---

### `GET /fx-rates` — FX Exchange Rates

Returns USD-based exchange rates for all supported currencies, sourced from the European Central Bank via Frankfurter. Cached for 6 hours. Gulf-pegged currencies (AED, SAR, QAR, KWD, BHD) use fixed central-bank peg rates.

#### Example Response

```json
{
  "EUR": 0.9182,
  "GBP": 0.7912,
  "AED": 3.6725,
  "SAR": 3.75,
  "KWD": 0.3075,
  "isFallback": false,
  "source": "ECB via Frankfurter",
  "updatedAt": "2025-05-25T09:00:00.000Z"
}
```

---

## Calculation Method

```
A (mm²)  = width × thickness
W (kg/m) = A × ρ / 1000
C ($/m)  = W × metal_price_per_kg
P ($/m²) = C / (width / 1000)
T ($)    = C × (length_mm / 1000)
```

Where ρ (density g/cm³):
- Cu-ETP = 8.89 · Cu-OF = 8.92 · Cu-OFE = 8.94
- Al-1350 = 2.703 · Al-6101 = 2.700 · Al-6063 = 2.690

**Example** — 60 × 8 mm Cu-ETP at $9.675/kg:
```
A = 60 × 8 = 480 mm²
W = 480 × 8.89 / 1000 = 4.2672 kg/m
C = 4.2672 × 9.675 = $41.28/m
P = 41.28 / 0.06 = $688.06/m²
T = 41.28 × 6 = $247.70  (for 6 000 mm)
```

---

## Rate Limits & Fair Use

This API is free and publicly accessible. Please cache responses on your side:

- Metal prices: cache for at least **5 minutes**
- FX rates: cache for at least **6 hours**
- Calculate: safe to call on every user interaction (no heavy backend work)

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| v1.1 | 2025-05-25 | Added aluminum grades; `/aluminum-price` endpoint |
| v1.0 | 2025-05-20 | Initial public release |
