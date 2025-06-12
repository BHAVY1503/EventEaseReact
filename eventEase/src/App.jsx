import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import { Routes , Route} from 'react-router-dom'
import { LandingPage } from './components/common/LandingPage'
import "./assets/animate.min.css"
// import "./assets/simplebar.min.css"
import "./assets/style.css"
import 'simplebar/dist/simplebar.min.css';
import './assets/main.css'
import './assets/styles.css'
import '../../startbootstrap-landing-page-gh-pages/js/scripts'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { SignUpModal } from './components/user/SignupModal'
import { SignUpPageWithLanding } from './SignupPagewithLanding'
// import { SignInModel } from './components/user/SignInModal'
import { SigninPageWithLanding } from './SiginPagewithLanding'
import axios from 'axios'
import { AdminLanding } from './AdminLanding'



function App() {

   axios.defaults.baseURL = "http://localhost:3100"
  

  const [count, setCount] = useState(0)

  return (
    
    <Routes>
     <Route path="/" element={<LandingPage/>}></Route>
     {/* <Route path="/signup" element={<SignUpPageWithLanding/>}></Route> */}
     {/* <Route path='/signin' element={<SignUpPageWithLanding/>}></Route> */}
     <Route path="/signup" element={<SignUpPageWithLanding />} />
     <Route path="/signin" element={<SigninPageWithLanding  />} />
     <Route path="/adminsignin" element={<AdminLanding/>} />



    </Routes>
   
  )
}

export default App
