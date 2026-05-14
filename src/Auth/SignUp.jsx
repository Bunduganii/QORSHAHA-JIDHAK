import React from 'react'
import './Auth.css'
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { useState } from 'react';
import { supabase } from '../Supabase';
import toast from 'react-hot-toast';
const SignUp = () => {
  const navigate = useNavigate()
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [loading,setLoading] = useState("")
  const [confirmpassword,setConfirmPassword] = useState("")
  // const Errors = () => toast("")
   const handleSignUp = async (e) => {
    if(password!==confirmpassword){
      toast.error("Password do not match")
    }
    e.preventDefault();
    setLoading(true)
    const {data,error} = await supabase.auth.signUp({
      email,
      password
    })
    if(error){
      toast.error(error.message)
    } else{
      toast.success("Sign Up successfull! please log in");
      navigate('/')
    }
    setLoading(false)
   }
   return (
    <div className="login-signup">
      {/* LEFT SIDE - IMAGE WITH OVERLAY */}
      <div className="side-image">
        <div className="overlay-content">
          <div className="logo">
            <span>PUSHYOURLIMITS</span>
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

        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="name@example.com" value={email}
             onChange={(e)=>setEmail(e.target.value)}/>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} 
            onChange={(e)=> setPassword(e.target.value)}/>
            <label>Confirm</label>
            <input type="password" placeholder="••••••••" value={confirmpassword} 
            onChange={(e)=> setConfirmPassword(e.target.value)} />
          </div>

          <div className="form-options">
            <label className="remember">
              <input type="checkbox" /> Remember me for 30 days
            </label>
            {/* <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link> */}
          </div>

          <button type="submit" className="signin-btn" disabled={loading}>
           {loading ? "Loading ...":"Sign Up"}
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
          Already have An Account? <Link to="/">Log In</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp
