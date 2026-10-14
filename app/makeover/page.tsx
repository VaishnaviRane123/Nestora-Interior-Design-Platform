// app/makeover/page.tsx
import MakeoverClient from './makeover-client';

export const metadata = {
  title: 'Room makeover planner | Nestora',
  description:
    'Upload a room photo, choose a style and budget, and get a starting colour palette and design direction.',
};

export default function MakeoverPage() {
  return <MakeoverClient />;
}
