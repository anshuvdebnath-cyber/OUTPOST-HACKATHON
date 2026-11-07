# Changelog

All notable changes to **Grantly** are documented in this file.

## [1.0.0] - 2026-11-07

### Added
- **Discover Page (`/discover`)** with debounced search, multi-facet filtering, eligibility-only toggle, and sorting.
- **Explainable Eligibility Match Engine** (`computeMatch`) scoring scholarships `0–100%` across 7 weighted criteria with human-readable explanations.
- **Scholarship Detail Page (`/scholarships/:id`)** with eligibility breakdown, interactive application step checklist, and `.ics` calendar export.
- **Document Readiness Meter & Document Vault** syncing owned documents across all scholarships.
- **Kanban Application Tracker (`/tracker`)** with drag-and-drop and keyboard-accessible status transitions.
- **Deadline Timeline (`/deadlines`)** grouped by urgency with one-click `.ics` export.
- **Side-by-Side Comparison (`/compare`)** for up to 3 scholarships.
- **Student Profile & Persona Presets (`/profile`)** with `localStorage` persistence.
- **Dashboard (`/dashboard`)** featuring Eligible Pool, Tracked Funding Potential, and Awarded totals.

