import { useState } from 'react';
import Checkbox from '../components/Checkbox';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Community = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([
    { id: 1, author: 'Alice', content: 'Just discovered the power of spaced repetition!', likes: 12, comments: 3 },
    { id: 2, author: 'Bob', content: 'Anyone else loving the navy theme?', likes: 8, comments: 5 },
    { id: 3, author: 'Carol', content: 'The checkbox component is so smooth!', likes: 15, comments: 2 },
  ]);

  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
      } else {
        newSet.add(postId);
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
      return newSet;
    });
  };

  const handlePost = () => {
    if (newPost.trim()) {
      setPosts([{
        id: Date.now(),
        author: 'You',
        content: newPost,
        likes: 0,
        comments: 0,
      }, ...posts]);
      setNewPost('');
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className={`px-4 py-2 rounded-lg border border-slate-700 ${location.pathname === '/chat' ? 'bg-blue-800 text-white' : 'bg-slate-950 text-slate-200 hover:bg-slate-900'}`}
          >
            💬 Chat
          </button>
          <button
            type="button"
            onClick={() => navigate('/community')}
            className={`px-4 py-2 rounded-lg border border-slate-700 ${location.pathname === '/community' ? 'bg-blue-800 text-white' : 'bg-slate-950 text-slate-200 hover:bg-slate-900'}`}
          >
            👥 Community
          </button>
          <button
            type="button"
            onClick={() => navigate('/credits')}
            className={`px-4 py-2 rounded-lg border border-slate-700 ${location.pathname === '/credits' ? 'bg-blue-800 text-white' : 'bg-slate-950 text-slate-200 hover:bg-slate-900'}`}
          >
            ⭐ Credits
          </button>
        </div>

        <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-blue-200' : 'text-slate-900'}`}>
          Community Hub
        </h1>

        {/* New Post */}
        <div className={`mb-8 p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-900 bg-opacity-50' : 'bg-blue-50'}`}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts..."
            className={`w-full p-3 rounded-lg resize-none h-24 ${
              theme === 'dark'
                ? 'bg-slate-950 text-slate-100 placeholder-slate-500'
                : 'bg-white text-slate-900 placeholder-slate-500'
            } border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button
            onClick={handlePost}
            className="mt-3 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
          >
            Post
          </button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map(post => (
            <div
              key={post.id}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-900 bg-opacity-40' : 'bg-white'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                    {post.author}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {new Date(post.id).toLocaleDateString()}
                  </p>
                </div>

                <Checkbox
                  checked={likedPosts.has(post.id)}
                  onChange={() => handleLike(post.id)}
                  label="Like"
                />
              </div>
              <p className={`mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {post.content}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  ❤️ {post.likes} likes
                </span>
                <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  💬 {post.comments} comments
                </span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Community;