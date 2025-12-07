CREATE TABLE persons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prefix VARCHAR(50),
    firstname VARCHAR(100) NOT NULL,
    middlename VARCHAR(100),
    lastname VARCHAR(100),
    gender SET("male", "female", "other"),
    birthdate DATE,
    maritalstatus SET("Single", "Married", "Divorced", "Widowed"),
    jobtitle VARCHAR(100),
    zodiacsign VARCHAR(50),
    phone VARCHAR(15),
    imie VARCHAR(20),
    users_id INT,
    FOREIGN KEY (users_id) REFERENCES users(id)
);


CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    streetAddress VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zipCode VARCHAR(20),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    timeZone VARCHAR(50),
    users_id INT,
    FOREIGN KEY (users_id) REFERENCES users(id)
);

DROP TABLE persons;

ALTER TABLE persons 
MODIFY COLUMN gender VARCHAR(50),
MODIFY COLUMN maritalstatus VARCHAR(50);


ALTER TABLE locations 
MODIFY COLUMN latitude VARCHAR(50),
MODIFY COLUMN longitude VARCHAR(50);



START TRANSACTION;

INSERT INTO users (username, password, email, role, image_url)
VALUES ('Alice4', 'password123', 'alice.not124@x.com', 'user', 'https://i.pravatar.cc/150?img=3');
SET @last_id = LAST_INSERT_ID();
INSERT INTO persons (prefix, firstname, middlename, lastname, gender, birthdate, maritalstatus, zodiacsign, jobtitle, phone, users_id)
VALUES ('Mr.', 'Alice', 'B', 'Smith', 'F', '1990-01-01', 'Single', 'Capricorn', 'Engineer', '123-456-7890', @last_id);
INSERT INTO locations (streetAddress, city, state, zipCode, latitude, longitude, timezone, country, users_id)
VALUES ('123 Main St', 'Jaipur', 'Rajasthan', '12345', '40.7128', '-74.0060', 'America/New_York', 'USA', @last_id);
COMMIT;

ALTER TABLE persons 
DROP COLUMN phone VARCHAR(100);

ALTER TABLE persons
DROP COLUMN imie;


{"username":"johndoe","email":"johndoe@example.com","role":"user","prefix":"Mr.","firstname":"John","middlename":"A.","lastname":"Doe","gender":"M","birthdate":"1985-05-15","maritalstatus":"Single","zodiacsign":"Taurus","jobtitle":"Developer","phone":"555-1234","streetaddress":"456 Elm St","city":"Springfield","state":"IL","zipcode":"62704","latitude":"39.7817","longitude":"-89.6501","timezone":"America/Chicago","country":"USA","image":"https://i.pravatar.cc/150?img=5"}


START TRANSACTION;
INSERT INTO users (username, password, email, role, image_url) VALUES ('johndoe', '$2b$10$/NiNFO4CKqaRj0qyqxPPi.RClkBM/v4GfZ.Rfo41A057Y8R8y7F7q', 'johndoe@example.com', 'user', 'https://i.pravatar.cc/150?img=5');
SET @last_id = LAST_INSERT_ID();
INSERT INTO persons (prefix, firstname, middlename, lastname, gender, birthdate, maritalstatus, zodiacsign, jobtitle, phone, users_id) VALUES ('Mr.', 'John', 'A.', 'Doe', 'M', '1985-05-15', 'Single', 'Taurus', 'Developer', '555-1234', @last_id);
INSERT INTO locations (streetAddress, city, state, zipCode, latitude, longitude, timezone, country, users_id) VALUES ('456 Elm St', 'Springfield', 'IL', '62704', '39.7817', '-89.6501', 'America/Chicago', 'USA', @last_id);
COMMIT;

SET @last_id = LAST_INSERT_ID();
INSERT INTO persons (prefix, firstname, middlename, lastname, gender, birthdate, maritalstatus, zodiacsign, jobtitle, phone, users_id) VALUES ('${prefix}', '${firstname}', '${middlename}', '${lastname}', '${gender}', '${birthdate}', '${maritalstatus}', '${zodiacsign}', '${jobtitle}', '${phone}', @last_id);
INSERT INTO locations (streetAddress, city, state, zipCode, latitude, longitude, timezone, country, users_id) VALUES ('${streetaddress}', '${city}', '${state}', '${zipcode}', '${latitude}', '${longitude}', '${timezone}', '${country}', @last_id);

INSERT INTO persons (prefix, firstname, middlename, lastname, gender, birthdate, maritalstatus, zodiacsign, jobtitle, phone, users_id) VALUES ('${prefix}', '${firstname}', '${middlename}', '${lastname}', '${gender}', '${birthdate}', '${maritalstatus}', '${zodiacsign}', '${jobtitle}', '${phone}', @last_id);
INSERT INTO locations (streetAddress, city, state, zipCode, latitude, longitude, timezone, country, users_id) VALUES ('${streetaddress}', '${city}', '${state}', '${zipcode}', '${latitude}', '${longitude}', '${timezone}', '${country}', @last_id);
SET @prefix = '${prefix}';
SET @firstname = '${firstname}';
SET @middlename = '${middlename}';
SET @lastname = '${lastname}';
SET @gender = '${gender}';
SET @birthdate = '${birthdate}';
SET @maritalstatus = '${maritalstatus}';
SET @zodiacsign = '${zodiacsign}';
SET @jobtitle = '${jobtitle}';
SET @phone = '${phone}';
SET @streetaddress = '${streetaddress}';
SET @city = '${city}';
SET @state = '${state}';
SET @zipcode = '${zipcode}';
SET @latitude = '${latitude}';
SET @longitude = '${longitude}';
SET @timezone = '${timezone}';
SET @country = '${country}';  



START TRANSACTION;
SET @prefix = 'Ms.';
SET @firstname = 'johnathan';
SET @middlename = 'Hugh';
SET @lastname = 'cummerata';
SET @gender = 'male';
SET @birthdate = '2001-07-17';
SET @maritalstatus = 'Divorced';
SET @jobtitle = 'Central Brand Agent';
SET @phone = '453.296.2805';
SET @streetaddress = '29128 E River Road';
SET @city = 'Elianton';
SET @state = 'Wyoming';
SET @zipcode = '22507';
SET @latitude = '24.2837';
SET @longitude = '-176.7765';
SET @country = 'American Samoa';    
INSERT INTO users (username, password, email, role, image_url) VALUES (@firstname, @password, @email, 'user', @image_url);
SET @last_id = LAST_INSERT_ID();
INSERT INTO persons (prefix, firstname, middlename, lastname, gender, birthdate, maritalstatus, jobtitle, phone, users_id) VALUES (@prefix, @firstname, 'Hugh', 'cummerata', 'male', '2001-07-17', 'Divorced','Central Brand Agent', '453.296.2805', @last_id);
INSERT INTO locations (streetAddress, city, state, zipCode, latitude, longitude, country, users_id) VALUES ('29128 E River Road', 'Elianton', 'Wyoming', '22507', '24.2837', '-176.7765', 'American Samoa', @last_id);
COMMIT;

SET FOREIGN_KEY_CHECKS = 0;

-- Now truncate safely (any order)
TRUNCATE TABLE locations;
TRUNCATE TABLE persons;
TRUNCATE TABLE users;

-- Re-enable (critical!)
SET FOREIGN_KEY_CHECKS = 1;