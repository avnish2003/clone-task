import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 
          className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer"
          onClick={() => navigate('/')}
        >
          LinkedIn Clone
        </h1>
        
        <div className="flex items-center gap-3">
          {token ? (
            <>
              {user.name && (
                <span className="text-gray-700 font-semibold hidden sm:inline">
                  {user.name}
                </span>
              )}
              <button
                onClick={() => navigate('/feed')}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-full shadow-sm transition duration-200 font-semibold"
              >
                Feed
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-900 hover:bg-black active:bg-black text-white px-4 py-2 rounded-full shadow-sm transition duration-200 font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-full shadow-sm transition duration-200 font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-full shadow-sm transition duration-200 font-semibold border border-gray-200"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

