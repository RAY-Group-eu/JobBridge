# Infrastructure

This folder contains the technical foundation of the project.

## `/database`
Contains the **Master Schema** for the database.
- **`schema.sql`**: The single, consolidated source of truth for the database structure. This file contains all tables, security policies, and functions.

## `/scripts`
Contains automated quality assurance tools.
- **`verify_application_flow.ts`**: A script to verify critical user paths.
