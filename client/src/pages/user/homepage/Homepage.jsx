import Navbar from '../../../components/user_components/navbar/Navbar'
import BannerSection from '../../../components/user_components/banner_section/BannerSection'
import BannerCardSection from '../../../components/user_components/banner_cards/BannerCardSection'
import BrandSection from '../../../components/user_components/brand_section/BrandSection'
import NewArrival from '../../../components/user_components/new_arrival/NewArrival'
import CategorySection from '../../../components/user_components/category_section/CategorySection'
import Footer from '../../../components/user_components/footer/Footer'

const Homepage = () => {
  return (
    <div className='bg-white text-black font-clash-display'>
      <Navbar />
      <hr />
      <BannerSection />
      <BannerCardSection />

      {/* ------------------- */}
      <BrandSection />
      {/* ----- */}
      <NewArrival />
      {/* ------- */}
      <CategorySection />
      {/* ----- */}
      {/* <ClassicSpotlight /> */}
      {/* ------- */}
      <Footer />
    </div>
  )
}

export default Homepage
