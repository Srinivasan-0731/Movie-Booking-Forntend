import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Movies from "./Pages/Movies";
import MovieDetails from "./Pages/MovieDetails";
import SeatLayout from "./Pages/SeatLayout";
import MyBookings from "./Pages/MyBookings";
import Favorite from "./Pages/Favorite";
import MyAccount from "./Pages/MyAccount";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import Layout from "./Pages/admin/Layout";
import Dashboard from "./Pages/admin/DashBoard";
import AddShows from "./Pages/admin/AddShows";
import ListShows from "./Pages/admin/ListShows";
import ListBookings from "./Pages/admin/ListBooking";
import { useAppContext } from "./context/AppContext";
import Loading from "./components/Loading";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";

function App() {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  
  const { user } = useAppContext();

  return (
    <>
      <Toaster />

      {/* Navbar */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/loading/:nextUrl" element={<Loading />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected User Routes */}
        <Route
          path="/my-bookings"
          element={user ? <MyBookings /> : <LoginPage />}
        />
        <Route
          path="/favorites"
          element={user ? <Favorite /> : <LoginPage />}
        />
        <Route
          path="/my-account"
          element={user ? <MyAccount /> : <LoginPage />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={user ? <Layout /> : <LoginPage />}
        >
          <Route index element={<Dashboard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>
      </Routes>

      {/* Footer */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;