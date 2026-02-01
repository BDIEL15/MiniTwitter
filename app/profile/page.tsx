"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // <--- 1. IMPORT IMAGE DITAMBAHKAN
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  
  // state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  // Dummy
  const TRENDS = [
    { category: 'Technology · Trending', topic: '#NextJS', posts: '154K posts' },
    { category: 'Trending in Indonesia', topic: 'Nasi Goreng', posts: '22.1K posts' },
    { category: 'Entertainment · Trending', topic: 'CEOyangMenyamar', posts: '98K posts' },
    { category: 'Sports · Trending', topic: 'Timnas Indonesia', posts: '50.5K posts' },
    { category: 'Politics', topic: 'Owo', posts: '1.2M posts' },
  ];

  // cek user dan ambil tweet mereka doang
  useEffect(() => {
    const getUserAndPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/'); 
      } else {
        setCurrentUser(user);
        fetchUserPosts(user.id);
      }
    };
    getUserAndPosts();
  }, []);

  // function buat ngambil tweet khusus user 
  const fetchUserPosts = async (userId: string) => {
    setLoading(true);
    
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
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
    setLoading(false);
  };

  // sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Delete Tweet
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

  // Like 
  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (isCurrentlyLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
      if (!error) fetchUserPosts(currentUser.id); 
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: currentUser.id });
      if (!error) fetchUserPosts(currentUser.id); 
    }
  };

  // inisial nama 
  const getInitial = () => {
    if (!currentUser) return '?';
    const fullName = currentUser.user_metadata?.full_name;
    const username = currentUser.user_metadata?.username;
    const email = currentUser.email;

    if (fullName) return fullName[0].toUpperCase();
    if (username) return username[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return '?';
  };

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
             className="object-contain" // Agar gambar tidak gepeng
           />
        </div>

        <nav className="space-y-4 flex-1">
          <Link href="/home" className="flex items-center space-x-4 text-xl p-3 hover:bg-gray-900 rounded-full transition w-full">
            <span>🏠</span>
            <span className="hidden md:inline">Home</span>
          </Link>
          <Link href="/profile" className="flex items-center space-x-4 text-xl font-bold p-3 hover:bg-gray-900 rounded-full transition w-full">
            <span>👤</span>
            <span className="hidden md:inline">Profile</span>
          </Link>
        </nav>

        <button className="bg-[#1d9bf0] text-white font-bold py-3 px-8 rounded-full w-full shadow-lg hover:bg-[#1a8cd8] transition hidden md:block mt-4">
          Post
        </button>

        <div className="mt-auto flex items-center space-x-3 p-3 hover:bg-gray-900 rounded-full cursor-pointer w-full mb-4">
           {/* Avatar Kecil di Sidebar */}
           <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold">
              {getInitial()}
           </div>
           <div className="hidden md:block overflow-hidden">
             <p className="font-bold text-sm truncate">{currentUser?.user_metadata?.full_name || 'User'}</p>
             <p className="text-gray-500 text-sm truncate">@{currentUser?.user_metadata?.username || 'username'}</p>
           </div>
        </div>
      </div>


      {/*BAGIAN TENGAH*/}
      <main className="flex-1 max-w-2xl border-r border-gray-800 min-h-screen pb-20">
        
        {/* Header Nama */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md px-4 py-1 border-b border-gray-800 z-10 flex items-center gap-4">
          <Link href="/home" className="hover:bg-gray-800 p-2 rounded-full transition">←</Link>
          <div>
            <h1 className="text-xl font-bold">{currentUser?.user_metadata?.full_name || 'Loading...'}</h1>
            <p className="text-gray-500 text-sm">{posts.length} posts</p>
          </div>
        </div>

        {/* Banner Area */}
        <div className="h-[200px] bg-slate-800 w-full relative"></div>

        {/* Info Profil */}
        <div className="px-4 relative">
            {/* Avatar Besar di Header Profil */}
            <div className="absolute -top-16 left-4">
                <div className="w-32 h-32 bg-gray-700 rounded-full border-4 border-black flex items-center justify-center text-4xl font-bold">
                    {getInitial()}
                </div>
            </div>

            <div className="flex justify-end py-3 gap-2">
                <button 
                    onClick={handleSignOut}
                    className="border border-gray-600 font-bold px-4 py-2 rounded-full hover:bg-gray-900 transition text-sm text-red-500"
                >
                    Sign Out
                </button>
                <button className="border border-gray-600 font-bold px-4 py-2 rounded-full hover:bg-gray-900 transition">
                    Edit Profile
                </button>
            </div>

            <div className="mt-4">
                <h2 className="text-2xl font-bold">{currentUser?.user_metadata?.full_name || 'User'}</h2>
                <p className="text-gray-500">@{currentUser?.user_metadata?.username || 'username'}</p>
                
                <p className="mt-3 text-white">
                    Ini adalah bio profil saya. Masih belajar Next.js! 🚀
                </p>

                <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
                    <span className="flex items-center gap-1">📍 Jakarta</span>
                    <span className="flex items-center gap-1">📅 Joined January 2026</span>
                </div>

                <div className="flex gap-4 mt-3 text-sm">
                    <p><span className="font-bold text-white">14</span> <span className="text-gray-500">Following</span></p>
                    <p><span className="font-bold text-white">32</span> <span className="text-gray-500">Followers</span></p>
                </div>
            </div>
        </div>

        {/* Tab Menu */}
        <div className="flex border-b border-gray-800 mt-4">
            <div className="flex-1 hover:bg-gray-900 transition cursor-pointer p-4 text-center font-bold border-b-4 border-[#1d9bf0]">
                Posts
            </div>
            <div className="flex-1 hover:bg-gray-900 transition cursor-pointer p-4 text-center text-gray-500">
                Replies
            </div>
            <div className="flex-1 hover:bg-gray-900 transition cursor-pointer p-4 text-center text-gray-500">
                Likes
            </div>
        </div>

        {/*DAFTAR POSTINGAN USER*/}
        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading tweets...</div>
        ) : posts.length === 0 ? (
            <div className="p-8 text-center border-b border-gray-800">
                <h2 className="text-2xl font-bold mb-2">No posts yet</h2>
                <p className="text-gray-500">Your posts will appear here once you make them.</p>
            </div>
        ) : (
            posts.map((post) => (
                <div key={post.id} className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition cursor-pointer relative group">
                   
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
            ))
        )}

      </main>


      {/*KOLOM KANAN*/}
      <div className="hidden lg:block w-80 p-4 space-y-4">
        <div className="bg-[#202327] rounded-full py-2 px-4 flex items-center space-x-2 focus-within:bg-black focus-within:ring-1 ring-[#1d9bf0]">
          <span>🔍</span>
          <input type="text" placeholder="Search" className="bg-transparent outline-none w-full text-white" />
        </div>

        <div className="bg-[#16181c] rounded-xl p-4 space-y-2 border border-gray-800">
          <h2 className="font-bold text-xl">Welcome to MiniTwitter</h2>
          <p className="text-gray-400 text-sm">A mini social media platform built for EXERCISE FTUI 2026 recruitment.</p>
        </div>

        <div className="bg-[#16181c] rounded-xl pt-3 pb-3 border border-gray-800">
            <h2 className="font-bold text-xl px-4 mb-3">Trends for you</h2>
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
        </div>
      </div>

    </div>
  );
}