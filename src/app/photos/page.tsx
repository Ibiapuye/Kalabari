'use client'
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Search from '@/components/search';

interface Imager {
  id: string;
  data: {
    image: string;
    title: string;
    description: string;
  };
}

export default function Photos() {
  const [images, setImages] = useState<Imager[]>([]);
  const [filteredImages, setFilteredImages] = useState<Imager[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const bottomBoundaryRef = useRef(null);
  const fetchedImageIds = useRef(new Set<string>());

  const fetchImages = async () => {
    const response = await fetch(`https://cdn.builder.io/api/v3/content/images?apiKey=${process.env.NEXT_PUBLIC_BUILDER_IO_API}&limit=8&offset=${offset}`);
    const data = await response.json();
    
    if (data.results.length === 0) {
      setHasMore(false);
      return;
    }

    const newImages = data.results.filter((image: Imager) => !fetchedImageIds.current.has(image.id));

    newImages.forEach((image: Imager) => {
      fetchedImageIds.current.add(image.id);
    });

    if (newImages.length > 0) {
      setImages(prevImages => [...prevImages, ...newImages]);
      setFilteredImages(prevImages => [...prevImages, ...newImages]);
    } else {
      setOffset(prevOffset => prevOffset + 8);  // Skip to next batch if all are duplicates
    }
  };

  useEffect(() => {
    fetchImages();
  }, [offset]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset((prevOffset) => prevOffset + 8);
      }
    }, { threshold: 1.0 });

    if (bottomBoundaryRef.current) {
      observer.observe(bottomBoundaryRef.current);
    }

    return () => {
      if (bottomBoundaryRef.current) {
        observer.unobserve(bottomBoundaryRef.current);
      }
    };
  }, [bottomBoundaryRef.current, hasMore]);

  useEffect(() => {
    if (images.length > 20) {
      setImages((prevImages) => prevImages.slice(8));
      setFilteredImages((prevImages) => prevImages.slice(8));
    }
  }, [images]);

  return (
    <main className={'bg-darkk p-2'} aria-label="You're at the Photos Section">
       <div className="sticky bg-transparent top-[12%] left-0 right-0 z-10">
        <Search images={images} setFilteredImages={setFilteredImages} />
      </div>
      <section className="photos-grid grid md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1 gap-4 w-full">
        {filteredImages?.map((photo) => (
          <div key={photo.id} className="photo-item">
            <Link href={photo.data.image}>
              <div className='relative'>
                <Image
                  src={photo.data.image}
                  alt={photo.data.title}
                  className='w-full h-full'
                  width={1665}
                  height={100}
                />
                <p className='absolute bottom-0 left-0 w-full text-center bg-gray-900 text-white py-2'>{photo.data.title}</p>
              </div>
            </Link>
          </div>
        ))}
      </section>
      {hasMore ? (
        <div id="page-bottom-boundary" ref={bottomBoundaryRef}></div>
      ) : (
        <p className="text-center">Looks like that's all we have</p>
      )}
    </main>
  );
}
