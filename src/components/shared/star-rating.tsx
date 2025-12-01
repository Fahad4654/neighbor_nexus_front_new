import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  className?: string;
  starSize?: number;
};

export default function StarRating({ rating, className, starSize = 4 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-0.5 text-yellow-500", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={cn(`h-${starSize} w-${starSize}`)} fill="currentColor" />
      ))}
      {halfStar && <StarHalf key="half" className={cn(`h-${starSize} w-${starSize}`)} fill="currentColor" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={cn(`h-${starSize} w-${starSize}`, "text-gray-300")} fill="currentColor" />
      ))}
    </div>
  );
}
