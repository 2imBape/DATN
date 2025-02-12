import instance from "@/configs/axios";
import { Movie } from "@/interfaces/Movie";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "antd"; // Import Button from Ant Design

type Props = {};

const Video: React.FC<Props> = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const adVideoRef = useRef<HTMLVideoElement | null>(null);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adVideoTime, setAdVideoTime] = useState(0);
  const [skipAdTimeLeft, setSkipAdTimeLeft] = useState(5);

  // Danh sách các video quảng cáo
  const adVideos = [
    "https://res.cloudinary.com/dzjlyjowz/video/upload/v1733667753/movie/videos/x61twnnqwhvodahzpopa.mp4",
    "https://res.cloudinary.com/dzjlyjowz/video/upload/v1733667830/movie/videos/r0flmkir6bq7beaidym7.mp4",
  ];
  const getRandomAdVideo = () => {
    const randomIndex = Math.floor(Math.random() * adVideos.length);
    return adVideos[randomIndex];
  };
  console.log(loading);
  console.log(error);

  // Lưu URL của video quảng cáo
  const [adVideoUrl, setAdVideoUrl] = useState<string>(getRandomAdVideo());

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await instance.get(`movie/${id}`);
        const fetchedMovie = response.data.data;
        setMovie(fetchedMovie);
        const checkPackageUser = localStorage.getItem("checkPackageUser");
        if (checkPackageUser === "true") {
          setShowAdOverlay(false);
        } else {
          if (fetchedMovie.isFree === true) {
            setShowAdOverlay(true);
            setAdVideoUrl(getRandomAdVideo());
          } else {
            setShowAdOverlay(false);
          }
        }
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Failed to fetch movie data");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleAdTimeUpdate = () => {
    if (adVideoRef.current) {
      setAdVideoTime(adVideoRef.current.currentTime);
      const timeLeft = Math.max(
        5 - Math.ceil(adVideoRef.current.currentTime),
        0
      );
      setSkipAdTimeLeft(timeLeft);
    }
  };

  const handleAdEnded = () => {
    setShowAdOverlay(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleSkipAd = () => {
    setShowAdOverlay(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const videoUrl = movie?.video;

  return (
    <div className="relative w-full bg-black">
      {showAdOverlay && (
        <video
          ref={adVideoRef}
          className="w-full"
          autoPlay
          onEnded={handleAdEnded}
          onTimeUpdate={handleAdTimeUpdate}
          src={adVideoUrl}
        />
      )}

      {/* Main Movie Video */}
      <div className="movie-container relative">
        <video
          ref={videoRef}
          className={`w-full ${showAdOverlay ? "hidden" : "block"}`}
          controls
          src={videoUrl}
        />
      </div>

      {showAdOverlay && (
        <div
          className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 flex flex-col justify-center items-center z-50"
          style={{ display: showAdOverlay ? "flex" : "none" }}
        >
          <p className="text-white text-lg">
            Quảng cáo đang phát... {Math.ceil(adVideoTime)} giây
          </p>
          <Button
            onClick={handleSkipAd}
            disabled={skipAdTimeLeft > 0}
            className="skip-ad-button ant-btn ant-btn-primary text-white"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "10px 20px",
              backgroundColor: "#ff6600",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              zIndex: 10001,
              borderRadius: "5px",
              transition: "background-color 0.3s ease",
              opacity: skipAdTimeLeft > 0 ? 0.5 : 1,
            }}
          >
            {skipAdTimeLeft > 0
              ? `Bỏ qua quảng cáo (${skipAdTimeLeft}s)`
              : "Bỏ qua quảng cáo"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Video;
