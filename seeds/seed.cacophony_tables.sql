BEGIN;

TRUNCATE
  cacophony_users,
  RESTART IDENTITY CASCADE;

INSERT INTO cacophony_users (user_name, email, password)
VALUES
  ('Shishka Schab', 'stephenschab689@msn.com', 'R3dhairB3auty')
  ('SchabertDowneyJr', 'sschab689@gmail.com', 'B00pSc00ps')

COMMIT;