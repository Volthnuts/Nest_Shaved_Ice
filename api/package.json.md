🗂️ Dependencies พร้อมคำอธิบาย
"dependencies": {
  // ⚙️ NestJS Core Framework
  "@nestjs/common": "^11.0.1",         // Core decorators, providers, guards, pipes, etc.
  "@nestjs/core": "^11.0.1",           // Main NestJS framework core
  "@nestjs/platform-express": "^11.1.2", // HTTP layer using Express

  // ⚙️ Configuration
  "@nestjs/config": "^4.0.2",          // For managing environment variables via `.env`

  // 🔐 Authentication & Authorization
  "@nestjs/passport": "^11.0.5",       // Bridge between Passport.js and NestJS
  "@nestjs/jwt": "^11.0.0",            // JSON Web Token support (sign/verify tokens)
  "passport": "^0.7.0",                // Core Passport library for authentication
  "passport-local": "^1.0.0",          // Passport strategy for local username/password login
  "passport-jwt": "^4.0.1",            // JWT strategy for Passport (bearer tokens)
  "passport-google-oauth20": "^2.0.0", // Google OAuth2 login support

  // 🔐 Security Utilities
  "bcrypt": "^6.0.0",                  // Password hashing (used in local auth)
  "argon2": "^0.43.0",                 // Stronger password hashing alternative (Argon2)

  // 🛠️ Validation & Transformation
  "class-validator": "^0.14.2",        // Validate DTOs using decorators
  "class-transformer": "^0.5.1",       // Transform plain objects to class instances

  // 🗃️ Database & ORM
  "@nestjs/typeorm": "^11.0.0",        // NestJS integration for TypeORM
  "typeorm": "^0.3.24",                // ORM for PostgreSQL and other DBs
  "pg": "^8.16.0",                     // PostgreSQL driver for Node.js

  // 📦 Utility
  "reflect-metadata": "^0.2.2",        // Required for decorators to work in TypeScript
  "rxjs": "^7.8.1",                    // Reactive programming (used internally by NestJS)
  "multer": "^2.0.0",                  // Middleware for handling multipart/form-data (file upload)

  // 🧩 NestJS Helpers
  "@nestjs/mapped-types": "*",         // Helps create partial/update DTOs from existing ones
}
-------------------------------------------------------------------------------------------------------------
🧪 DevDependencies พร้อมคำอธิบาย
"devDependencies": {
  // 🧪 NestJS Development Tools
  "@nestjs/cli": "^11.0.0",            // Nest CLI for scaffolding and commands
  "@nestjs/schematics": "^11.0.0",     // Blueprint for generating NestJS modules/components
  "@nestjs/testing": "^11.0.1",        // Testing utilities for NestJS

  // 🧪 Testing Libraries
  "jest": "^29.7.0",                   // Main testing framework
  "ts-jest": "^29.2.5",                // TypeScript support for Jest
  "supertest": "^7.0.0",               // HTTP assertions for E2E tests
  "@types/jest": "^29.5.14",           // Type definitions for Jest
  "@types/supertest": "^6.0.2",        // Type definitions for Supertest

  // 📦 Type Definitions
  "@types/bcrypt": "^5.0.2",
  "@types/express": "^5.0.0",
  "@types/node": "^22.10.7",
  "@types/passport-google-oauth20": "^2.0.16",
  "@types/passport-jwt": "^4.0.1",
  "@types/passport-local": "^1.0.38",

  // 🛠️ TypeScript & TS Tools
  "typescript": "^5.7.3",              // TypeScript compiler
  "ts-node": "^10.9.2",                // Run TS directly with Node.js
  "ts-loader": "^9.5.2",               // Webpack loader for TS
  "tsconfig-paths": "^4.2.0",          // Support for path aliases in runtime

  // ⚙️ Transpilation (Optional Fast Alternative to tsc)
  "@swc/core": "^1.10.7",              // Super-fast JS/TS compiler
  "@swc/cli": "^0.6.0",                // CLI for SWC

  // 🧼 Linting & Formatting
  "eslint": "^9.18.0",                 // Linting engine
  "eslint-config-prettier": "^10.0.1", // Disables ESLint rules that conflict with Prettier
  "eslint-plugin-prettier": "^5.2.2",   // Runs Prettier as ESLint rule
  "prettier": "^3.4.2",                 // Code formatter
  "@eslint/eslintrc": "^3.2.0",         // ESLint config loader
  "@eslint/js": "^9.18.0",              // ESLint config base
  "globals": "^16.0.0",                 // Predefined global variables (e.g., browser, Node)

  // 🧵 Debugging
  "source-map-support": "^0.5.21",      // Provides stack traces with TypeScript source
}
-------------------------------------------------------------------------------------------------------------
✅ หมวดหมู่สรุป
| หมวดหมู่               | รายการที่เกี่ยวข้อง                                                            |
| ---------------------- | ------------------------------------------------------------------------------ |
| **NestJS Core**        | `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/config` |
| **Auth & Security**    | `@nestjs/passport`, `@nestjs/jwt`, `passport-*`, `bcrypt`, `argon2`            |
| **Validation**         | `class-validator`, `class-transformer`                                         |
| **File Upload**        | `multer`                                                                       |
| **Database / ORM**     | `@nestjs/typeorm`, `typeorm`, `pg`                                             |
| **Utility / Required** | `reflect-metadata`, `rxjs`, `@nestjs/mapped-types`                             |
| **Dev Tools**          | Nest CLI, Testing Tools, Linting, TypeScript Tools                             |
