import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRightIcon, ClockIcon, ArrowLeftIcon, MonitorIcon } from 'lucide-react';
import BlurCircle from '../components/BlurCircle';
import isoTimeFormat from "../lib/isoTimeFormat";
import imgLoad from "../assets/screenImage.svg"
import Loading from '../components/Loading';
import { useAppContext } from '../context/AppContext';

function SeatLayout() {

  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [showReview, setShowReview] = useState(false);

  const navigate = useNavigate();
  const { axios, user, image_base_url } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success && data.movie) {
        setShow(data);
      } else {
        toast.error(data.message || "Show not found");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load show");
    }
  };

  const getScreens = () => {
    if (!show?.dateTime || !date) return [];
    const dateData = show.dateTime[date];
    if (!dateData || typeof dateData !== 'object') return [];

    return Object.keys(dateData).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
  };

  const getTimesForScreen = () => {
    if (!show?.dateTime || !date || !selectedScreen) return [];
    const dateData = show.dateTime[date];
    if (!dateData) return [];
    return dateData[selectedScreen] || [];
  };

  const getShowPrice = () => {
    if (selectedTime?.showPrice) return Number(selectedTime.showPrice);
    if (show?.showPrice) return Number(show.showPrice);
    return 0;
  };

  const handleSeatClick = (seatId) => {
    if (!selectedScreen) return toast("Please select a screen first");
    if (!selectedTime) return toast("Please select time first");
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast("Maximum 5 seats only");
    }
    if (occupiedSeats.includes(seatId)) {
      return toast("This seat is already booked");
    }
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId]
    );
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className='flex gap-2 mt-2'>
      <span className='w-5 text-xs text-gray-500 flex items-center'>{row}</span>
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`;
        const isOccupied = occupiedSeats.includes(seatId);
        const isSelected = selectedSeats.includes(seatId);
        return (
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            disabled={isOccupied}
            className={`h-8 w-8 rounded text-xs border cursor-pointer transition
              ${isSelected
                ? "bg-primary border-primary text-white"
                : isOccupied
                ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed opacity-50"
                : "border-primary/60 hover:bg-primary/20"
              }`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`);
      if (data.success) {
        const seats = Array.isArray(data.occupiedSeats)
          ? data.occupiedSeats
          : Object.keys(data.occupiedSeats || {});
        setOccupiedSeats(seats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const showPrice = getShowPrice();
  const totalPrice = selectedSeats.length * showPrice;
  const convenienceFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + convenienceFee;

  const handleProceed = () => {
    if (!user) return toast.error("Please login to proceed");
    if (!selectedScreen) return toast.error("Please select a screen");
    if (!selectedTime) return toast.error("Please select a showtime");
    if (!selectedSeats.length) return toast.error("Please select at least one seat");
    setShowReview(true);
    scrollTo(0, 0);
  };

  const bookTickets = async () => {
    try {
      const { data } = await axios.post("/api/booking/create", {
        showId: selectedTime.showId,
        selectedSeats,
      });

      if (data.success) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: "INR",
          order_id: data.orderId,
          handler: async function (response) {
            const verify = await axios.post("/api/booking/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: data.bookingId,
            });
            if (verify.data.success) {
              toast.success("Booking confirmed!");
              navigate("/my-bookings");
            } else {
              toast.error("Payment verification failed");
            }
          },
          modal: {
            ondismiss: () => toast("Payment cancelled"),
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Pay Later — booking create pannuchu but payment pending
  const payLater = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");

      const { data } = await axios.post("/api/booking/create", {
        showId: selectedTime.showId,
        selectedSeats,
        payLater: true,
      });

      if (data.success) {
        toast.success("Booking saved! Pay at counter.");
        navigate("/my-bookings");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => { getShow(); }, []);

  useEffect(() => {
    if (selectedTime) getOccupiedSeats();
  }, [selectedTime]);

  useEffect(() => {
    if (show) {
      const screens = getScreens();
      if (screens.length > 0 && !selectedScreen) {
        setSelectedScreen(screens[0]);
      }
    }
  }, [show, date]);

  if (!show) return <Loading />;

  const screens = getScreens();
  const timesForScreen = getTimesForScreen();

  if (showReview) {
    return (
      <div className='min-h-screen px-6 md:px-16 lg:px-40 py-30 md:pt-40'>
        <button
          onClick={() => setShowReview(false)}
          className='flex items-center gap-2 text-gray-400 hover:text-white mb-8 cursor-pointer transition'
        >
          <ArrowLeftIcon className='w-4 h-4' />
          Back to seat selection
        </button>

        <h1 className='text-2xl font-semibold mb-8'>Booking Review</h1>

        <div className='max-w-xl bg-primary/8 border border-primary/20 rounded-xl p-6 space-y-5'>

          <div className='flex gap-4'>
            <img
              src={image_base_url + show.movie.poster_path}
              alt='poster'
              className='w-20 rounded-lg object-cover'
            />
            <div>
              <p className='text-lg font-semibold'>{show.movie.title}</p>
              <p className='text-sm text-gray-400 mt-1'>
                {show.movie.genres?.map((g) => g.name).join(", ")}
              </p>
              <p className='text-sm text-gray-400'>
                {show.movie.release_date ? new Date(show.movie.release_date).getFullYear() : ""}
              </p>
            </div>
          </div>

          <hr className='border-primary/20' />

          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Date</span>
              <span>{new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Screen</span>
              <span className='text-primary font-medium'>{selectedScreen}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Showtime</span>
              <span>{isoTimeFormat(selectedTime.time)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Seats</span>
              <span className='text-right max-w-[60%]'>{selectedSeats.join(", ")}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Total Seats</span>
              <span>{selectedSeats.length}</span>
            </div>
          </div>

          <hr className='border-primary/20' />

          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Price per seat</span>
              <span>{currency}{showPrice}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} × {currency}{showPrice}</span>
              <span>{currency}{totalPrice}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Convenience fee (5%)</span>
              <span>{currency}{convenienceFee}</span>
            </div>
          </div>

          <hr className='border-primary/20' />

          <div className='flex justify-between text-lg font-semibold'>
            <span>Total Payable</span>
            <span className='text-primary'>{currency}{grandTotal}</span>
          </div>

          
          <button
            onClick={bookTickets}
            className='w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-bold cursor-pointer active:scale-95'
          >
            Confirm & Pay
            <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
          </button>

          
          <button
            onClick={payLater}
            className='w-full flex items-center justify-center gap-2 py-3 border border-primary/50 hover:bg-primary/10 transition rounded-full font-bold cursor-pointer active:scale-95 text-primary'
          >
            Pay Later (At Counter)
          </button>

          <p className='text-xs text-gray-500 text-center'>
            * Pay Later bookings must be paid at the counter before showtime
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50 gap-12'>

    
      <div className='w-64 bg-primary/10 border border-primary/20 rounded-lg py-8 md:sticky md:top-30'>

        <p className='text-lg font-semibold px-6 mb-4'>Select Screen</p>
        <div className='space-y-1 mb-4'>
          {screens.length > 0 ? screens.map((screen) => (
            <div
              key={screen}
              onClick={() => {
                setSelectedScreen(screen);
                setSelectedTime(null);
                setSelectedSeats([]);
                setOccupiedSeats([]);
              }}
              className={`flex items-center gap-2 px-6 py-2 cursor-pointer transition rounded-r-md ${
                selectedScreen === screen
                  ? "bg-primary text-white"
                  : "hover:bg-primary/20"
              }`}
            >
              <MonitorIcon className='w-4 h-4' />
              <p className='text-sm font-medium'>{screen}</p>
            </div>
          )) : (
            <p className='text-sm text-gray-400 px-6'>No screens available for this date</p>
          )}
        </div>

        {selectedScreen && timesForScreen.length > 0 && (
          <>
            <hr className='border-primary/20 mx-4 mb-4' />
            <p className='text-sm font-semibold px-6 mb-3 text-gray-300'>Available Timing</p>
            <div className='space-y-1'>
              {timesForScreen.map((item) => (
                <div
                  key={item.showId}
                  onClick={() => { setSelectedTime(item); setSelectedSeats([]); }}
                  className={`flex items-center gap-2 px-6 py-2 cursor-pointer transition rounded-r-md ${
                    selectedTime?.showId === item.showId
                      ? "bg-primary text-white"
                      : "hover:bg-primary/20"
                  }`}
                >
                  <ClockIcon className='w-4 h-4' />
                  <p className='text-sm'>{isoTimeFormat(item.time)}</p>
                  {item.showPrice && (
                    <p className='text-xs ml-auto text-gray-300'>{currency}{item.showPrice}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {selectedScreen && timesForScreen.length === 0 && (
          <>
            <hr className='border-primary/20 mx-4 mb-4' />
            <p className='text-sm text-gray-400 px-6'>No showtimes for this screen</p>
          </>
        )}
      </div>

      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
        <BlurCircle top='-100px' left='-100px' />
        <BlurCircle bottom='0' right='0' />

        <h1 className='text-2xl font-semibold mb-2'>Select your seat</h1>
        {selectedScreen && (
          <p className='text-primary text-sm font-medium mb-2'>{selectedScreen}</p>
        )}
        <img src={imgLoad} alt='screen' />
        <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>

        <div className='flex items-center gap-6 mb-6 text-xs text-gray-400'>
          <div className='flex items-center gap-1'>
            <div className='w-5 h-5 rounded border border-primary/60'></div>
            <span>Available</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-5 h-5 rounded bg-primary border-primary'></div>
            <span>Selected</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-5 h-5 rounded bg-gray-700 border-gray-600 opacity-50'></div>
            <span>Booked</span>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
          {groupRows[0].map((row) => renderSeats(row))}
        </div>
        <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
          {groupRows.slice(1).map((group, index) => (
            <div key={index}>{group.map((row) => renderSeats(row))}</div>
          ))}
        </div>

        {selectedSeats.length > 0 && (
          <div className='mt-8 w-full max-w-md bg-primary/10 border border-primary/20 rounded-xl px-6 py-4 flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-400'>
                Selected: <span className='text-white font-medium'>{selectedSeats.join(", ")}</span>
              </p>
              <p className='text-sm text-gray-400 mt-1'>
                {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} × {currency}{showPrice}
              </p>
            </div>
            <p className='text-xl font-bold text-primary'>{currency}{totalPrice}</p>
          </div>
        )}

        <button
          onClick={handleProceed}
          className='flex items-center gap-1 mt-8 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-bold cursor-pointer active:scale-95'
        >
          Review Booking
          <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}

export default SeatLayout;