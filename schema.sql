CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  class_name VARCHAR(100) NOT NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional sample data. Uncomment and run only if you want sample records.
-- INSERT INTO students (student_id, name, email, class_name, status) VALUES
-- ('STU001', 'Aline Uwase', 'aline@example.com', 'Year 2 - Software', 'Active'),
-- ('STU002', 'Eric Mugisha', 'eric@example.com', 'Year 1 - Networking', 'Active'),
-- ('STU003', 'Diane Mukama', 'diane@example.com', 'Year 3 - Software', 'Inactive');
