"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { supabase } from '@/lib/supabaseClient'; 

export default function SignUpPage() {
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username,
          full_name: formData.displayName,
        },
      },
    });

    if (error) {
      alert("Gagal daftar: " + error.message);
      setLoading(false);
    } else {
      
      setLoading(false);
      router.push('/home'); 
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
      {/* Container Utama */}
      <div className="w-full max-w-[450px] flex flex-col items-center">
        
        {/* Logo X Biru */}
        <div className="bg-[#1d9bf0] w-12 h-12 rounded-full flex items-center justify-center mb-6">
          <span className="text-white font-bold text-xl">X</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">Create your account</h1>

        <form onSubmit={handleSignUp} className="w-full space-y-5">
          
          {/* Input Username */}
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1 ml-1 text-gray-300">Username</label>
            <input 
              required
              name="username"
              type="text" 
              placeholder="johndoe"
              onChange={handleChange}
              className="w-full p-4 bg-[#16181c] border border-gray-700 rounded-md focus:border-[#1d9bf0] focus:outline-none transition text-white placeholder-gray-500"
            />
          </div>

          {/* Input Display Name */}
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1 ml-1 text-gray-300">Display Name</label>
            <input 
              required
              name="displayName"
              type="text" 
              placeholder="John Doe"
              onChange={handleChange}
              className="w-full p-4 bg-[#16181c] border border-gray-700 rounded-md focus:border-[#1d9bf0] focus:outline-none transition text-white placeholder-gray-500"
            />
          </div>

          {/* Input Email */}
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1 ml-1 text-gray-300">Email</label>
            <input 
              required
              name="email"
              type="email" 
              placeholder="you@example.com"
              onChange={handleChange}
              className="w-full p-4 bg-[#16181c] border border-gray-700 rounded-md focus:border-[#1d9bf0] focus:outline-none transition text-white placeholder-gray-500"
            />
          </div>

          {/* Input Password */}
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1 ml-1 text-gray-300">Password</label>
            <input 
              required
              name="password"
              type="password" 
              placeholder="........"
              onChange={handleChange}
              className="w-full p-4 bg-[#16181c] border border-gray-700 rounded-md focus:border-[#1d9bf0] focus:outline-none transition text-white placeholder-gray-500"
            />
          </div>

          {/* Tombol Sign Up */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1d9bf0] text-white font-bold py-4 rounded-full mt-6 hover:bg-[#1a8cd8] transition disabled:opacity-50 text-lg"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Link Balik ke Login */}
        <p className="mt-8 text-gray-500">
          Already have an account? <Link href="/" className="text-[#1d9bf0] cursor-pointer hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}