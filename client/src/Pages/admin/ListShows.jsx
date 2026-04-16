import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";

function ListShows() {
  const { axios, isAdmin, adminLoading } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);


  const getAllShow = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get("/api/admin/all-shows");

      if (data.success) {
        setShows(data.shows);
      } else {
        console.log("API ERROR:", data.message);
      }
    } catch (error) {
      console.error("Error fetching shows:", error);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (!adminLoading && isAdmin) {
      getAllShow();
    }
  }, [adminLoading, isAdmin]);

  
  if (adminLoading) return <Loading />;


  if (!isAdmin) {
    return <p className="text-red-500">Access Denied</p>;
  }

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="List" text2="Shows" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 pl-5">Movie Name</th>
              <th className="p-2">Show Time</th>
              <th className="p-2">Total Bookings</th>
              <th className="p-2">Earnings</th>
            </tr>
          </thead>

          <tbody>
            {shows.length > 0 ? (
              shows.map((show, index) => {
                const totalBookings = Object.keys(
                  show.occupiedSeats || {}
                ).length;

                return (
                  <tr
                    key={index}
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                  >
                    <td className="p-2 pl-5">
                      {show.movie?.title || "N/A"}
                    </td>

                    <td className="p-2">
                      {dateFormat(show.showDateTime)}
                    </td>

                    <td className="p-2">{totalBookings}</td>

                    <td className="p-2">
                      {currency} {totalBookings * show.showPrice}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  No shows available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ListShows;