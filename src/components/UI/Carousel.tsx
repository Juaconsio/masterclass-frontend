import { Splide, SplideSlide } from '@splidejs/react-splide';
const options = {
  type: 'loop',
  gap: '1rem',
  arrows: false,
  autoplay: true,
  pauseOnHover: false,
  resetProgress: false,
  height: '26rem',
  width: '22rem',
};

export default function Carousel() {
  return (
    <Splide aria-label="My Favorite Images" options={options}>
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <SplideSlide key={index}>
            <img
              src={`/images/image${index}.jp${index == 0 ? 'e' : ''}g`}
              alt={`Image ${index}`}
              className="h-full w-full rounded-lg object-cover shadow-lg"
            />
          </SplideSlide>
        ))}
    </Splide>
  );
}
