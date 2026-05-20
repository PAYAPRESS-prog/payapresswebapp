# PAYAPRESS PRO — Public API Reference

**Base URL:** `https://guileless-torrone-f24c5e.netlify.app/api/v1`  
**Version:** v1  
**Authentication:** None (public, rate-limit courtesy applies)  
**Format:** JSON · UTF-8  
**CORS:** `Access-Control-Allow-Origin: *`

---

## Endpoints

### `GET /calculate` — Copper Busbar Cost

Calculate the material cost of a copper busbar given its dimensions and material grade.

#### Query Parameters

| Parameter | Type | Required | Range / Default | Description |
|-----------|------|----------|-----------------|-------------|
| `width` | number | ✅ | 5 – 400 | Busbar width in **mm** |
| `thickness` | number | ✅ | 1 – 50 | Busbar thickness in **mm** |
| `length` | number | ❌ | 1 – 100,000 · default `1000` | Length in **mm** |
| `grade` | string | ❌ | see table · default `cu-etp` | Material grade ID |
| `copper_price` | number | ❌ | > 0 | Manual copper price (USD/kg). Omit to use live COMEX price. |
| `currency` | string | ❌ | ISO 4217 · default `USD` | Output currency code |

#### Supported Material Grades

| `grade` | Label | Purity | Standard |
|---------|-------|--------|----------|
| `cu-etp` | Cu-ETP | 99.90% | EN 13601 / IEC 60317-3 |
| `cu-of` | Cu-OF | 99.95% | EN 13601 / IEC 60317-37 |
| `cu-ofe` | Cu-OFE | 99.99% | ASTM C10100 |

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
    "copper_price_usd_per_kg": 13.9750,
    "currency": "AED"
  },
  "results": {
    "cross_section_mm2": 480,
    "weight_per_meter_kg": 4.2672,
    "weight_total_kg": 25.6032,
    "cost_per_meter_usd": 59.5832,
    "cost_per_m2_usd": 993.0533,
    "cost_total_usd": 357.4992,
    "cost_per_meter_local": 218.7432,
    "cost_per_m2_local": 3645.9858,
    "cost_total_local": 1312.4592,
    "exchange_rate": {
      "from": "USD",
      "to": "AED",
      "rate": 3.672500
    }
  },
  "meta": {
    "copper_price_source": "COMEX HG=F",
    "fx_source": "ECB via Frankfurter",
    "calculated_at": "2025-05-20T09:00:00.000Z",
    "api_version": "v1"
  }
}
```

#### Error Responses

```json
{ "error": "INVALID_INPUT", "message": "width must be between 5 and 400 mm", "field": "width" }
{ "error": "SERVICE_UNAVAILABLE", "message": "Cannot fetch live copper price. Pass copper_price=<USD/kg> to use a manual value." }
```

---

### `GET /copper-price` — Live Copper Price

Returns the current COMEX copper futures price (HG=F via Yahoo Finance), cached for 5 minutes.

#### Example Response

```json
{
  "pricePerLb": 4.3850,
  "pricePerKg": 9.6720,
  "pricePerMT": 9672,
  "currency": "USD",
  "source": "COMEX HG=F",
  "isFallback": false,
  "updatedAt": "2025-05-20T09:00:00.000Z",
  "api_version": "v1"
}
```

---

### `GET /fx-rates` — FX Exchange Rates

Returns USD-based exchange rates for all supported currencies, sourced from the European Central Bank via Frankfurter. Cached for 6 hours. Gulf-pegged currencies (AED, SAR, QAR, KWD, BHD) use fixed central-bank pegs.

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
  "updatedAt": "2025-05-20T09:00:00.000Z",
  "api_version": "v1"
}
```

---

## Calculation Method

Weight and cost are derived using the standard IEC/EN formula:

```
Cross-section  A  = width × thickness  [mm²]
Volume/meter   V  = A × 1000           [mm³/m]
Weight/meter   W  = V × ρ / 1,000,000  [kg/m]    where ρ = density in g/cm³
Cost/meter     C  = W × copper_price   [USD/m]
Cost/m²        P  = C / (width / 1000) [USD/m²]
Total cost     T  = C × (length / 1000)[USD]
```

---

## Rate Limits & Fair Use

This API is free and publicly accessible. Please cache responses on your side:

- Copper price: cache for at least **5 minutes**
- FX rates: cache for at least **6 hours**
- Calculate: safe to call on every user action (no heavy backend work)

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| v1 | 2025-05 | Initial public release |
