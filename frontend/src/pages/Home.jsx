import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50">
      <Navbar />

      <section className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent">
            Build your professional community
          </h1>
          <p className="mt-5 text-lg text-gray-700">
            Share updates, connect with others, and stay informed — a sleek LinkedIn-style experience built on MERN.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {!token ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3 rounded-full shadow-lg shadow-blue-600/10 transition duration-200 font-semibold"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-full shadow-lg shadow-gray-400/10 border transition duration-200 font-semibold"
                >
                  Create account
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/feed')}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3 rounded-full shadow-lg shadow-blue-600/10 transition duration-200 font-semibold"
              >
                Go to Feed{user?.name ? `, ${user.name}` : ''}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-900/5 p-6 md:p-8">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold">IN</div>
              <div>
                <p className="font-semibold text-gray-900">Post. Like. Connect.</p>
                <p className="text-sm text-gray-500">Your quick social feed.</p>
              </div>
            </div>
            <div className="h-44 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
              Preview your feed
            </div>
            <ul className="text-sm text-gray-700 list-disc pl-5">
              <li>Create text posts</li>
              <li>See a public feed</li>
              <li>Like or delete your own posts</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


