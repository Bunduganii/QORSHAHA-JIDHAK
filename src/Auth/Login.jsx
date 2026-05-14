import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { useState } from 'react';
import { supabase } from '../Supabase';
import toast from 'react-hot-toast';

const Login = () => {
const navigate = useNavigate()
const [email,setEmial] = useState('')
const [password,setPassword]= useState('')
const [error,setError] = useState('')
const [loading,setLoading] = useState(false)

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true)
  setError('')
  const {data,error} = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if(error){
  toast.error(error.message);
   setLoading(false);
   return;
  } 
    toast.success("Login Successfull!")
     console.log("Logged in user:",data.user)
     setLoading(false)
    navigate('/Home')
  

}
  return (
    <div className="login-signup">
      {/* LEFT SIDE - IMAGE WITH OVERLAY */}
      <div className="side-image">
        <div className="overlay-content">
          <div className="logo">
            <span className='limits'>PUSHYOURLIMITS</span>
          </div>
          <h1>
            Unlock Your <br />
            <span className="peak">Peak Performance</span>
          </h1>
          <p className="small-font">
            Join The World's most exclusive Fitness Community
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="login-form">
        <h2>Welcome Back</h2>
        <p className="subtitle">Please enter your details to access your dashboard.</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="name@example.com" value={email} 
            onChange={(e)=>setEmial(e.target.value)}/>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} 
            onChange={(e)=> setPassword(e.target.value)} />
            {error && <p style={{color:'#10b6ee'}}>{error}</p>}
          </div>

          <div className="form-options">
            <label className="remember">
              <input type="checkbox" /> Remember me for 30 days
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="signin-btn" disabled={loading}>
           {loading ? "Signing in...":"Sign In"}
          </button>
        </form>

        <div className="quote">
          “The only bad workout is the one that didn't happen.”
        </div>

        <div className="social-login">
          <p>OR CONTINUE WITH</p>
          <div className="social-buttons">
            
            <button className="google-btn"><FcGoogle className='icon'/>
            </button>
            <button className="apple-btn"><FaApple className='icon'/></button>
          </div>
        </div>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;













// import React from 'react'
// import { Link } from 'react-router-dom'
// import './Auth.css'

// const Login = () => {
//   return (
//     <>
//       <div className="login-signup">

//       {/* LEFT SIDE IMAGE SECTION */}
//       <div className="side-image">
//         <div>
//           <div className='logo'>
//           {/* <img src='/images/Logo.png' alt='logo-png' /> */}
//           </div>
//           <h1>Unlock Your</h1> <br/> 
//            <span className='peak'> Peak Performance</span>
//           <p className='small-font'> Join The World's most exclusive Fitness Community</p> 
//         </div>
//       </div>

//       {/* RIGHT SIDE FORM */}
//       <div className="login-form">
//         <h2>Welcome Back</h2>

//         <form>
//           <input type="email" placeholder="Email Address" />
//           <input type="password" placeholder="Password" />

//           <button type="submit">Sign In</button>
//         </form>
//         <div className='cont-with'>
//        <p>Or Continue With</p>

//         </div>
//       </div>

//     </div>
//     {/* <div className='form-cont'>
        
//     <form className='login-signup'>
//     <h1>Welcome Back to Nasir FItnmess</h1>
//     <p>Please Enter your details to acess the dashboard</p>
//     <input type='email' placeholder='Enter your email'/>
//     <input type='password' placeholder='enter the password'/>
//     <Link>Forget the password</Link>
//      <button>Log In</button>
//     </form>
    
//     <div className='side-image'>
//         <img src='/images/Logo.png 'alt='logo'/>
//     <p>Unlock Your <span>Peak Perfomernce</span></p>
 
//     </div>
//     </div> */}
//     </>
//   )
// }

// export default Login
