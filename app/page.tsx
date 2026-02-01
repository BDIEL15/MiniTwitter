"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');    
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(''); 

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      console.log("Login sukses:", data);
      router.push('/home'); 
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        <div className="mb-6">
            <Image 
                src="/logo.png" 
                alt="Logo" 
                width={100} 
                height={100} 
                
            />
        </div>

        <h1 className="text-3xl font-bold mb-8">Sign in to MiniTwitter</h1>

        {/* Tampilkan Error jika ada */}
        {errorMsg && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm w-full text-center">
                {errorMsg}
            </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 ml-1 text-gray-400">Email</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com"
              className="w-full p-4 bg-transparent border border-gray-700 rounded-md focus:border-[#1d9bf0] focus:outline-none transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 ml-1 text-gray-400">Password</label>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="........"
              className="w-full p-4 bg-transparent border border-gray-700 rounded-md focus:border-[#1d9bf0] focus:outline-none transition"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1d9bf0] text-white font-bold py-3 rounded-full mt-4 hover:bg-[#1a8cd8] transition disabled:opacity-50"
          >
            {loading ? "Checking..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-gray-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#1d9bf0] cursor-pointer hover:underline">
            Sign up
            </Link>
        </p>
      </div>
    </div>
  );
}