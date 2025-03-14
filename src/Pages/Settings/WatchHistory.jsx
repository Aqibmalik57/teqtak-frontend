import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoBookmarkOutline } from "react-icons/io5";
import { FaAngleLeft } from "react-icons/fa";
import { CiPlay1 } from "react-icons/ci";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { REACT_APP_API_BASE_URL } from "../../ENV";

const API_BASE_URL = REACT_APP_API_BASE_URL;

const CardComponent = ({ title, videoUrl, videoId, navigate, videos }) => (
  <div
    className="lg:h-[30vh] h-[20vh] lg:w-[12vw] md:w-[15vw] sm:w-[20vw] w-[25vw] relative m-0 text-white cursor-pointer"
    onClick={() => navigate(`/watchhistory/${encodeURIComponent(videoId)}`, { state: { id: videos } })}
  >
    <video className="h-full w-full rounded-lg object-cover" src={videoUrl} muted  />
    <div className="absolute inset-0 flex justify-between ShadedBG rounded-lg">
      <h5 className="text-sm ps-3 absolute bottom-2">{title}</h5>
    </div>
  </div>
);

function WatchHistory() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [recentdata, setRecentData] = useState([]);
  const [loading, setLoading] = useState(true); 

  const getUserId = () => {
    const cookies = document.cookie.split(';'); 
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('='); 
      if (key === 'user') { 
        return value; 
      }
    }
    return null; 
  };

  const user_id = getUserId();
const token = localStorage.getItem('jwt');
  useEffect(() => {
    const fetchViews = async () => {
      setLoading(true); 
      try {
        const response = await fetch(`${API_BASE_URL}/views/${getUserId()}`,
    {
        headers:{
          "Authorization": `Bearer ${token}`,
        }
    }
      );
        const data = await response.json();
       console.log("asdfasdfasadfasd",data);
       setRecentData(data.podcast);
       setVideos(data.video);
      } catch (error) {
        console.error("Error fetching views:", error);
      } finally {
        setLoading(false); 
      }
    };
    fetchViews();
  }, []);
  console.log("this is videos",videos);
  console.log("asdfasda",recentdata);
  const formatDuration = (duration) => {
    const seconds = Math.floor(duration / 1000);
    return seconds < 60
      ? `${seconds} seconds`
      : `${Math.floor(seconds / 60)} min${seconds > 60 ? "s" : ""}`;
  };

  const handleSaveToWishlist = async (podcastId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wishlist`, {
        wishItemType: "podcast",
        wishItemId: podcastId,
        userId: user_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:`Bearer ${token}`,
        },
      }
    );
      toast.success("Podcast saved to wishlist!"); // Show success toast
    } catch (error) {
      console.error("Error saving to wishlist:", error);
      toast.error("Could not save to wishlist. Please try again."); // Show error toast
    }
  };

  return (
    <div className="bg-white w-full h-full">
      <ToastContainer /> {/* Include the ToastContainer here */}
      <h4 className="flex items-center gap-3 ms-2 h-[10%]">
        <FaAngleLeft
          className="cursor-pointer"
          onClick={() => navigate("/settings")}
        />
        Watched Content
      </h4>

      <div className="h-[90%] w-full overflow-y-scroll Podcast_Top_Videos">
        <div className="w-[95%] mx-auto">
          {loading ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="spinner-border text-white" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h1 className="my-2 text-2xl">Videos</h1>
                {/* <Link to="/videos" className="text-blue-400 text-sm">
                  See all
                </Link> */}
              </div>
              <div className="mt-3 flex w-full overflow-x-scroll gap-1 Podcast_Top_Videos  ">
                {videos.map((elm) => (
                  <div key={elm._id}>
                    <CardComponent
                      title={elm.data?.videoDesc}
                      videoUrl={elm.data?.videoUrl}
                      videoId={elm.data?._id}
                      navigate={navigate}
                      videos={videos}
                    />
                  </div>
                ))}
              </div>
              <h1 className="my-2 text-2xl">Podcasts</h1>
              <div className="flex justify-start text-white ps-5 gap-2 flex-wrap w-full overflow-x-auto Podcast_Top_Videos mt-2 ">
                {recentdata.map((elm, ind) => (
                  <div
                    key={ind}
                    className="cursor-pointer lg:h-[42vh] h-[25vh] lg:w-[22.33vw] md:w-[29.33vw] max-[425px]:w-[41.33vw] w-[41.33vw] flex-shrink-0 rounded-lg relative"
                    onClick={() => navigate(`/podcastdetails`, { state: { id: elm.data._id } })}
                  >
                    <div className="absolute h-full w-full ShadedBG rounded-lg">
                      <IoBookmarkOutline
                        className="absolute right-1 top-1 text-2xl cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering onClick of parent div
                          handleSaveToWishlist(elm._id); // Save to wishlist
                        }}
                      />
                      <div className="absolute bottom-1 left-1 SVTBottom w-[93%] rounded-lg ps-3">
                        <p className="text-sm">{elm.episodeTitle?elm.episodeTitle:"N/A"}</p>
                        <Link
                          to="/userprofile"
                          state={{ id: elm.userID ? elm.userID : "unknown" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-sm">{elm.user ? elm.user.name : ""}</p>
                        </Link>
                        <p className="text-xs flex gap-1 items-center">
                          <CiPlay1 /> {formatDuration(elm.podcastDuration)}
                        </p>
                      </div>
                    </div>
                    <img
                      src={elm.picUrl ? elm.picUrl : "/loading.jpg"}
                      alt={`Img-${ind}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <br />
      </div>
    </div>
  );
}

export default WatchHistory;
