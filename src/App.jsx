import { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import AppLayout from './layouts/app-layout'
import Landing from './pages/landing'
import Onboarding from './pages/onboarding'
import JobPage from './pages/job'
import JobListing from './pages/jobListing'
import PostJobs from './pages/post-job'
import SaveJobs from './pages/saved-job'
import MyJobs from './pages/my-jobs'
import { ThemeProvider } from './components/theme-provider'
import ProtectedRoute from './components/protected-route'

const router = createBrowserRouter([
  {
    element:<AppLayout/>,
    children:[
      {
        path:'/',
        element:<Landing/>
      },
      {
        path:'/onboarding',
        element:(
          <ProtectedRoute>
            <Onboarding/>
          </ProtectedRoute>
        )
      },
      {
        path:'/jobs',
        element:(
          <ProtectedRoute>
            <JobListing/>
          </ProtectedRoute>
        )
      },
      {
        path:'/job/:id',
        element:(
          <ProtectedRoute>
            <JobPage/>
          </ProtectedRoute>
        )
      },
      {
        path:'/post-job',
        element:(
          <ProtectedRoute>
            <PostJobs/>
          </ProtectedRoute>
        )
      },
      {
        path:'/saved-jobs',
        element:(
          <ProtectedRoute>
            <SaveJobs/>
          </ProtectedRoute>
        )
      },
      {
        path:'/my-jobs',
        element:(
          <ProtectedRoute>
            <MyJobs/>
          </ProtectedRoute>
        )
      }
    ]
  }
])


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router}/>
    </ThemeProvider>
  )
}

export default App
