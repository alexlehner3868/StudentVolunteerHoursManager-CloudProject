-- ================================================================
-- Place this file in your project at (as that is where it is mounted in the docker-stack and compose file):
--       ./database/init.sql
-- ================================================================

-- =========================================
-- USERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS Users (
    UserID SERIAL PRIMARY KEY,
    Type VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    VerificationCode VARCHAR(6),
    VerificationExpiryTime TIMESTAMP
);

-- =========================================
-- STUDENT TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS Student (
    UserID INT PRIMARY KEY REFERENCES Users(UserID),
    StudentName VARCHAR(100),
    SchoolID VARCHAR(50),
    SchoolName VARCHAR(100),
    GraduationDate DATE
);

-- =========================================
-- GUIDANCE COUNSELLOR TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS GuidanceCounsellor (
    UserID INT PRIMARY KEY REFERENCES Users(UserID),
    CounsellorName VARCHAR(100),
    SchoolID VARCHAR(50),
    SchoolName VARCHAR(100)
);

-- =========================================
-- VOLUNTEER HOUR SUBMISSION TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS VolunteerHourSubmission (
    SubmissionID SERIAL PRIMARY KEY,
    StudentID INT REFERENCES Student(UserID) ON DELETE CASCADE,
    Hours DECIMAL(5,2),
    DateVolunteered DATE,
    Description TEXT,
    Organization TEXT,
    ExternSupEmail VARCHAR(100),
    ExternSupStatus VARCHAR(20),
    ExternSupDate DATE,
    ExternSupComments TEXT,
    supervisor_token VARCHAR(64) UNIQUE,
    supervisor_token_expiry TIMESTAMP,
    GuidanceCounsellorFlag BOOLEAN,
    GuidanceCounsellorApproved VARCHAR(20),
    GuidanceCounsellorComments TEXT,
    GuidanceCounsellorID INT REFERENCES GuidanceCounsellor(UserID) ON DELETE SET NULL,
    VerdictDate DATE
);

-- =========================================
-- DEFAULT ADMIN USER (only if missing)
-- =========================================
INSERT INTO Users (Type, Email, PasswordHash)
SELECT 'Admin', 'admin@test.com',
       '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFX5H2b8qZt1c6NVoyk4I5hPDe3T1H0W'  -- bcrypt("Password123!")
WHERE NOT EXISTS (
    SELECT 1 FROM Users WHERE Email = 'admin@test.com'
);
