# RailScope 🚆

RailScope is a train search application built using Spring Boot, MySQL, JPA, JDBC, HTML, CSS, and JavaScript.

The application allows users to:

- View all available trains
- Search train schedules using station codes
- Search train schedules using station names

---

## Technologies Used

### Backend
- Java
- Spring Boot
- Spring Data JPA
- JDBC
- MySQL

### Frontend
- HTML
- CSS
- JavaScript

---

## Project Structure

Backend Structure:

src/main/java/com/Genie/Train

├── Controller

├── Service

├── Repo

├── dao

├── entity

└── TrainApplication

---

Frontend Structure:

├── Index.html

├── Style.css

└── Script.js

---

## Features

### 1. Get All Trains

Returns all trains available in the database.

```http
GET /trains
```

Example:

```http
http://localhost:8000/trains
```

---

### 2. Search By Station Code

Search train schedules using source and destination station codes.

```http
GET /search/by-code
```

Parameters:

| Parameter | Example |
|------------|------------|
| sourceCode | NDLS |
| destinationCode | CST |

Example:

```http
http://localhost:8000/search/by-code?sourceCode=NDLS&destinationCode=CST
```

---

### 3. Search By Station Name

Search train schedules using source and destination station names.

```http
GET /search/by-name
```

Parameters:

| Parameter | Example |
|------------|------------|
| sourceName | New Delhi |
| destinationName | Mumbai |

Example:

```http
http://localhost:8000/search/by-name?sourceName=New Delhi&destinationName=Mumbai 
```

---

### 4. Insert Sample Data

A test API is provided to insert predefined train data into the database.

```http
GET /test
```

Example:

```http
http://localhost:8000/test
```

Run this endpoint once after creating the database.

---

## Database Setup

### Create Database

```sql
CREATE DATABASE train;
```

Update database credentials inside:

```properties
application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/train
spring.datasource.username=root
spring.datasource.password=your_password
```

---

## How To Run

### Step 1: Clone Repository

```bash
git clone <repository-url>
```

### Step 2: Open Backend Project

Open the Spring Boot project in IntelliJ IDEA or Eclipse.

### Step 3: Configure MySQL

Create the database and update credentials in `application.properties`.

### Step 4: Run Backend

Run:

```java
TrainApplication.java
```

Spring Boot server will start on:

```http
http://localhost:8086
```

### Step 5: Load Sample Data

Open:

```http
http://localhost:8000/test
```

This inserts predefined train and station data into the database.

### Step 6: Run Frontend

Open:

```html
index.html
```

in your browser.

The frontend fetches data from Spring Boot APIs using JavaScript.

---

## Future Enhancements

- User Authentication
- Seat Availability
- Fare Calculation
- Live Train Status
- Ticket Booking
- Admin Dashboard

---

## Author

Nitin Dagar

Java Backend Developer
