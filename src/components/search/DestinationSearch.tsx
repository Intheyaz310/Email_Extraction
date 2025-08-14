import { Search, MapPin, Calendar, Users, Lock, Github, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import React from "react";
import { useNavigate } from "react-router-dom";

// API URL
const API_URL = "http://localhost:5000/api";

const DestinationSearch = ({ loaded = true }) => {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const navigate = useNavigate();

  function validateEmail(email: string) {
    return /^\S+@\S+\.\S+$/.test(email);
  }

  const handleClick = async () => {
    if (step === 'email') {
      if (!validateEmail(input)) {
        setError("Please enter a valid email address.");
        return;
      }
      setError("");
      setCurrentEmail(input);
      setStep('password');
      setInput("");
    } else {
      try {
        setShowLoader(true);
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentEmail, password: input })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        // store token, user and userId for Dashboard guard
        localStorage.setItem('authToken', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user.id) {
            localStorage.setItem('userId', String(data.user.id));
          }
        }
        toast({ title: 'Login successful', description: `Welcome ${data.user?.name || ''}` });
        navigate('/dashboard');
      } catch (err: any) {
        toast({ title: 'Login Failed', description: err.message || 'Network error', variant: 'destructive' });
      } finally {
        setShowLoader(false);
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({ title: `${provider} Login Successful`, description: `You have been logged in with ${provider}.` });
  };

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      )}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg w-full max-w-3xl mx-auto animate-fade-up [animation-delay:400ms]">
        <div className="flex flex-col md:flex-row items-start justify-center gap-8">
          <>
            <div className="w-full md:flex-1">
              <input
                type={step === 'email' ? 'text' : 'password'}
                placeholder={step === 'email' ? 'Enter your Email Address' : 'Enter your Password'}
                value={input}
                onChange={e => setInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/10 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none transition-all text-white placeholder:text-white/70"
              />
              {error && <div className="text-rose-400 text-sm mt-2 text-left">{error}</div>}
            </div>
            <div className="w-full md:w-auto">
              <Button className="w-full text-white py-3 h-[46px] bg-rose-600 hover:bg-rose-500" onClick={handleClick}>
                <Lock className="mr-2" size={20} />
                {step === 'email' ? 'Next' : 'Login'}
              </Button>
            </div>
          </>
        </div>
      </div>
      {(step === 'email' || step === 'password') && (
        <div className={`flex flex-col items-center mt-8 transform transition-all duration-700 delay-400 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center w-full max-w-xs mb-4 transform transition-all duration-700 delay-400">
            <span className="flex-1 h-px bg-white/20" />
            <span className="px-3 text-white/60 text-sm font-medium">OR</span>
            <span className="flex-1 h-px bg-white/20" />
          </div>
          <div className="flex gap-4 transform transition-all duration-700 delay-400">
            <button className="p-2 rounded-full transition-transform hover:scale-110 focus:outline-none" title="Login with Google" onClick={() => handleSocialLogin('Google')}>
              <svg className="w-6 h-6" viewBox="0 0 24 24"><g><path fill="#fff" fillOpacity="0.85" d="M21.805 10.023h-9.765v3.977h5.627c-.243 1.243-1.243 3.243-3.627 3.243-2.188 0-3.977-1.805-3.977-4.023 0-2.219 1.789-4.023 3.977-4.023 1.243 0 2.078.496 2.555.91l2.789-2.789c-1.243-1.145-2.844-1.855-5.344-1.855-4.243 0-7.688 3.445-7.688 7.688s3.445 7.688 7.688 7.688c4.422 0 7.344-3.105 7.344-7.5 0-.496-.055-.867-.125-1.242z"/></g></svg>
            </button>
            <button className="p-2 rounded-full transition-transform hover:scale-110 focus:outline-none" title="Login with Facebook" onClick={() => handleSocialLogin('Facebook')}>
              <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#fff" fillOpacity="0.85" d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
            </button>
            <button className="p-2 rounded-full transition-transform hover:scale-110 focus:outline-none" title="Login with GitHub" onClick={() => handleSocialLogin('GitHub')}>
              <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#fff" fillOpacity="0.85" d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DestinationSearch;
