import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};

const PostCard = ({ post, onDelete, onLike }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.content || '');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  // Convert both to strings for comparison (handles ObjectId vs string)
  const isOwner = String(user.id) === String(post.userId);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await api.put(`/posts/${post._id}/like`);
      onLike(response.data);
      const isNowLiked = response.data.likedBy?.some(id => String(id) === String(user.id)) || false;
      toast.success(isNowLiked ? 'Post liked!' : 'Like removed');
    } catch (error) {
      toast.error('Failed to like post');
      console.error('Like error:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await api.delete(`/posts/${post._id}`);
      onDelete(post._id);
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete post');
      console.error('Delete error:', error);
    }
  };

  const isLiked = post.likedBy?.some(id => String(id) === String(user.id)) || false;

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-900/5 p-6 mb-5 hover:shadow-2xl transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{post.username}</h3>
          <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
        </div>
        {isOwner && (
          <div className="flex items-center gap-3">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600 active:text-red-700 font-medium text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      
      {post.imageUrl && (
        <div className="mb-4">
          <img src={post.imageUrl} alt="Post" className="rounded-xl w-full object-cover max-h-96" />
        </div>
      )}

      {!isEditing ? (
        <p className="text-gray-800 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
      ) : (
        <div className="mb-4">
          <textarea
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="mt-3 flex gap-3">
            <button
              onClick={async () => {
                const trimmed = editText.trim();
                if (!trimmed) return toast.error('Content cannot be empty');
                try {
                  const { data } = await api.patch(`/posts/${post._id}`, { content: trimmed });
                  onLike(data);
                  setIsEditing(false);
                  toast.success('Post updated');
                } catch (e) {
                  toast.error('Failed to update');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => { setIsEditing(false); setEditText(post.content || ''); }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 shadow-sm ${
            isLiked
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span className="font-semibold">{post.likes || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-semibold"
        >
          {showComments ? 'Hide comments' : `Comments (${post.comments?.length || 0})`}
        </button>
      </div>
      {showComments && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="space-y-3 mb-4">
            {(post.comments || []).map((c) => (
              <div key={c._id} className="text-sm">
                <span className="font-semibold text-gray-900">{c.username}</span>
                <span className="text-gray-600"> — {c.text}</span>
              </div>
            ))}
            {(!post.comments || post.comments.length === 0) && (
              <p className="text-sm text-gray-500">No comments yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={async () => {
                const trimmed = commentText.trim();
                if (!trimmed) return;
                try {
                  const { data } = await api.post(`/posts/${post._id}/comments`, { text: trimmed });
                  onLike(data);
                  setCommentText('');
                } catch (e) {
                  toast.error('Failed to comment');
                }
              }}
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;

