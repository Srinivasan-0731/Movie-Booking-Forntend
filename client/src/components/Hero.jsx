import React from 'react'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import video from "../assets/MovieBannerVideo.mp4"

function Hero() {

    const navigate = useNavigate();

    return (
        <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36
         bg-cover bg-center h-screen'>

            <video
                autoPlay
                muted
                loop
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source src={video} type="video/mp4" />
            </video>

            <div className="relative z-10 flex items-center justify-center h-full mt-64">
                <button
                    onClick={() => navigate("/movies")}
                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dull cursor-pointer text-white rounded-full"
                >
                    Explore Movies
                </button>
            </div>
        </div>
    )
}

export default Hero;
