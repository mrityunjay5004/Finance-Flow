# FinanceFlow API

A professional Finance Data Processing and Access Control System built with Node.js, Express, and MongoDB. This system provides a robust backend for managing financial records with enterprise-grade authorization, optimized analytics, and standardized validation.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Security**: JWT Authentication & bcrypt password hashing
- **Validation**: express-validator
- **Logging**: Morgan (HTTP request logger)

## 📁 Folder Structure

The project follows a **Clean Architecture** pattern with a clear separation of concerns:

```
src/
├── config/           # Database and application configuration
├── controllers/      # Request handlers (logic-to-response mapping)
├── middleware/       # Auth, RBAC, and error management
├── models/           # Mongoose schemas and indexing
├── routes/           # API endpoint definitions
├── services/         # Core business logic and database interactions
├── utils/            # Reusable helper utilities and constants
└── validators/       # Input validation rules
```

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (running locally or a connection URI)

### 2. Installation
```bash
# Clone and enter directory
cd financeflow-api

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://arr40381_db_user:password@cluster0.i2x2q3n.mongodb.net/?appName=Cluster0
JWT_SECRET=mySuperSecretKey123
JWT_EXPIRES_IN=7d
```

### 4. Running the App
```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

## 🔐 Role-Based Access Control (RBAC)

The system enforces strict authorization across every endpoint:

| Role      | Permissions                                                                 |
| --------- | --------------------------------------------------------------------------- |
| **Viewer**  | Read records only. Access is denied for all writing and analytics tools.     |
| **Analyst** | Read + write records. Access to Dashboard and Analytics. No User Management. |
| **Admin**   | Full CRUD + Deletion of records. Full User Management (roles/status).       |

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register`: Create a new account (defaults to Viewer).
- `POST /login`: Generate JWT token.
- `GET /me`: Retrieve profile of current authenticated user.

### Financial Records (`/api/records`)
- `GET /`: List user records (Paginated + Filtered by category, date, type).
- `GET /:id`: Retrieve a specific record.
- `POST /`: Create a new record (Analyst/Admin only).
- `PATCH /:id`: Update record details (Analyst/Admin only).
- `DELETE /:id`: Soft delete a record (Admin only).

### Analytics Dashboard (`/api/dashboard`)
*Access restricted to Analyst and Admin roles.*
- `GET /summary`: Totals for income, expenses, and current balance.
- `GET /category-breakdown`: Aggregated spending per category.
- `GET /monthly-trends`: Time-series trends (last 12-24 months).
- `GET /recent-transactions`: Retrieve the 5 latest activity logs.

### User Management (`/api/users`)
*Access restricted strictly to Admin role.*
- `GET /`: List all registered users (Paginated + Searchable).
- `GET /:id`: View user profile and status.
- `PATCH /:id`: Modify user roles or deactivate accounts.
- `DELETE /:id`: Permanently delete a user account.

## 📝 Assumptions & Logic
- **Soft Deletion**: Records are never permanently removed from the DB; they are flagged as `isDeleted: true` and excluded from all queries by default.
- **Data Scoping**: Every user can only see and manage financial records they created, except for Admins viewing the User list.
- **Audit Ready**: All schemas include `timestamps` (createdAt, updatedAt) for tracking changes.

## 🔮 Future Improvements
- **Swagger Documentation**: Integrated OpenAPI UI for easier frontend discovery.
- **Unit & Integration Tests**: Jest implementation for core services and routes.
- **Refresh Tokens**: Added security to handle session persistence without long-lived access tokens.
- **Bulk Import/Export**: CSV support for financial records.

---
*Created for secure, scalable financial data processing.*
