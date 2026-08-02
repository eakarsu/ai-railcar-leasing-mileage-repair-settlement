# Railcar Leasing, Mileage & Repair Settlement

Reconcile railcar rent, mileage allowances, utilization, and repair responsibility across owners and operators.

**Primary buyer:** Railcar owners, lessees, and fleet operators. **Evidence:** lease agreements, car marks, mileage events, interchange records, utilization, maintenance responsibility, repair invoices, mileage allowances, settlements, and credits.

Full local application built with React, Vite, Express, PostgreSQL, and OpenRouter. Includes 15 domain-specific capabilities, 105 custom AI workbench fields, three scenario-fill controls per feature, operational registers, workflow transitions, analytics, professional AI decision briefs, audit history, and at least 15 PostgreSQL records per capability.

## Domain capabilities

- Lease agreement library
- Railcar mark registry
- Interchange event ingestion
- Loaded empty mileage
- Daily rent calculation
- Mileage allowance calculation
- Utilization threshold control
- Bad-order day exclusion
- Maintenance responsibility
- Repair invoice audit
- AAR rule validation
- Owner lessee settlement
- Dispute workflow
- Cash credit reconciliation
- Fleet counterparty analytics

Run `./start.sh`, then open <http://127.0.0.1:4697>. API: `5697`.

Administrator: `runtime-admin@example.com` / `LocalDemo!2026`. Operator and reviewer credential buttons are available on the login page.
