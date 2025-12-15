import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../navbar/Navbar'
import Footer from '../footer/Footer'

const MainLayout = () => {
  return (
	<div className='min-h-screen'>
		<Navbar />
		<div className='max-w-[1280px] mx-auto min-h-screen'>
			<Outlet />
		</div>
		<Footer />
	</div>
  )
}

export default MainLayout