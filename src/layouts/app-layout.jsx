
import Header from '@/components/header';
import React from 'react'
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div>
        <div className="grid-background"></div>
        <main className='min-h-screen container px-8'>
          <Header/>
          <Outlet/>
        </main>
        <div className='p-10 text-center bg-gray-800 mt-10'>Made by Ankit</div>
    </div>
  )
}

export default AppLayout;