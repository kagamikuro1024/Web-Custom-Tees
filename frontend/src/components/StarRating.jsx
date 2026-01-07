import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, size = 'md', showNumber = false, interactive = false, onChange }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const renderStar = (position) => {
    const filled = rating >= position;
    const halfFilled = rating >= position - 0.5 && rating < position;

    const handleClick = () => {
      if (interactive && onChange) {
        onChange(position);
      }
    };

    return (
      <button
        key={position}
        type="button"
        onClick={handleClick}
        disabled={!interactive}
        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
          filled ? 'text-yellow-400' : halfFilled ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        {filled ? (
          <FaStar className={sizeClasses[size]} />
        ) : halfFilled ? (
          <FaStarHalfAlt className={sizeClasses[size]} />
        ) : (
          <FaRegStar className={sizeClasses[size]} />
        )}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(position => renderStar(position))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
