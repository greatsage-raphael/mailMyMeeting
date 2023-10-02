CREATE TABLE users (
    id UUID PRIMARY KEY,
    access_token TEXT NOT NULL,
    email_address TEXT UNIQUE NOT NULL
);
