# Hello guys! 👾

### This is my new ( not so new, just rebuilt ) project.

### User Authentication API

This project was originally created some time ago, but it became outdated. I decided to revisit the code with the help of LLMs, applying best practices in  **development** ,  **security** , and  **CRUD structure organization.
( LLMs can make life easier, but I strive to treat them as guidance, keeping self-learning at the core of the journey. )**

The **Auth Flow API** leverages several libraries and services to enhance its features, such as:

* **[IP Info API](https://ipinfo.io/)** for retrieving IP-related information
* **Nodemailer** for automated email delivery
* **Bcrypt** for password and token hashing
* **PostgreSQL** for database management

The architecture was designed with a focus on **responsibility segregation** and **secure database connections** . Future versions will expand the API with  **token- and secret-based authentication** , ensuring greater robustness and integration security.

Play with API routes - see the routes at the "auth-api.postman_collection.json" file: [https://auth-flow-api.gaelgomes.dev/api/](https://auth-flow-api.gaelgomes.dev/api/)

---

### Features

* User registration and login
* JWT-based authentication
* Password hashing
* Error handling and;
* IP Geolocation logs

### Technologies

* JavaScript / TypeScript
* Node.js
* Nodemailer
* Express
* JWT
* bcrypt
* IP Info API
* Postgres SQL

### Installation

1. Clone the repository:

<pre class="overflow-visible!" data-start="468" data-end="506"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"><span class="" data-state="closed"></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>git </span><span>clone</span><span> <repository_url>
</span></span></code></div></div></pre>

2. Install dependencies:

<pre class="overflow-visible!" data-start="534" data-end="557"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"><span class="" data-state="closed"></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm install
</span></span></code></div></div></pre>

3. Create a `.env` file with your environment variables.

### Usage

Start the server:

<pre class="overflow-visible!" data-start="646" data-end="669"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"><span class="" data-state="closed"></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm run dev
</span></span></code></div></div></pre>

The API will be running on `http://localhost:8080` like defined on index.ts

### SQL Query to create tables

```pgsql
-- Postgres SQL

-- Roles table
-- This table will store all future uses o roles for apps
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    user_db_id SERIAL PRIMARY KEY,
    user_uid VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(110) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    phone VARCHAR(15),
    password VARCHAR(300) NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    github_id VARCHAR(100),
    role_id INT REFERENCES roles(role_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    active BOOLEAN DEFAULT TRUE
);

-- Index
CREATE INDEX idx_github_id ON users(github_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enum for access status
CREATE TYPE access_status_enum AS ENUM ('success', 'failure');

-- User location logs
CREATE TABLE user_location_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_db_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    location JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_agent VARCHAR(255),
    access_status access_status_enum NOT NULL DEFAULT 'success'
);

-- Indexes
CREATE INDEX idx_user_id ON user_location_logs(user_id);
CREATE INDEX idx_ip_address ON user_location_logs(ip_address);
CREATE INDEX idx_created_at ON user_location_logs(created_at);

-- Enum for token type
CREATE TYPE token_type_enum AS ENUM ('password_reset', 'email_verification', 'access');

-- Tokens table
CREATE TABLE tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_db_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    token VARCHAR(255) NOT NULL,
    type token_type_enum NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_token ON tokens(token);
CREATE INDEX idx_user_token ON tokens(user_id, type, active);

-- Login attempts
CREATE TABLE login_attempts (
    attempt_id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    email_or_username VARCHAR(200) NOT NULL,
    attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_ip_email ON login_attempts(ip_address, email_or_username);
CREATE INDEX idx_attempted_at ON login_attempts(attempted_at);

```

### Session Table

Table to store session on database

```pgsql
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");

CREATE INDEX "IDX_session_expire" ON "session" ("expire");



DROP TABLE IF EXISTS "session";
```



### Structure Tree

Folder and files struture of this project bellow:

```markdown
auth-flow-api/
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── babel.config.js
├── eslint.config.mjs
├── LICENSE
├── package.json
├── README.md
├── tsconfig.json
└── src/
    ├── app.js
    ├── index.ts
    ├── config/
    │   └── module-alias.ts
    ├── controllers/
    │   ├── auth-controller.js
    │   ├── password-controller.js
    │   └── user-controller.js
    ├── middlewares/
    │   ├── auth/
    │   │   └── auth-middleware.js
    │   ├── global/
    │   │   ├── error-handler.js
    │   │   └── global-middleware.js
    │   ├── certificate-validator.js
    │   ├── http-redirect.js
    │   ├── ip-address.js
    │   ├── limiters.js
    │   ├── session.js
    │   └── stringfy.js
    ├── repositories/
    │   ├── auth-repository.js
    │   ├── password-repository.js
    │   └── user-repository.js
    ├── routes/
    │   ├── sso/
    │   │   └── sso.routes.js
    │   ├── auth.routes.js
    │   ├── index.js
    │   ├── password.routes.js
    │   └── users.routes.js
    └── services/
        ├── db/
        │   └── db-connection.js
        └── email/
            ├── mail-service.js
            └── templates/
                ├── rescue-pass-mail.js
                └── welcome-mail.js
```

### API Routes

```markdown
# Base URL
http://localhost:8080/api/

# User creation
/users/create-account

# Authentication routes
/auth/signin
/auth/logout

# Password management
/password/forgot-password
/password/reset-password



```

---

Developed by [@eugaelgomes](https://github.com/eugaelgomes). See my portfolio [gaelgomes.dev](https://gaelgomes.dev)
