import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { listings } from "@/lib/data";
import StarRating from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ListingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-bold">Available in Your Nexus</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <Link href={`/listings/${listing.id}`} key={listing.id}>
            <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={listing.imageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    data-ai-hint={listing.dataAiHint}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-grow">
                <Badge variant={listing.type === 'Tool' ? 'secondary' : 'default'} className="w-fit mb-2">{listing.type}</Badge>
                <CardTitle className="text-lg font-headline mb-1">{listing.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <StarRating rating={listing.rating} />
                  <span>({listing.reviewCount} reviews)</span>
                </div>
                <CardDescription className="text-base font-bold text-primary flex-grow">
                  ${listing.price.toFixed(2)} / {listing.priceUnit}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
