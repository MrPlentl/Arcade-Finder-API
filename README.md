# Arcade-Finder-API

A comprehensive REST API to discover nearby arcades, explore their game inventories, and view detailed venue information including pricing, parking, and amenities.

## Features

- **Arcade Finder**: Find arcades near a specific zipcode or distance.
- **Game Inventories**: Explore the catalog of games available at each venue.
- **Venue Details**: View comprehensive information including pricing, parking, contact info, and amenities.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Validation**: Express OpenAPI Validator

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:MrPlentl/Arcade-Finder-API.git
   cd Arcade-Finder-API
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (create a `.env` file with your `DATABASE_URL` and `PORT`).

### Database Setup

Run the following commands to create your database tables and populate them with seed data:

```bash
npm run db:migrate
npm run db:seed:all
```

### Running the Application

- **Development Mode**: `npm run dev`
- **Production Build**: `npm run build` followed by `npm run start`
- **Linting/Formatting**: `npm run lint` or `npm run format`

## License

This project is `npm run lint` or `npm run format`

## License

This project is
