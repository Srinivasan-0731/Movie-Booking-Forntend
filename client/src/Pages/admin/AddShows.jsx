import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import { kConverter } from "../../lib/kConverter";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";

const SCREENS = ["Screen 1", "Screen 2", "Screen 3"];

function AddShows() {
  const { axios, user, image_base_url } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [selectMovie, setSelectMovie] = useState(null);
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [addingShow, setAddingShow] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState("Screen 1");

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get("/api/show/now-playing");
      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const screenTimes = prev[date]?.[selectedScreen] || [];
      if (!screenTimes.includes(time)) {
        return {
          ...prev,
          [date]: {
            ...(prev[date] || {}),
            [selectedScreen]: [...screenTimes, time],
          },
        };
      }
      return prev;
    });
    setDateTimeInput("");
  };

  const handleRemoveTime = (date, screen, time) => {
    setDateTimeSelection((prev) => {
      const filtered = prev[date][screen].filter((t) => t !== time);
      const updatedScreens = { ...prev[date], [screen]: filtered };
      if (filtered.length === 0) delete updatedScreens[screen];
      if (Object.keys(updatedScreens).length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: updatedScreens };
    });
  };

  const handleSubmit = async () => {
    if (
      !selectMovie ||
      !showPrice ||
      Number(showPrice) <= 0 ||
      Object.keys(dateTimeSelection).length === 0
    ) {
      return toast.error("Invalid input");
    }

    // date → screen → times format showsInput build 
    const showsInput = Object.entries(dateTimeSelection).flatMap(
      ([date, screens]) =>
        Object.entries(screens).flatMap(([screen, times]) =>
          times.map((time) => ({ date, time, screen }))
        )
    );

    try {
      setAddingShow(true);
      const { data } = await axios.post("/api/show/add", {
        movieId: selectMovie,
        showsInput,
        showPrice: Number(showPrice),
      });

      if (data.success) {
        toast.success(data.message);
        setSelectMovie(null);
        setDateTimeSelection({});
        setShowPrice("");
        setSelectedScreen("Screen 1");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong");
    } finally {
      setAddingShow(false);
    }
  };

  useEffect(() => {
    if (user) fetchNowPlayingMovies();
  }, [user]);

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />

      <p className="mt-10 text-lg font-bold">Now Playing Movies</p>

      <div className="overflow-x-auto pb-4">
        <div className="flex flex-wrap gap-4 mt-4">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              className="relative max-w-40 cursor-pointer hover:-translate-y-1 transition"
              onClick={() => {
                setSelectMovie(movie.id);
                setDateTimeSelection({});  
                setShowPrice("");
                setSelectedScreen("Screen 1");
              }}
            >
              <div className="rounded-lg overflow-hidden">
                <img
                  src={image_base_url + movie.poster_path}
                  alt=""
                  className="w-full object-cover"
                />
              </div>
              <div className="text-sm flex justify-between p-1">
                <span className="flex items-center gap-1 text-gray-400">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-gray-400">{kConverter(movie.vote_count)}</span>
              </div>
              {selectMovie === movie.id && (
                <div className="absolute top-2 right-2 bg-green-500 p-1 rounded">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}
              <p className="font-bold truncate">{movie.title}</p>
              <p className="text-sm text-gray-400">{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="block font-bold mb-2">Show Price</label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{currency}</span>
          <input
            type="number"
            min={0}
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter show price"
            className="border px-3 py-2 rounded"
          />
        </div>
        {showPrice && (
          <p className="mt-2 text-green-500 font-semibold">
            {currency} {showPrice}
          </p>
        )}
      </div>

      <div className="mt-6">
        <label className="block font-bold mb-2">Select Screen</label>
        <div className="flex gap-3">
          {SCREENS.map((screen) => (
            <button
              key={screen}
              onClick={() => setSelectedScreen(screen)}
              className={`px-4 py-2 rounded border text-sm font-medium cursor-pointer transition ${
                selectedScreen === screen
                  ? "bg-primary text-white border-primary"
                  : "border-gray-500 text-gray-300 hover:border-primary hover:text-primary"
              }`}
            >
              {screen}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-green-500 font-semibold">
          Selected: {selectedScreen}
        </p>
      </div>

      <div className="mt-6">
        <label className="block font-bold mb-2">Select Date & Time</label>
        <div className="flex gap-3">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="border px-3 py-2 rounded cursor-pointer"
          />
          <button
            onClick={handleDateTimeAdd}
            className="bg-blue-500 text-white px-4 rounded cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <p className="font-bold mb-2">Selected Date-Time</p>
          {Object.entries(dateTimeSelection).map(([date, screens]) => (
            <div key={date} className="mb-3">
              <p className="font-semibold">{date}</p>
              {Object.entries(screens).map(([screen, times]) => (
                <div key={screen} className="ml-4 mt-1">
                  <p className="text-sm text-primary font-medium">{screen}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {times.map((time) => (
                      <div key={time} className="border px-2 py-1 rounded flex items-center">
                        <span>{time}</span>
                        <DeleteIcon
                          size={14}
                          className="ml-2 text-red-500 cursor-pointer"
                          onClick={() => handleRemoveTime(date, screen, time)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={addingShow}
        className="bg-green-600 text-white px-6 py-2 mt-6 rounded cursor-pointer disabled:bg-gray-400"
      >
        {addingShow ? "Adding..." : "Add Show"}
      </button>
    </>
  ) : (
    <Loading />
  );
}

export default AddShows;