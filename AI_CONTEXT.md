# Auto Tracker AI Context

## Stack
- React
- Vite
- JavaScript
- Plain CSS
- localStorage

## Current Version
v0.0.6

## Current Features
- Vehicle management
- Vehicle detail view
- Maintenance records
- Maintenance cost tracking
- Service schedules per vehicle
- Upcoming maintenance alerts
- Overdue maintenance alerts
- Dashboard alert widgets
- Vehicle detail alert view
- Dashboard widgets
- Fuel records per vehicle
- Fuel analytics and spend tracking
- Vehicle documents per vehicle
- Document expiration tracking
- Dashboard document widgets
- Expense tracking per vehicle
- Expense analytics and ownership cost tracking

## Project Rules
- Keep code simple and modular
- Use existing file structure when possible
- Keep styling consistent
- Use localStorage until Supabase is intentionally added
- Do not add routing libraries yet
- Do not add authentication yet
- Do not add Supabase yet

## Required After Each Change
- Run npm run build
- Run npm run lint
- Summarize changed files
- Update this file if project rules or features change

## Version Plan
### v0.0.1
- Vehicle management MVP

### v0.0.2
- Maintenance history and cost tracking

### v0.0.3
- Service schedules
- Upcoming maintenance alerts
- Overdue maintenance alerts

### v0.0.4
- Fuel records per vehicle
- Add/edit/delete fuel records
- Average MPG calculations
- Lifetime fuel spend
- Monthly fuel spend
- Cost per mile

### v0.0.5
- Vehicle documents per vehicle
- Add/edit/delete document records
- Show documents on vehicle detail view
- Total documents widget
- Expiring documents widget
- Recently added documents widget

### v0.0.6
- Expense tracking per vehicle
- Add/edit/delete expenses
- Expense categories
- Expense dashboard widgets
- Vehicle ownership cost calculations
- Cost per mile calculations

## Development Workflow

Before coding:
- Read AI_CONTEXT.md

After coding:
- Run npm run build
- Run npm run lint
- Summarize changed files
- Update AI_CONTEXT.md
- Do not remove existing functionality unless explicitly requested

## Coding Standards

- Prefer modifying existing files over creating unnecessary files
- Keep components small and reusable
- Keep localStorage structure organized
- Minimize dependencies
- Avoid premature optimization
- Build the simplest working solution first
