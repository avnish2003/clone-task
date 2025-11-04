import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUserPosts = async () => {
    if (!user.id) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.get(`/posts/user/${user.id}`);
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load your posts');
      console.error('Fetch user posts error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };
  const handleLike = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };
  useEffect(() => {
    fetchUserPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent mb-2">
            {user.name}'s Profile
          </h2>
          <p className="text-gray-600">Your posts ({posts.length})</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-900/5">
            <p className="text-gray-600 text-lg">You haven't created any posts yet.</p>
            <button
              onClick={() => navigate('/create-post')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2 rounded-full shadow-lg shadow-blue-600/10 transition font-semibold"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

