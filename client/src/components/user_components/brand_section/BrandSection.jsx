import React from 'react'
import nikelogo from '../../../assets/images/homepage/nike logo.png';
import adidaslogo from '../../../assets/images/homepage/adidas logo.png';
import pumalogo from '../../../assets/images/homepage/puma logo.png';
import newbalancelogo from '../../../assets/images/homepage/new balance logo.png';
import underarmourlogo from '../../../assets/images/homepage/under armour logo.png';

const BrandSection = () => {
  return (
    <div className='bg-[#b5b7bb8c] px-10 py-20'>
      <h1 className='text-3xl text-center font-clash-grotesk'>Popular Brands</h1>
      <div className='flex justify-around items-center mt-[4.75rem]'>
        <img src={nikelogo} alt="" className='w-[150px]' />
        <img src={adidaslogo} alt="" className='w-[150px]' />
        <img src={pumalogo} alt="" className='w-[150px]' />
        <img src={newbalancelogo} alt="" className='w-[150px]' />
        <img src={underarmourlogo} alt="" className='w-[150px]' />
      </div>
    </div>
  )
}

export default BrandSection
