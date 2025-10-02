-- User Service Initial Data
-- Sample users for testing

INSERT INTO users (id, email, first_name, last_name, phone, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@shophub.com', 'Admin', 'User', '+1234567890', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'John', 'Doe', '+1234567891', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', 'Jane', 'Smith', '+1234567892', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'mike.wilson@example.com', 'Mike', 'Wilson', '+1234567893', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'sara.johnson@example.com', 'Sara', 'Johnson', '+1234567894', true, NOW(), NOW());

-- User preferences
UPDATE users SET 
  email_notifications = true,
  sms_notifications = false,
  marketing_emails = true,
  preferred_language = 'en',
  timezone = 'UTC'
WHERE email = 'admin@shophub.com';

UPDATE users SET 
  email_notifications = true,
  sms_notifications = true,
  marketing_emails = false,
  preferred_language = 'en',
  timezone = 'America/New_York'
WHERE email = 'john.doe@example.com';