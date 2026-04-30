import React, { useEffect, useState } from "react";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import isoTimeFormat from "../lib/isoTimeFormat";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { XIcon, CalendarIcon, ClockIcon, MonitorIcon, FilmIcon, TagIcon } from "lucide-react";

function MyBookings() {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, user, image_base_url } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const getMyBookings = async () => {
    try {
      const { data } = await axios.get("/api/user/bookings");
      if (data.success) setBookings(data.bookings || []);
      else toast.error(data.message || "Failed to fetch bookings");
    } catch { toast.error("Failed to load bookings"); }
    finally { setIsLoading(false); }
  };

  const handlePayNow = async (booking) => {
    try {
      setPayingId(booking._id);
      const { data } = await axios.post("/api/booking/pay-now", { bookingId: booking._id });
      if (!data.success) { toast.error(data.message); return; }
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        order_id: data.orderId,
        name: booking.show?.movie?.title || "Movie Booking",
        description: `${booking.bookedSeats?.length || 0} seat(s)`,
        handler: async function (response) {
          try {
            const verify = await axios.post("/api/booking/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });
            if (verify.data.success) { toast.success("Payment successful!"); getMyBookings(); }
            else toast.error("Payment verification failed");
          } catch { toast.error("Verification error"); }
        },
        modal: { ondismiss: () => toast("Payment cancelled") },
      };
      new window.Razorpay(options).open();
    } catch { toast.error("Payment failed"); }
    finally { setPayingId(null); }
  };

  const handleCancel = async (bookingId) => {
    try {
      setCancellingId(bookingId);
      const { data } = await axios.delete(`/api/booking/cancel/${bookingId}`);
      if (data.success) {
        toast.success("Booking cancelled successfully");
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
        setSelectedBooking(null);
      } else toast.error(data.message || "Cancellation failed");
    } catch { toast.error("Cancellation failed"); }
    finally { setCancellingId(null); setConfirmCancelId(null); }
  };

  useEffect(() => {
    if (user) getMyBookings();
    else setIsLoading(false);
  }, [user]);

  if (isLoading) return <Loading />;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 md:pt-40 pt-28 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <FilmIcon className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">My Bookings</h1>
        {bookings.length > 0 && (
          <span className="px-2.5 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/30">
            {bookings.length}
          </span>
        )}
      </div>

      {!user && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FilmIcon className="w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">Please login to view your bookings.</p>
        </div>
      )}

      {user && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FilmIcon className="w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg font-medium">No bookings yet!</p>
          <p className="text-gray-600 text-sm mt-1">Book a movie to see your tickets here.</p>
        </div>
      )}

      {/* ── Booking Cards ── */}
      <div className="flex flex-col gap-4 max-w-3xl">
        {bookings.map((item) => {
          const seats = Array.isArray(item.bookedSeats)
            ? item.bookedSeats
            : Object.values(item.bookedSeats || {});

          return (
            <div
              key={item._id}
              onClick={() => setSelectedBooking(item)}
              className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 to-transparent cursor-pointer hover:border-primary/40 hover:from-primary/14 transition-all duration-300"
            >
              {/* Poster */}
              <div className="relative md:w-36 shrink-0 overflow-hidden">
                <img
                  src={image_base_url + item.show?.movie?.poster_path}
                  alt="poster"
                  className="w-full h-full object-cover md:h-full h-40 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 md:block hidden" />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col md:flex-row justify-between p-4 gap-3">
                <div className="flex flex-col gap-1.5">
                  <p className="text-lg font-bold text-white leading-tight">
                    {item.show?.movie?.title}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {item.show?.movie?.genres?.slice(0, 2).map((g) => g.name).join(" · ")}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                      {item.show?.showDateTime ? dateFormat(item.show.showDateTime) : ""}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <ClockIcon className="w-3.5 h-3.5 text-primary" />
                      {item.show?.showDateTime ? isoTimeFormat(item.show.showDateTime) : ""}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <MonitorIcon className="w-3.5 h-3.5 text-primary" />
                      {item.show?.screen || "Screen 1"}
                    </div>
                  </div>

                  {/* Seat badges */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {seats.map((seat) => (
                      <span
                        key={seat}
                        className="px-2 py-0.5 bg-primary/15 border border-primary/25 rounded text-xs text-primary font-semibold"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right side */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-between shrink-0 gap-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {currency}{item.amount}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {seats.length} Ticket{seats.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${
                      item.isPaid
                        ? "bg-green-500/15 text-green-400 border border-green-500/25"
                        : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
                    }`}>
                      {item.isPaid ? "✓ Paid" : "⏳ Pending"}
                    </span>
                    <span className="text-xs text-primary/70 font-medium group-hover:text-primary transition">
                      View Ticket →
                    </span>
                  </div>
                </div>
              </div>

              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                item.isPaid ? "bg-green-500" : "bg-yellow-500"
              }`} />
            </div>
          );
        })}
      </div>

      {/* ── Cinema Ticket Modal ── */}
      {selectedBooking && (() => {
        const seats = Array.isArray(selectedBooking.bookedSeats)
          ? selectedBooking.bookedSeats
          : Object.values(selectedBooking.bookedSeats || {});

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => { setSelectedBooking(null); setConfirmCancelId(null); }}
          >
            <div
              className="relative w-full max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => { setSelectedBooking(null); setConfirmCancelId(null); }}
                className="absolute -top-9 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>

              {/* ── TOP ── */}
              <div className="bg-[#180810] rounded-t-3xl overflow-hidden shadow-2xl">

                {/* Backdrop */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={image_base_url + selectedBooking.show?.movie?.backdrop_path}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = image_base_url + selectedBooking.show?.movie?.poster_path;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#180810] via-[#180810]/60 to-black/30" />

                  {/* Status */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-bold shadow ${
                      selectedBooking.isPaid
                        ? "bg-green-500 text-white"
                        : "bg-yellow-400 text-black"
                    }`}>
                      {selectedBooking.isPaid ? "✓ CONFIRMED" : "⏳ PENDING"}
                    </span>
                  </div>

                  {/* Movie info */}
                  <div className="absolute bottom-3 left-4 flex items-end gap-3">
                    <img
                      src={image_base_url + selectedBooking.show?.movie?.poster_path}
                      alt=""
                      className="w-12 rounded-xl border-2 border-primary/50 shadow-xl"
                    />
                    <div>
                      <p className="text-white font-bold text-sm leading-tight drop-shadow">
                        {selectedBooking.show?.movie?.title}
                      </p>
                      <p className="text-gray-300 text-xs mt-0.5">
                        {selectedBooking.show?.movie?.genres?.slice(0, 2).map((g) => g.name).join(" · ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-3 mx-4 mt-4 rounded-2xl overflow-hidden border border-primary/15">
                  <div className="bg-primary/8 px-2 py-3 text-center">
                    <div className="flex justify-center mb-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-white text-xs font-bold">
                      {selectedBooking.show?.showDateTime
                        ? new Date(selectedBooking.show.showDateTime).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", timeZone: "Asia/Kolkata"
                          })
                        : "—"}
                    </p>
                  </div>
                  <div className="bg-primary/8 px-2 py-3 text-center border-x border-primary/15">
                    <div className="flex justify-center mb-1">
                      <ClockIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-0.5">Time</p>
                    <p className="text-white text-xs font-bold">
                      {selectedBooking.show?.showDateTime
                        ? isoTimeFormat(selectedBooking.show.showDateTime)
                        : "—"}
                    </p>
                  </div>
                  <div className="bg-primary/8 px-2 py-3 text-center">
                    <div className="flex justify-center mb-1">
                      <MonitorIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-0.5">Screen</p>
                    <p className="text-white text-xs font-bold">
                      {selectedBooking.show?.screen || "Screen 1"}
                    </p>
                  </div>
                </div>

                {/* Seats */}
                <div className="mx-4 mt-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="w-3.5 h-3.5 text-primary" />
                    <p className="text-gray-400 text-xs uppercase tracking-widest">
                      {seats.length} Seat{seats.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seats.map((seat) => (
                      <span
                        key={seat}
                        className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-lg text-xs text-primary font-bold"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── TEAR LINE ── */}
              <div className="relative flex items-center h-5 bg-[#180810]">
                <div className="absolute -left-2.5 w-5 h-5 bg-black/80 rounded-full shadow-inner" />
                <div className="flex-1 border-t-2 border-dashed border-primary/25 mx-5" />
                <div className="absolute -right-2.5 w-5 h-5 bg-black/80 rounded-full shadow-inner" />
              </div>

              {/* ── BOTTOM ── */}
              <div className="bg-[#180810] rounded-b-3xl px-4 pb-4 pt-2 shadow-2xl">

                {/* Amount + ID */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-widest">Total</p>
                    <p className="text-primary text-2xl font-black">{currency}{selectedBooking.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-xs uppercase tracking-widest">Booking ID</p>
                    <p className="text-gray-400 text-xs font-mono font-bold tracking-wider">
                      #{selectedBooking._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Barcode */}
                <div className="flex gap-px justify-center mb-3 opacity-15">
                  {Array.from({ length: 44 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-sm"
                      style={{
                        width: i % 3 === 0 ? "3px" : i % 2 === 0 ? "2px" : "1px",
                        height: i % 5 === 0 ? "28px" : "20px",
                      }}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!selectedBooking.isPaid && (
                    <button
                      onClick={() => { handlePayNow(selectedBooking); setSelectedBooking(null); }}
                      disabled={payingId === selectedBooking._id}
                      className="w-full py-2.5 bg-primary hover:bg-primary-dull rounded-full font-bold text-sm transition cursor-pointer disabled:opacity-60 active:scale-95"
                    >
                      {payingId === selectedBooking._id ? "Opening..." : "Pay Now"}
                    </button>
                  )}

                  {confirmCancelId === selectedBooking._id ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-gray-400">Are you sure you want to cancel?</p>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setConfirmCancelId(null)}
                          className="flex-1 py-2 text-xs rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 transition cursor-pointer"
                        >
                          No
                        </button>
                        <button
                          onClick={() => handleCancel(selectedBooking._id)}
                          disabled={cancellingId === selectedBooking._id}
                          className="flex-1 py-2 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white transition cursor-pointer disabled:opacity-60"
                        >
                          {cancellingId === selectedBooking._id ? "Cancelling..." : "Yes, Cancel"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancelId(selectedBooking._id)}
                      className="w-full py-2 text-xs rounded-full border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer active:scale-95"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default MyBookings;