import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export type User = {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  dataAiHint: string;
  isAdmin: boolean;
  isVerified: boolean;
  rating_avg: number;
  geo_location: string;
  createdAt: string;
  name: string; // for compatibility with other components
  joinDate: string; // for compatibility with other components
  nexus: string; // for compatibility with other components
  rating: number; // for compatibility with other components
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  type: 'Tool' | 'Service';
  ownerId: string;
  price: number;
  priceUnit: 'hour' | 'day' | 'fixed';
  imageUrl: string;
  dataAiHint: string;
  rating: number;
  reviewCount: number;
};

export type Transaction = {
  id: string;
  listingId: string;
  renterId: string;
  providerId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  total: number;
};

export type Review = {
  id: string;
  listingId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  date: string;
};

export const users: User[] = [
  { id: 'u1', username: 'ajohnson', firstname: 'Alice', lastname: 'Johnson', email: 'alice@example.com', phoneNumber: '123-456-7890', avatarUrl: findImage('avatar1')?.imageUrl ?? '', dataAiHint: findImage('avatar1')?.imageHint ?? '', isAdmin: true, isVerified: true, rating_avg: 4.8, geo_location: 'Oakwood', createdAt: '2023-01-15', name: 'Alice Johnson', joinDate: '2023-01-15', nexus: 'Oakwood', rating: 4.8 },
  { id: 'u2', username: 'bwilliams', firstname: 'Bob', lastname: 'Williams', email: 'bob@example.com', phoneNumber: '234-567-8901', avatarUrl: findImage('avatar2')?.imageUrl ?? '', dataAiHint: findImage('avatar2')?.imageHint ?? '', isAdmin: false, isVerified: true, rating_avg: 4.5, geo_location: 'Maple Creek', createdAt: '2023-02-20', name: 'Bob Williams', joinDate: '2023-02-20', nexus: 'Maple Creek', rating: 4.5 },
  { id: 'u3', username: 'cbrown', firstname: 'Charlie', lastname: 'Brown', email: 'charlie@example.com', phoneNumber: '345-678-9012', avatarUrl: findImage('avatar3')?.imageUrl ?? '', dataAiHint: findImage('avatar3')?.imageHint ?? '', isAdmin: false, isVerified: false, rating_avg: 4.2, geo_location: 'Oakwood', createdAt: '2023-03-10', name: 'Charlie Brown', joinDate: '2023-03-10', nexus: 'Oakwood', rating: 4.2 },
  { id: 'u4', username: 'dmiller', firstname: 'Diana', lastname: 'Miller', email: 'diana@example.com', phoneNumber: '456-789-0123', avatarUrl: findImage('avatar4')?.imageUrl ?? '', dataAiHint: findImage('avatar4')?.imageHint ?? '', isAdmin: false, isVerified: true, rating_avg: 5.0, geo_location: 'Willow Heights', createdAt: '2023-04-05', name: 'Diana Miller', joinDate: '2023-04-05', nexus: 'Willow Heights', rating: 5.0 },
];

export const listings: Listing[] = [
  { id: 'l1', title: 'Power Drill Kit', description: 'Complete power drill kit with multiple bits. Perfect for home projects.', type: 'Tool', ownerId: 'u1', price: 10, priceUnit: 'day', imageUrl: findImage('tool-drill')?.imageUrl ?? '', dataAiHint: findImage('tool-drill')?.imageHint ?? '', rating: 4.7, reviewCount: 15 },
  { id: 'l2', title: 'Expert Gardening Service', description: 'Weeding, planting, and general garden maintenance. Years of experience.', type: 'Service', ownerId: 'u2', price: 30, priceUnit: 'hour', imageUrl: findImage('service-gardening')?.imageUrl ?? '', dataAiHint: findImage('service-gardening')?.imageHint ?? '', rating: 4.9, reviewCount: 25 },
  { id: 'l3', title: '12-foot Stepladder', description: 'Sturdy and reliable stepladder for reaching high places.', type: 'Tool', ownerId: 'u1', price: 15, priceUnit: 'day', imageUrl: findImage('tool-ladder')?.imageUrl ?? '', dataAiHint: findImage('tool-ladder')?.imageHint ?? '', rating: 4.5, reviewCount: 10 },
  { id: 'l4', title: 'High School Math Tutoring', description: 'Specializing in Algebra and Geometry for high school students.', type: 'Service', ownerId: 'u4', price: 25, priceUnit: 'hour', imageUrl: findImage('service-tutoring')?.imageUrl ?? '', dataAiHint: findImage('service-tutoring')?.imageHint ?? '', rating: 5.0, reviewCount: 8 },
  { id: 'l5', title: 'Pressure Washer', description: 'High-power pressure washer for cleaning driveways, decks, and siding.', type: 'Tool', ownerId: 'u3', price: 25, priceUnit: 'day', imageUrl: findImage('tool-pressure-washer')?.imageUrl ?? '', dataAiHint: findImage('tool-pressure-washer')?.imageHint ?? '', rating: 4.3, reviewCount: 5 },
  { id: 'l6', title: 'Dog Walking', description: 'Reliable and friendly dog walker available for morning and evening walks.', type: 'Service', ownerId: 'u2', price: 15, priceUnit: 'hour', imageUrl: findImage('service-dogwalking')?.imageUrl ?? '', dataAiHint: findImage('service-dogwalking')?.imageHint ?? '', rating: 4.8, reviewCount: 12 },
];

export const transactions: Transaction[] = [
  { id: 't1', listingId: 'l1', renterId: 'u2', providerId: 'u1', startDate: '2023-05-10', endDate: '2023-05-12', status: 'completed', total: 20 },
  { id: 't2', listingId: 'l2', renterId: 'u1', providerId: 'u2', startDate: '2023-05-15', endDate: '2023-05-15', status: 'completed', total: 60 },
  { id: 't3', listingId: 'l3', renterId: 'u3', providerId: 'u1', startDate: '2023-06-01', endDate: '2023-06-02', status: 'active', total: 15 },
  { id: 't4', listingId: 'l4', renterId: 'u1', providerId: 'u4', startDate: '2023-06-20', endDate: '2023-06-20', status: 'pending', total: 50 },
];

export const reviews: Review[] = [
  { id: 'r1', listingId: 'l1', reviewerId: 'u2', rating: 5, comment: 'Great drill, worked perfectly for what I needed. Alice was very helpful.', date: '2023-05-13' },
  { id: 'r2', listingId: 'l1', reviewerId: 'u3', rating: 4, comment: 'Good quality tool, easy pickup.', date: '2023-04-20' },
  { id: 'r3', listingId: 'l2', reviewerId: 'u1', rating: 5, comment: 'Bob did an amazing job on my garden! It looks better than ever.', date: '2023-05-16' },
  { id: 'r4', listingId: 'l2', reviewerId: 'u4', rating: 5, comment: 'Very professional and knowledgeable. Highly recommend.', date: '2023-04-28' },
  { id: 'r5', listingId: 'l3', reviewerId: 'u2', rating: 4, comment: 'The ladder was a bit wobbly but got the job done.', date: '2023-05-22' },
];

export const getListingById = (id: string) => listings.find(l => l.id === id);
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getReviewsByListingId = (id: string) => reviews.filter(r => r.listingId === id);