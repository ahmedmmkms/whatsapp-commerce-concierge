import { Hero } from '../components/landing/Hero'
import { CategoryGrid } from '../components/landing/CategoryGrid'
import { DealsSection } from '../components/landing/Deals'
import { Brands } from '../components/landing/Brands'
import { Testimonials } from '../components/landing/Testimonials'
import { Newsletter } from '../components/landing/Newsletter'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <CategoryGrid />
      <DealsSection />
      <Brands />
      <Testimonials />
      <Newsletter />
    </div>
  );
}
