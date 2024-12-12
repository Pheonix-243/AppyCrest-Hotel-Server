# AppyCrest Hotel - Backend

Welcome to the backend repository of the **AppyCrest Hotel and Restaurant Management System**, a **Fullstack** web application designed to provide a seamless experience for customers and administrators. This backend is built using **Node.js** and **Express.js**, and it powers the frontend interface, handling everything from room bookings to restaurant menu management and user authentication.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Running the Project](#running-the-project)
- [Contributing](#contributing)
- [License](#license)

## About the Project

The **AppyCrest Hotel Backend** is responsible for handling requests from the frontend, managing hotel room bookings, restaurant menu data, user accounts, and payments. This backend project is built using **Node.js** and **Express.js**, with a **MongoDB** database to store all the necessary data.

Key responsibilities of the backend:
- Handle room booking logic and availability.
- Manage restaurant menu and reservations.
- Handle user authentication and account management.
- Integrate with the **Paystack API** for secure payment processing.
- Provide admin capabilities for managing hotel operations.

## Features

- **Room Management:** Handles room availability, booking, and management.
- **Restaurant Management:** Handles menu items, reservations, and dining management.
- **User Authentication:** Secure login and registration with JWT (JSON Web Token).
- **Payment Processing:** Integrates with Paystack for booking payments.
- **Admin Interface:** Allows admins to manage rooms, bookings, users, and restaurant menus.

## Technologies Used

- **Node.js:** JavaScript runtime environment for building the backend.
- **Express.js:** Web framework for building APIs and handling requests.
- **MongoDB:** NoSQL database for storing room, user, booking, and menu data.
- **Mongoose:** ODM (Object Data Modeling) library for MongoDB, used to interact with the database.
- **JWT (JSON Web Tokens):** For secure user authentication.
- **Paystack API:** For handling payment transactions.

## Setup and Installation

To set up and run the backend locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Pheonix-243/appycrest-hotel-backend.git
   cd appycrest-hotel-backend
