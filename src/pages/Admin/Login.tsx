
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const { loginWithCredentials, user } = useAuth() as any;
    const navigate = useNavigate();
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (user) {
            navigate('/admin');
        }
    }, [user, navigate]);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await loginWithCredentials(username, password);
        if (result && result.success) {
            navigate('/admin');
        } else {
            setError(result?.message || 'Login failed. Check console or create user in Firebase.');
        }
    };

    // Google login removed per request

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

            <div className="bg-white dark:bg-surface-dark p-10 rounded-3xl shadow-float w-full max-w-md text-center relative z-10 border border-white/20">
                <div className="mb-8">
                    <span className="inline-block p-3 rounded-full bg-primary/10 text-primary mb-4">
                        <span className="material-symbols-outlined text-3xl">verified_user</span>
                    </span>
                    <h1 className="text-4xl font-display font-bold text-primary dark:text-white mb-2">Lava Admin</h1>
                    <p className="text-gray-500 font-light">Sign in to manage your luxury collection</p>
                </div>

                <form onSubmit={handleCredentialsLogin} className="space-y-5 mb-6">
                    <div className="space-y-1 text-left">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1 text-left">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2"><span className="material-symbols-outlined text-lg">error</span>{error}</div>}
                    <button
                        type="submit"
                        className="w-full py-4 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/30 active:scale-95"
                    >
                        Login to Dashboard
                    </button>
                </form>

                <div className="mt-8 text-xs text-gray-400 border-t border-gray-100 dark:border-white/5 pt-6">
                    <p>Contact system administrator to create an account.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
