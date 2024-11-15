"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: string;
  name: string;
  location: string;
  position: string;
  status: number;
  created_at: string;
  updated_at: string;
  images: string[];
}

interface CarouselProps {
  location: string;
  position: string;
}

export default function Carousel({ location, position }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [bannerData, setBannerData] = useState<Banner | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`/api/banner/get-banner-with-position?page=1&limit=10&location=${location}&position=${position}`);
        const result = await response.json();
        if (result.status === 200 && result.data.length > 0) {
          setBannerData(result.data[0]);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchBanners();
  }, [location, position]);

  useEffect(() => {
    if (!isHovering && bannerData?.images) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === bannerData.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [bannerData?.images, isHovering]);

  const goToPrevious = () => {
    if (!bannerData?.images) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? bannerData.images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    if (!bannerData?.images) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === bannerData.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!bannerData?.images) {
    return null;
  }

  return (
    <div 
      className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] 2xl:h-[700px] overflow-hidden rounded-xl shadow-2xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10" />
      
      {bannerData.images.map((src, index) => (
        <div
          key={src}
          className={`absolute top-0 left-0 w-full h-full transform transition-all duration-700 ease-in-out ${
            index === currentIndex 
              ? 'opacity-100 translate-x-0 scale-100' 
              : index < currentIndex 
                ? 'opacity-0 -translate-x-full scale-95'
                : 'opacity-0 translate-x-full scale-95'
          }`}
        >
          <Image
            src={src}
            alt={`${bannerData.name} - Slide ${index + 1}`}
            layout="fill"
            objectFit="cover"
            className="transform hover:scale-105 transition-transform duration-3000"
            priority={index === currentIndex}
            quality={100}
          />
        </div>
      ))}

      <button
        onClick={goToPrevious}
        className="absolute top-1/2 left-4 z-20 transform -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition duration-300 group"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={goToNext}
        className="absolute top-1/2 right-4 z-20 transform -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition duration-300 group"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      </button>

      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-2 sm:gap-3">
        {bannerData.images.map((_, index) => (
          <button
            key={index}
            className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-6 sm:w-8'
                : 'bg-white/50 hover:bg-white/80'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}