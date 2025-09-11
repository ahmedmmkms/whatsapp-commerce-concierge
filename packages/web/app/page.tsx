import { HomeHero } from '../components/home-hero'
import { HomeFeatures } from '../components/home-features'

export default function HomePage() {
  return (
    <div>
      <HomeHero apiBase={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'} />

      <HomeFeatures />
    </div>
  );
}
