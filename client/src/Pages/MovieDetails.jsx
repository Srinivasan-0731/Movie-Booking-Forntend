import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircleIcon, StarIcon, X, UserCircle2 } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const abortControllerRef = useRef(null);

  const { shows, axios, user, fetchFavoriteMovies, favoriteMovies, image_base_url } = useAppContext();

  const getShow = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setShow(null);
    setShowTrailer(false);

    try {
      const { data } = await axios.get(`/api/show/${id}`, {
        signal: abortControllerRef.current.signal,
      });

      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;
      console.error(error);
      toast.error("Failed to fetch show details");
    }
  };

  const handleFavorite = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");
      const { data } = await axios.post('/api/user/favorites', { movieId: id });
      if (data.success) {
        await fetchFavoriteMovies();
        toast.success(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update favorites");
    }
  };

  useEffect(() => {
    getShow();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);

  return show ? (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">

    
      {showTrailer && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white hover:text-primary transition"
            >
              <X className="w-7 h-7 mt-8 cursor-pointer" />
            </button>
            {show.trailerKey ? (
              <iframe
                className="w-full h-96 rounded-xl mx-auto"
                src={`https://www.youtube.com/embed/${show.trailerKey}?autoplay=1`}
                title="Movie Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-900 rounded-xl">
                <p className="text-gray-400">Trailer not available</p>
              </div>
            )}
          </div>
        </div>
      )}

      
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={image_base_url + show.movie.poster_path}
          alt="poster"
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />
          <p className="text-primary">ENGLISH</p>
          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>
          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>
          <p>
            {timeFormat(show.movie.runtime)} •{" "}
            {show.movie.genres.map((genre) => genre.name).join(", ")} •{" "}
            {show.movie.release_date.split("-")[0]}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button
              onClick={() => setShowTrailer(true)}
              className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>
            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </a>
            <button
              onClick={handleFavorite}
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <Heart
                className={`w-5 h-5 ${
                  favoriteMovies.find((movie) => movie._id === id)
                    ? "fill-primary text-primary"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      
      {show.cast && show.cast.length > 0 && (
        <div className="mt-14 max-w-6xl mx-auto">
          <h2 className="text-lg font-medium mb-6">Cast</h2>
          <div className="flex gap-6 overflow-x-auto pb-3 scrollbar-hide">
            {show.cast.map((member) => (
              <div
                key={member.id}
                className="flex flex-col items-center gap-2 min-w-[90px]"
              >
                {member.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover object-top border-2 border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                    <UserCircle2 className="w-10 h-10 text-gray-500" />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-medium text-white leading-tight">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">
                    {member.character}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DateSelect dateTime={show.dateTime} id={id} />

      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>

      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {shows.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show more
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetails;