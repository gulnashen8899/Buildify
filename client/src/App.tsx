import React from 'react'
import {Route, Routes, useLocation} from 'react-router-dom'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import MyProjects from './pages/MyProjects'
import Preview from './pages/Preview'
import Community from './pages/Community'
import Projects from './pages/Projects'
import View from './pages/View'
import Navbar from './components/Navbar'
import AuthPage from './pages/auth/Authpage'
import { Toaster } from 'sonner'
import  Settings  from './pages/Settings'
import Loading from './pages/Loading'

const App = () => {
  const {pathname}= useLocation();
  const hideNavBar= pathname.startsWith('/projects/') && pathname !=='/projects' || pathname.startsWith('/view/') 
  || pathname.startsWith('/preview/');
  
  return (
    <div>
      <Toaster />
      {!hideNavBar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
         <Route path="/projects" element={<MyProjects />} />
        <Route path="/preview/:projectId/" element={<Preview />} /> 
        <Route path="/preview/:projectId/:versionId" element={<Preview />} />
        <Route path="/projects/:projectId" element={<Projects />} />    
        <Route path="/community" element={<Community />} />
        <Route path="/view/:projectId" element={<View />} /> 
         <Route path="/auth/:pathname" element={<AuthPage/>} />
        <Route path="/account/settings" element={<Settings/>} />
         <Route path="/loading" element={<Loading/>}/>
      </Routes>
    </div>
  )
}

export default App