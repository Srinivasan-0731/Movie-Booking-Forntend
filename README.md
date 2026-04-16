# Movie Booking Frontend

Frontend for the **Movie Booking Application** built with **React + Vite**.
Users can browse movies, view showtimes, book tickets, manage favorites, and make payments.

This frontend communicates with the **Movie Booking Backend API**.

---

# Login accuracy

Hello,

Thank you for reviewing the application.

* Demo Login Credentials:

Email: [sp2392546@gmail.com]
Password: movies@2026

* Demo SignUp Credentials:

FullName: Srinivasan
Email: [sp2392546@gmail.com]
Phone: [8056475810]
Password: movies@2026

* Instructions:

1. Login using the above account.
2. You can test movie booking, favorites, and admin dashboard.
3. For payment, Razorpay test mode is enabled.

* Admin Access:

Open /admin after login to access admin dashboard.
admin Email: [sp2392546@gmail.com]
admin how to open in https://localhost:5173/admin

---

# Features

* Browse movies and showtimes
* View detailed movie information
* Favorite movies system 
* Seat selection for shows
* Secure ticket booking
* Online payment (Stripe / Razorpay)
* User authentication with **Clerk**
* Booking history page
* Responsive UI

---

# Tech Stack

* **React**
* **Vite**
* **Tailwind CSS**
* **React Router**
* **Axios**
* **Clerk Authentication**
* **TMDB Image API**
* **React Hot Toast**

---

# Installation

### Clone repository


git clone https://github.com/yourusername/movie-booking-frontend.git
```

---

### Navigate to project


cd movie-booking-frontend
```

---

### Install dependencies

npm install
```

---

### Create `.env` file


VITE_BASE_URL=http://localhost:3000

VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

---

# Run Development Server


npm run dev
```

App runs on:

http://localhost:5173
```

---

# Authentication

User authentication handled by **Clerk**.

Features include:

* Login
* Signup
* Session management
* Protected routes

---

# Movie Data

Movie information such as:

* Title
* Poster
* Cast
* Runtime
* Ratings

comes from **TMDB API**.

Images are loaded using:


https://image.tmdb.org/t/p/orginal
```

---

# Backend API

Frontend communicates with the backend using **Axios**.

Example request:


axios.get("/api/show/all")
```

---

# Favorite Movies

Users can:

* Add movies to favorites
* Remove movies from favorites
* View favorite movies page

Favorites are stored in **Clerk user metadata**.

---

# Booking Flow

Select Movie
↓
Choose Date & Time
↓
Select Seats
↓
Make Payment
↓
Booking Confirmation
```

---

# Responsive Design

UI is built with **Tailwind CSS** and optimized for:

* Desktop
* Tablet
* Mobile

---

# Future Improvements

* Trailer preview
* Movie search
* Seat locking system
* Notification system
* Dark mode

---

# Support

If you like this project:

 Star the repository
🍴 Fork it
🛠 Contribute improvements
