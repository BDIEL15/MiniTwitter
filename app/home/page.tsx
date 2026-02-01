"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // <--- 1. IMPORT IMAGE
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  // state and logic
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // DUMMY Trending Topics
  const TRENDS = [
    { category: 'Technology · Trending', topic: '#NextJS', posts: '154K posts' },
    { category: 'Trending in Indonesia', topic: 'Nasi Goreng', posts: '22.1K posts' },
    { category: 'Entertainment · Trending', topic: 'CEOyangMenyamar', posts: '98K posts' },
    { category: 'Sports · Trending', topic: 'Timnas Indonesia', posts: '50.5K posts' },
    { category: 'Politics', topic: 'Owo', posts: '1.2M posts' },
  ];

  //Buat Cek User Login
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/'); 
      } else {
        setCurrentUser(user);
        fetchPosts(user.id);
      }
    };
    getUser();
  }, []);

  // tweet dan like
  const fetchPosts = async (userId: string) => {
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: likesData } = await supabase.from('likes').select('*');

    if (postsData && likesData) {
      const postsWithLikes = postsData.map(post => {
        const postLikes = likesData.filter(like => like.post_id === post.id);
        const isLikedByMe = postLikes.some(like => like.user_id === userId);

        return {
          ...post,
          like_count: postLikes.length, 
          is_liked: isLikedByMe,        
        };
      });
      setPosts(postsWithLikes);
    }
  };

  // posting 
  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);

    const { error } = await supabase.from('posts').insert({
      content: content,
      user_id: currentUser.id,
      username: currentUser.user_metadata.username || 'Anonymous',
      display_name: currentUser.user_metadata.full_name || 'User',
    });

    if (error) {
      alert('Gagal posting: ' + error.message);
    } else {
      setContent('');
      fetchPosts(currentUser.id);
    }
    setLoading(false);
  };

  // buat DELETE tweet
  const handleDelete = async (postId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', currentUser.id); 

    if (error) {
      alert("Gagal menghapus: " + error.message);
    } else {
      setPosts(posts.filter((post) => post.id !== postId));
    }
  };

  // like tweet
  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (isCurrentlyLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
      if (!error) fetchPosts(currentUser.id); 
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: currentUser.id });
      if (!error) fetchPosts(currentUser.id); 
    }
  };


  // UI
  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      
      {/*SIDEBAR KIRI*/}
      <div className="w-16 md:w-64 flex flex-col items-center md:items-start p-4 border-r border-gray-800 h-screen sticky top-0">
        
        <div className="mb-6 p-2 hover:bg-gray-900 rounded-full cursor-pointer">
           <Image 
             src="/logo.png" 
             alt="Logo" 
             width={32} 
             height={32} 
             className="object-contain" 
           />
        </div>
        
        <nav className="space-y-4 flex-1">
          <Link href="/home" className="flex items-center space-x-4 text-xl font-bold p-3 hover:bg-gray-900 rounded-full transition">
            <span>🏠</span>
            <span className="hidden md:inline">Home</span>
          </Link>
          <Link href="/profile" className="flex items-center space-x-4 text-xl p-3 hover:bg-gray-900 rounded-full transition">
            <span>👤</span>
            <span className="hidden md:inline">Profile</span>
          </Link>
        </nav>

        <button 
            onClick={handlePost} 
            className="bg-[#1d9bf0] text-white font-bold py-3 px-8 rounded-full w-full shadow-lg hover:bg-[#1a8cd8] transition hidden md:block"
        >
          Post
        </button>

        <div className="mt-auto flex items-center space-x-3 p-3 hover:bg-gray-900 rounded-full cursor-pointer w-full">
           <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold">
              {currentUser?.email?.[0].toUpperCase()}
           </div>
           <div className="hidden md:block overflow-hidden">
             <p className="font-bold text-sm truncate">{currentUser?.user_metadata?.full_name || 'User'}</p>
             <p className="text-gray-500 text-sm truncate">@{currentUser?.user_metadata?.username || 'username'}</p>
           </div>
        </div>
      </div>


      {/*FEED TENGAH*/}
      <main className="flex-1 max-w-2xl border-r border-gray-800 min-h-screen pb-20">
        
        <div className="sticky top-0 bg-black/80 backdrop-blur-md p-4 border-b border-gray-800 z-10">
          <h1 className="text-xl font-bold">Home</h1>
        </div>

        {/* Input Tweet */}
        <div className="p-4 border-b border-gray-800 flex space-x-4">
           <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0"></div>
           <div className="flex-1">
             <textarea 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="What is happening?!" 
               className="w-full bg-transparent text-xl outline-none resize-none h-12 mt-2 placeholder-gray-500 text-white"
             />
             <div className="flex justify-end mt-2">
               <button 
                  onClick={handlePost}
                  disabled={loading || !content}
                  className="bg-[#1d9bf0] text-white font-bold px-4 py-2 rounded-full hover:bg-[#1a8cd8] disabled:opacity-50"
               >
                 {loading ? 'Posting...' : 'Post'}
               </button>
             </div>
           </div>
        </div>

        {/*DAFTAR TWEET*/}
        {posts.map((post) => (
          <div key={post.id} className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition cursor-pointer relative group">
             
             {/* Tombol Hapus */}
             {currentUser && currentUser.id === post.user_id && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleDelete(post.id);
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500 p-2 z-10"
                  title="Delete Tweet"
                >
                  🗑️
                </button>
             )}

             <div className="flex space-x-3">
               <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold">
                  {post.username ? post.username[0].toUpperCase() : '?'}
               </div>
               
               <div className="flex-1">
                 <div className="flex items-center space-x-2">
                   <span className="font-bold hover:underline">{post.display_name}</span>
                   <span className="text-gray-500">@{post.username}</span>
                   <span className="text-gray-500 text-sm">
                     · {new Date(post.created_at).toLocaleDateString()}
                   </span>
                 </div>
                 
                 <p className="mt-1 text-white">{post.content}</p>

                 <div className="flex justify-between mt-3 text-gray-500 max-w-xs">
                   <div className="hover:text-blue-500 cursor-pointer text-sm flex items-center gap-1">
                      <span>💬</span> <span>0</span>
                   </div>
                   <div className="hover:text-green-500 cursor-pointer text-sm flex items-center gap-1">
                      <span>🔁</span> <span>0</span>
                   </div>
                   <div 
                     onClick={() => handleLike(post.id, post.is_liked)}
                     className={`flex items-center gap-1 cursor-pointer text-sm group transition ${
                        post.is_liked ? "text-red-500" : "hover:text-red-500"
                     }`}
                   >
                      <span>{post.is_liked ? "❤️" : "🤍"}</span> 
                      <span>{post.like_count || 0}</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        ))}
      </main>

      {/* KOLOM KANAN: WIDGETS */}
      <div className="hidden lg:block w-80 p-4 space-y-4">
        
        {/* Search Bar */}
        <div className="bg-[#202327] rounded-full py-2 px-4 flex items-center space-x-2 focus-within:bg-black focus-within:ring-1 ring-[#1d9bf0]">
          <span>🔍</span>
          <input type="text" placeholder="Search" className="bg-transparent outline-none w-full text-white" />
        </div>

        {/* Kotak 1: Welcome */}
        <div className="bg-[#16181c] rounded-xl p-4 space-y-2 border border-gray-800">
          <h2 className="font-bold text-xl">Welcome to MiniTwitter</h2>
          <p className="text-gray-400 text-sm">A mini social media platform built for EXERCISE FTUI 2026 recruitment.</p>
        </div>

        {/* Kotak 2: TRENDING TOPICS (BARU) */}
        <div className="bg-[#16181c] rounded-xl pt-3 pb-3 border border-gray-800">
            <h2 className="font-bold text-xl px-4 mb-3">Trends for you</h2>
            
            {/* Kita looping Data Dummy TRENDS disini */}
            {TRENDS.map((trend, index) => (
                <div key={index} className="px-4 py-3 hover:bg-[#1d1f23] transition cursor-pointer relative">
                    <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                        <span>{trend.category}</span>
                        <span className="hover:bg-blue-500/20 hover:text-[#1d9bf0] rounded-full px-1.5 font-bold">···</span>
                    </div>
                    <p className="font-bold text-base text-white">{trend.topic}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{trend.posts}</p>
                </div>
            ))}

            <div className="px-4 py-3 text-[#1d9bf0] text-sm cursor-pointer hover:bg-[#1d1f23] rounded-b-xl">
                Show more
            </div>
        </div>

      </div>

    </div>
  );
}