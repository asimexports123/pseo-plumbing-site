# US City Water Hardness & Plumbing Risk Index

**Publisher:** YoHomeFix (https://yohomefix.com)
**Canonical URL:** https://yohomefix.com/research/us-water-hardness-plumbing-risk
**License:** Creative Commons Attribution 4.0 (CC BY 4.0)
**Last Updated:** 2026-07-23

## Dataset Description

This dataset contains water hardness measurements and plumbing infrastructure risk scores for 155 US cities. It compiles publicly available water quality data from municipal utility Consumer Confidence Reports (CCRs), the USGS water hardness database, and utility-published water quality reports, then combines this with YoHomeFix's proprietary plumbing infrastructure assessments to produce a composite plumbing risk score for each city.

## Coverage

- **155 US cities** across 47 states
- **17 variables** per city

## Variables

| Column | Description | Unit/Format |
|--------|-------------|-------------|
| City | City name | Text |
| State | State code | 2-letter code |
| State Name | Full state name | Text |
| Water Utility | Name of municipal water supplier | Text |
| Hardness (mg/L CaCO3) | Representative water hardness | mg/L as calcium carbonate |
| Hardness Class | USGS classification | Soft / Moderately Hard / Hard / Very Hard |
| Infrastructure Class | Pipe era assessment | aging / mixed / modern |
| Winter Risk | Freeze risk classification | high / med / low |
| Avg Winter Temp (F) | Average winter temperature | Degrees Fahrenheit |
| Climate | Climate classification | Text |
| Pipe Material | Dominant pipe materials | Text |
| Pipe Era | Predominant construction era | Text |
| Sewer System | Sewer system type | Text |
| Soil Type | Soil geological description | Text |
| Dominant Failure | Most common plumbing failure mode | Text |
| Risk Score | Composite plumbing risk score | Integer 3-10 |
| Risk Class | Risk classification | Low / Moderate / Elevated / High |

## Methodology

### Water Hardness
Water hardness values represent representative mg/L CaCO3 for each municipal water system, compiled from publicly available utility Consumer Confidence Reports (CCRs), utility-published water quality data, and the USGS water hardness database.

**Provenance tiers:**
- **Tier A (18 cities):** Verified against primary utility CCRs
- **Tier B:** Compiled from public databases
- **Tier C:** Estimated from regional geology and water source type

### Infrastructure Class
Assigned based on predominant pipe era and material in each city's housing stock:
- **aging:** Pre-1970 dominant construction
- **mixed:** 1970-1990 transition
- **modern:** Post-1990 dominant

### Plumbing Risk Score
Composite score (range 3-10) combining:
- Infrastructure age (1-3)
- Winter freeze risk (1-3)
- Water hardness tier (0-3)
- Base point (1)

Higher scores indicate greater likelihood of plumbing failure.

### Hardness Classification (USGS Standards)
- **Soft:** 0-60 mg/L
- **Moderately Hard:** 61-120 mg/L
- **Hard:** 121-180 mg/L
- **Very Hard:** 181+ mg/L

## Limitations

- Hardness values are representative, not point-in-time measurements; actual tap water hardness may vary seasonally
- Tier C values are estimates based on regional geology, not direct measurements
- Infrastructure assessments are generalizations at the city level; individual neighborhoods may differ significantly
- Risk scores are comparative indicators, not predictive models for individual properties
- This dataset is for informational purposes and does not constitute professional plumbing advice

## License

This dataset is licensed under Creative Commons Attribution 4.0 (CC BY 4.0), covering YoHomeFix's compilation, organization, classifications, risk scoring, and analysis. Underlying water hardness measurements and utility data are drawn from public municipal, state, and federal sources and are not subject to this license.

Free to share and adapt with attribution to YoHomeFix.

## Citation

```
YoHomeFix. (2026). US City Water Hardness & Plumbing Risk Index.
Retrieved from https://yohomefix.com/research/us-water-hardness-plumbing-risk
```

## Contact

- Website: https://yohomefix.com
- Research page: https://yohomefix.com/research/us-water-hardness-plumbing-risk
