# UniRaum Reservation Platform: Full-Stack Space Booking System

This project was developed as an innovative solution to address a crucial student pain point regarding the booking of shared university spaces. It was created as part of the **Digital Transformation** course curriculum, focusing on leveraging technology to modernize campus resource management.

The platform is a secure, full-stack web application designed to manage the booking of university spaces, classrooms, and study halls. Its primary goals are to simplify the reservation process for student groups and establish accountability for usage, assisting with maintenance and damage control.

The application is built on a modern JavaScript stack, separating concerns between a robust API and a responsive user interface.

## Project Structure

The repository is organized into two primary, interdependent modules:

* **uniraum-backend:** Contains the server-side logic, API endpoints, database models, and core configuration.
* **uniraum-frontend:** Contains the client-side application, user interface components, and state management.

## Technical Stack

* **Backend:** Node.js (Express Framework)
    * **Architecture:** Adheres to the Model-View-Controller (MVC) pattern (utilizing separate `controllers`, `models`, and `routes` folders).
    * **Security:** Utilizes environment variables (`.env`) for storing all sensitive credentials (Database URI, Secret Keys).
* **Frontend:** JavaScript Framework (React/Vue/Angular - specify if known)
    * **Purpose:** Provides a seamless, interactive interface for students to view space availability and submit booking requests.

## Key Features

1.  **Space Reservation:** Allows authorized users (students/staff) to reserve university spaces based on availability.
2.  **Usage Accountability:** Tracks which user/group is responsible for a reserved space during a specific time slot, crucial for damage accountability.
3.  **Authentication & Authorization:** Secure user login and role-based access to management features.
4.  **Modular API Design:** Clear separation of concerns in the backend facilitates maintenance and scaling.

## Setup and Local Execution

To run this application locally, both the backend and frontend must be set up independently.

### 1. Prerequisites

* Node.js (LTS Version recommended)
* A Database Instance (e.g., MongoDB, PostgreSQL)

### 2. Backend Setup (`uniraum-backend`)

1.  Navigate to the backend directory:
    ```bash
    cd uniraum-backend
    ```
2.  Install all required dependencies:
    ```bash
    npm install
    ```
3.  **Crucial Step:** Create a file named **`.env`** in the `uniraum-backend` directory. This file must contain your private credentials (Database connection string, API keys, and Secret Keys). ***Do not use example values from production.***
4.  Run the server:
    ```bash
    node server.js
    # or npm start, depending on your setup
    ```

### 3. Frontend Setup (`uniraum-frontend`)

1.  Navigate to the frontend directory:
    ```bash
    cd uniraum-frontend
    ```
2.  Install all required dependencies:
    ```bash
    npm install
    ```
3.  Run the client application:
    ```bash
    npm start
    ```
    The application will typically open in your browser at a specified local port (e.g., http://localhost:3000).
