import React, { useState, useEffect } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { SelectedLocation } from '../types';
import { MapPinIcon } from '../components/Icons';

const QiblaScreen: React.FC = () => {
  const { latitude: geoLat, longitude: geoLon, loading: geoLoading } = useGeolocation();
  
  const [location, setLocation] = useState<{ lat: number | null; lon: number | null; name: string | null }>({
    lat: null,
    lon: null,
    name: null,
  });

  const [heading, setHeading] = useState<number>(0);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Priority 1: Check for user-selected location
    const storedLocationRaw = localStorage.getItem('selectedLocation');
    if (storedLocationRaw) {
      try {
        const storedLocation: SelectedLocation = JSON.parse(storedLocationRaw);
        setLocation({
          lat: storedLocation.lat,
          lon: storedLocation.lon,
          name: storedLocation.name,
        });
        setIsReady(true);
        return; // Exit if stored location is found
      } catch (e) {
        // Fall through to geolocation if parsing fails
        console.error("Failed to parse stored location", e);
      }
    }

    // Priority 2: Fallback to device's geolocation
    if (geoLat && geoLon) {
      setLocation({ lat: geoLat, lon: geoLon, name: 'موقعي الحالي' });
      setIsReady(true);
    } else if (!geoLoading) {
      // Neither stored location nor geolocation is available.
      setIsReady(true); // Stop loading, this will trigger the error message
    }

  }, [geoLat, geoLon, geoLoading]);


  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Use webkitCompassHeading for iOS compatibility, fallback to alpha
      const alpha = (event as any).webkitCompassHeading ?? event.alpha;
      if (alpha !== null) {
        setHeading(360 - alpha);
      }
    };
    
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  useEffect(() => {
    if (location.lat && location.lon) {
      const kaabaLat = 21.4225;
      const kaabaLng = 39.8262;

      const latRad = (location.lat * Math.PI) / 180;
      const lngRad = (location.lon * Math.PI) / 180;
      const kaabaLatRad = (kaabaLat * Math.PI) / 180;
      const kaabaLngRad = (kaabaLng * Math.PI) / 180;

      const y = Math.sin(kaabaLngRad - lngRad);
      const x = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(kaabaLngRad - lngRad);
      
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) {
        angle += 360;
      }
      setQiblaDirection(angle);
    }
  }, [location.lat, location.lon]);
  
  const getDirection = (angle: number): string => {
    const directions = ['شمال', 'شمال شرق', 'شرق', 'جنوب شرق', 'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'];
    const index = Math.round(angle / 45) % 8;
    return directions[index];
  };

  const compassRotation = heading;
  const qiblaPointerRotation = qiblaDirection - heading;

  const renderContent = () => {
    if (!isReady) {
      return <p className="mt-8 text-gray-500 dark:text-gray-400">جارٍ تحديد الموقع...</p>;
    }

    if (!location.lat || !location.lon) {
      return (
        <div className="text-center text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl mt-6">
          <MapPinIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">لم يتم تحديد الموقع</h3>
          <p>الرجاء تحديد موقعك في شاشة الصلاة أو السماح بالوصول لموقعك الحالي.</p>
        </div>
      );
    }

    return (
      <>
        <p className="text-gray-500 dark:text-gray-400 mb-2">القبلة لـ: <span className="font-bold">{location.name}</span></p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">تأكد من أن هاتفك معاير بشكل جيد</p>
        
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-8">
          <div
            className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            <div className="absolute top-0 text-lg font-bold">ش</div>
            <div className="absolute bottom-0 text-lg font-bold">ج</div>
            <div className="absolute left-0 text-lg font-bold">غ</div>
            <div className="absolute right-0 text-lg font-bold">ق</div>
          </div>
          <div
            className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-800 dark:bg-gray-200 rounded-full -translate-x-1/2 -translate-y-1/2"
          />
          <div
            className="absolute top-0 left-1/2 h-1/2 w-4 origin-bottom transition-transform duration-200"
            style={{ transform: `translateX(-50%) rotate(${qiblaPointerRotation}deg)` }}
          >
            <div className="w-full h-full bg-green-500 rounded-t-full" />
          </div>
        </div>
        
        <div className="mt-8">
          <p className="text-gray-600 dark:text-gray-300">اتجاه القبلة من موقعك</p>
          <p className="text-2xl font-bold my-1">{Math.round(qiblaDirection)}° {getDirection(qiblaDirection)}</p>
          <p className="text-green-600 dark:text-green-400 font-semibold">اتجاه الكعبة</p>
        </div>
      </>
    );
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 pt-20 text-center">
      <h1 className="text-2xl font-bold mb-2">القبلة</h1>
      {renderContent()}
    </div>
  );
};

export default QiblaScreen;