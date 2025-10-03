-- Fix the profiles business_type check constraint to allow 'user' type
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_business_type_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_business_type_check 
CHECK (business_type IN ('venue', 'club', 'user'));