import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './Pages/Home'
import Movies from './Pages/Movies'
import MovieDetails from './Pages/MovieDetails'
import SeatLayout from './Pages/SeatLayout'
import MyBookings from './Pages/MyBookings'
import Favorite from './Pages/Favorite'
import Footer from './components/footer'
import { Toaster } from "react-hot-toast";
import Layout from './Pages/admin/Layout';
import Dashboard from './Pages/admin/DashBoard';
import AddShows from './Pages/admin/AddShows';
import ListShows from './Pages/admin/ListShows';
import ListBookings from './Pages/admin/ListBooking';
import { useAppContext } from './context/AppContext';
import { SignIn } from '@clerk/clerk-react';
import Loading from './components/Loading';




function App() {

  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  const { user } = useAppContext();
  
  return (
    <>
       <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/loading/:nextUrl" element={<Loading />} />
        <Route path="/favorites" element={<Favorite />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            user ? (
              <Layout />
            ) : (
              <div className="min-h-screen flex justify-center items-center">
                <SignIn fallbackRedirectUrl={"/admin"} />
              </div>
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
    
  )
}

export default App
