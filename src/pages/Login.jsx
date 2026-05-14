import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, BookOpen, Clock, Layers, Users, ArrowRight, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isRegistering) {
      // Handle Registration logic here
      console.log('Registering:', { name, email, phone, password });
      toast.success('Registration request sent!');
      setIsRegistering(false);
    } else {
      const user = login(email, password);
      if (user) {
        if (user.role === 'admin') navigate('/admin');
        else navigate('/bde');
      }
    }
    setLoading(false);
  };

  const fillAdmin = () => { setEmail('admin@aitel.com'); setPassword('admin123'); };
  const fillBDE = (n) => { setEmail(`bde${n}@aitel.com`); setPassword('bde123'); };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-poppins">
      
      {/* Left Side — Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-20 relative overflow-hidden">
        {/* Subtle Decorative Background Elements */}
        <div className="absolute top-10 left-10 opacity-20 pointer-events-none">
          <div className="grid grid-cols-4 gap-2">
            {[...Array(16)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />)}
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-50 rounded-full opacity-50 blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">
          {/* Brand Logo */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <img src="/favicon.png" alt="LeadPilot" className="w-20 h-20 object-contain drop-shadow-xl animate-float" />
            <h2 className="text-4xl font-bold text-brand-600 tracking-tighter">LeadPilot</h2>
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-gray-700 mb-2">
              {isRegistering ? 'Create Account' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 font-medium">
              {isRegistering ? 'Join the Aitel executive network.' : 'Please enter your details.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">
                      <Users size={18} />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400"
                      placeholder="Siva Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isRegistering && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 border-gray-300 rounded text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm font-bold text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm font-bold text-brand-600 hover:underline">
                  Forgot password
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4.5 rounded-xl shadow-xl shadow-brand-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-6 text-lg"
            >
              {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-medium">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"} {' '}
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-brand-600 font-bold hover:underline"
              >
                {isRegistering ? 'Sign In' : 'Request a free trial'}
              </button>
            </p>
          </div>

          {/* Development Quick Fill (Only show on Login) */}
          {!isRegistering && (
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between gap-4 opacity-40 hover:opacity-100 transition-opacity">
              <button onClick={fillAdmin} className="text-[10px] uppercase font-black text-gray-400 hover:text-brand-600 tracking-widest transition-colors">Demo Admin</button>
              <button onClick={() => fillBDE(1)} className="text-[10px] uppercase font-black text-gray-400 hover:text-brand-600 tracking-widest transition-colors">Demo Executive</button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side — Solid Blue & Features (Always Same) */}
      <div className="hidden md:flex w-1/2 bg-brand-600 relative overflow-hidden items-center justify-center p-12 lg:p-24">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        <div className="relative z-10 w-full max-w-sm space-y-0 divide-y divide-white/10">
          <CompactFeatureCard 
            icon={BookOpen}
            title="Visit our Support Center"
            desc="Get guidance from our Support team."
          />
          <CompactFeatureCard 
            icon={Clock}
            title="View our Product Roadmap"
            desc="Browse and vote on what's next."
          />
          <CompactFeatureCard 
            icon={Layers}
            title="Check out the latest releases"
            desc="See new features and updates."
          />
          <CompactFeatureCard 
            icon={Users}
            title="Join our Slack Community"
            desc="Discuss with hundreds of Corellium users."
          />
        </div>
      </div>
    </div>
  );
}

function CompactFeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="group py-8 flex items-center gap-6 hover:bg-white/5 transition-colors px-4 -mx-4 rounded-xl cursor-pointer">
      <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
        <Icon size={28} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold text-lg leading-tight mb-1">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
      </div>
      <ArrowRight size={20} className="text-white/30 group-hover:text-white group-hover:translate-x-2 transition-all" />
    </div>
  );
}
