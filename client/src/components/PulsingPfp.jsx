import { useState, useEffect } from 'react';

export default function PulsingPfp({ imageUrl }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setImageLoaded(true);
  }, []);

  return (
    <img
      src={imageLoaded ? imageUrl : ''}
      className={imageLoaded?'w-10 h-10 rounded-reg':'w-10 h-10 rounded-reg bg-osuslate-100 animate-pulse'}
    />
  );
}
