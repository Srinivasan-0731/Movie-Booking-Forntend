import React, { useEffect, useState } from "react";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

function MyBookings() {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, user, image_base_url } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [payingId, setPayingId] = useState(null);

  const getMyBookings = async () => {
    try {
      const { data } = await axios.get("/api/user/bookings");
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async (booking) => {
    try {
      setPayingId(booking._id);

      // Create Razorpay order for existing booking
      const { data } = await axios.post("/api/booking/pay-now", {
        bookingId: booking._id,
      });

      if (!data.success) {
        toast.error(data.message || "Payment initiation failed");
        return;
      }

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
            if (verify.data.success) {
              toast.success("Payment successful! Booking confirmed.");
              getMyBookings(); 
            } else {
              toast.error("Payment verification failed");
            }
          } catch {
            toast.error("Verification error");
          }
        },
        modal: {
          ondismiss: () => toast("Payment cancelled"),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment failed");
      console.error(error);
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      setCancellingId(bookingId);
      const { data } = await axios.delete(`/api/booking/cancel/${bookingId}`);
      if (data.success) {
        toast.success("Booking cancelled successfully");
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        toast.error(data.message || "Cancellation failed");
      }
    } catch (error) {
      toast.error("Cancellation failed");
      console.error(error);
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  };

  useEffect(() => {
    if (user) {
      getMyBookings();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) return <Loading />;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 md:pt-40 pt-28 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      <h1 className="text-lg font-semibold mb-6">My Bookings</h1>

      {!user && (
        <p className="text-gray-400">Please login to view your bookings.</p>
      )}

      {user && bookings.length === 0 && (
        <p className="text-gray-400">No bookings found.</p>
      )}

      {bookings.map((item) => {
        const seats = Array.isArray(item.bookedSeats)
          ? item.bookedSeats
          : Object.values(item.bookedSeats || {});

        const isPending = !item.isPaid;

        return (
          <div
            key={item._id}
            className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
          >
            
            <div className="flex flex-col md:flex-row">
              <img
                src={image_base_url + item.show?.movie?.poster_path}
                alt="poster"
                className="md:max-w-45 aspect-video object-cover rounded"
              />
              <div className="flex flex-col p-4">
                <p className="text-lg font-semibold">{item.show?.movie?.title}</p>
                <p className="text-gray-400 text-sm">
                  {timeFormat(item.show?.movie?.runtime)}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {item.show?.showDateTime ? dateFormat(item.show.showDateTime) : ""}
                </p>
              
                <span
                  className={`mt-2 w-fit px-3 py-0.5 text-xs rounded-full font-semibold ${
                    item.isPaid
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {item.isPaid ? "✓ Paid" : "⏳ Payment Pending"}
                </span>
              </div>
            </div>

            
            <div className="flex flex-col md:items-end md:text-right justify-between p-4">
              <div>
                <p className="text-2xl font-semibold mb-1">
                  {currency}{item.amount}
                </p>
                <div className="text-sm mb-3">
                  <p>
                    <span className="text-gray-400">Total Tickets: </span>
                    {seats.length}
                  </p>
                  <p>
                    <span className="text-gray-400">Seats: </span>
                    {seats.join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
              
                {isPending && (
                  <button
                    onClick={() => handlePayNow(item)}
                    disabled={payingId === item._id}
                    className="px-6 py-2 text-sm bg-primary hover:bg-primary-dull rounded-full font-bold transition cursor-pointer disabled:opacity-60 active:scale-95"
                  >
                    {payingId === item._id ? "Opening..." : "Pay Now"}
                  </button>
                )}

                
                {confirmCancelId === item._id ? (
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm text-gray-400">Cancel this booking?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmCancelId(null)}
                        className="px-3 py-1 text-xs rounded-full border border-gray-500 text-gray-300 hover:bg-gray-700 transition cursor-pointer"
                      >
                        No
                      </button>
                      <button
                        onClick={() => handleCancel(item._id)}
                        disabled={cancellingId === item._id}
                        className="px-3 py-1 text-xs rounded-full bg-red-600 hover:bg-red-700 text-white transition cursor-pointer disabled:opacity-60"
                      >
                        {cancellingId === item._id ? "Cancelling..." : "Yes, Cancel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmCancelId(item._id)}
                    className="px-4 py-1.5 text-xs rounded-full border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MyBookings;