import { Suspense } from 'react';
import ItineraryClient from './ItineraryClient';

export default function ItineraryPage() {
  return (
    <Suspense>
      <ItineraryClient />
    </Suspense>
  );
}
