import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { login, register } from '../api';
import { useAuthStore } from '../store/authStore';

interface AuthScreenProps {
  onSuccess: () => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const response = await login({ email: formData.email, password: formData.password });
        setAuth(response.user, response.token);
        toast.success(`Welcome back, ${response.user.firstName}!`);
      } else {
        const response = await register(formData);
        setAuth(response.user, response.token);
        toast.success('Account created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-surface rounded-[2.5rem] p-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 micro-border">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h1 className="text-3xl font-black text-text-base tracking-tight italic">
            {isLogin ? 'RESTORE_SESSION' : 'CREATE_IDENTITY'}
          </h1>
          <p className="text-text-muted text-sm font-medium uppercase tracking-widest">
            {isLogin ? 'Enter your credentials' : 'Join the professional workspace'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="John"
                  className="input-field"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  className="input-field"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Email Protocol</label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Access Key</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary !py-4 !mt-6 shadow-xl shadow-primary/20"
          >
            {loading ? 'PROCESSING...' : isLogin ? 'INITIATE_LOGIN' : 'EXECUTE_SIGNUP'}
          </button>
        </form>

        <div className="relative !my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
            <span className="bg-bg-surface px-4 text-text-muted">Social Integration</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => window.location.href = '/oauth2/authorization/google'}
             className="btn-secondary flex items-center justify-center gap-2 py-3"
           >
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
             </svg>
             Google
           </button>
           <button 
             onClick={() => window.location.href = '/oauth2/authorization/github'}
             className="btn-secondary flex items-center justify-center gap-2 py-3"
           >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 4.238 9.611 9.388 10.65.6.094.821-.261.821-.579 0-.285-.011-1.04-.017-2.037-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.362.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.242 21.603 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
             </svg>
             GitHub
           </button>
        </div>

        <p className="text-center text-xs text-text-muted font-medium">
          {isLogin ? "Don't have an identity yet?" : "Already have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-black"
          >
            {isLogin ? 'REGISTER_NOW' : 'LOGIN_NOW'}
          </button>
        </p>
      </div>
    </div>
  );
}
