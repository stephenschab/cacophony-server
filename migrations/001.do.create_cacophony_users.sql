CREATE TABLE cacophony_users (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  user_name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  date_created TIMESTAMPTZ DEFAULT now() NOT NULL
);