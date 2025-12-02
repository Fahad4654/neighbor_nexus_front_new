import Image from "next/image";
import { notFound } from "next/navigation";
import { getListingById, getUserById, getReviewsByListingId, User, Review } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import StarRating from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Verified } from "lucide-react";
import AuthenticatedImage from "@/components/shared/authenticated-image";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = getListingById(params.id);
  if (!listing) {
    notFound();
  }

  const owner = getUserById(listing.ownerId);
  const reviews = getReviewsByListingId(listing.id);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                className="object-cover"
                data-ai-hint={listing.dataAiHint}
              />
            </div>
            <CardHeader>
              <Badge variant={listing.type === 'Tool' ? 'secondary' : 'default'} className="w-fit mb-2">{listing.type}</Badge>
              <CardTitle className="text-3xl font-headline">{listing.title}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <StarRating rating={listing.rating} />
                <span>{listing.reviewCount} reviews</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{listing.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">${listing.price.toFixed(2)}<span className="text-sm font-normal text-muted-foreground"> / {listing.priceUnit}</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" className="w-full">Request to {listing.type === 'Tool' ? 'Rent' : 'Book'}</Button>
              <Button size="lg" variant="outline" className="w-full">Message Owner</Button>
            </CardContent>
          </Card>
          {owner && (
            <Card>
              <CardHeader>
                <CardTitle>About the owner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AuthenticatedImage src={owner.avatarUrl} alt={owner.name} className="aspect-square h-full w-full" data-ai-hint={owner.dataAiHint} />
                    <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold flex items-center gap-1">{owner.name} {owner.isVerified && <Verified className="h-4 w-4 text-primary" />}</div>
                    <StarRating rating={owner.rating} starSize={3}/>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Lives in {owner.nexus}</div>
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Joined in {new Date(owner.joinDate).getFullYear()}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => {
              const reviewer = getUserById(review.reviewerId);
              return (
                <div key={review.id} className="flex gap-4">
                  <Avatar>
                    <AuthenticatedImage src={reviewer?.avatarUrl} alt={reviewer?.name || ''} className="aspect-square h-full w-full" data-ai-hint={reviewer?.dataAiHint} />
                    <AvatarFallback>{reviewer?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{reviewer?.name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="text-muted-foreground mt-2">{review.comment}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">No reviews yet. Be the first!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
