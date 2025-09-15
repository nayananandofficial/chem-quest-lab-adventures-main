import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker, FlaskConical, Atom, BookOpen, Users, Microscope, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Orbit Component (same as before)
const OrbitLayout = () => {
  const circles = [
    { radius: 220, count: 5, size: "w-16 h-16", color: "bg-white/10", offset: 0 },
    { radius: 170, count: 1, size: "w-14 h-14", color: "bg-white/10", offset: 45 },
    { radius: 120, count: 3, size: "w-12 h-12", color: "bg-white/10", offset: 30 },
    { radius: 70,  count: 1, size: "w-10 h-10", color: "bg-white/10", offset: -30 },
  ];

  const icons = [
    <Beaker className="h-7 w-7 text-blue-400" />,
    <FlaskConical className="h-7 w-7 text-purple-400" />,
    <Atom className="h-7 w-7 text-green-400" />,
    <Microscope className="h-7 w-7 text-yellow-400" />,
    <Users className="h-7 w-7 text-pink-400" />,
    <BookOpen className="h-6 w-6 text-indigo-400" />,
    <FlaskConical className="h-6 w-6 text-teal-400" />,
    <Atom className="h-6 w-6 text-emerald-400" />,
    <Users className="h-6 w-6 text-red-400" />,
  ];

  let iconIndex = 0;

  return (
    <div className="relative w-[550px] h-[550px]">
      {circles.map((circle, cIndex) => {
        const items = [];
        for (let i = 0; i < circle.count; i++) {
          const angle = ((i / circle.count) * 2 * Math.PI) + (circle.offset * Math.PI / 180);
          const x = Math.cos(angle) * circle.radius;
          const y = Math.sin(angle) * circle.radius;

          items.push(
            <div
              key={`${cIndex}-${i}`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%)`,
              }}
              className={`absolute ${circle.size} ${circle.color} rounded-full flex items-center justify-center shadow-lg backdrop-blur-md`}
            >
              {icons[iconIndex++]}
            </div>
          );
        }

        return (
          <div
            key={cIndex}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: circle.radius * 2,
              height: circle.radius * 2,
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
            }}
          >
            {items}
          </div>
        );
      })}

      {/* Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-6xl font-extrabold text-white">20k+</div>
        <div className="text-gray-300 text-xl">Specialists</div>
      </div>
    </div>
  );
};

// Glass Card Component
const GlassCard = ({ title, description, icon }) => (
  <Card className="bg-white/30 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-full">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      
      {/* Gradient Top Section */}
      <div className="bg-gradient-to-br from-[#f9b84c] via-[#845ec2] to-[#2c73d2] text-white">
        
        {/* Header */}
        <header className="container mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Virtual Science Lab</h1>
          <div>
            {user ? (
              <Button onClick={() => navigate('/lab')} className="bg-white text-black px-6 py-2">
                Enter Lab
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')} className="bg-white text-black px-6 py-2">
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-snug mb-6">
              Unlock Top Chemistry Learning Tools
              <br />
              You Thought Were Out of Reach —
              <br />
              <span className="text-yellow-300">Now Just One Click Away!</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              Explore a fully interactive virtual chemistry lab with advanced tools, guided lessons, 
              and thousands of reactions to experiment safely and effectively.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate(user ? '/lab' : '/auth')}
                className="bg-white text-black px-8 py-4 text-lg rounded-xl shadow-lg hover:bg-gray-200"
              >
                {user ? 'Enter Lab' : 'Start Learning'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="bg-transparent border border-white px-8 py-4 text-lg rounded-xl hover:bg-white hover:text-black"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <OrbitLayout />
          </div>
        </main>
      </div>

     {/* About Us */}
<div className="container mx-auto px-6 py-16">
  <motion.div
    className="rounded-2xl p-10 shadow-xl bg-gray-50"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    viewport={{ once: true }}
  >
    {/* About Us Section */}
    <section className="grid md:grid-cols-2 gap-10 items-center">
      {/* Left Side - Image */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <img
          src="https://www.euroschoolindia.com/blogs/wp-content/uploads/2024/01/why-is-chemistry-important-jpg.webp"
          alt="About us"
          className="rounded-2xl shadow-lg w-full object-cover"
        />
        {/* Badge */}
        <motion.div
          className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-full shadow flex items-center gap-2"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex -space-x-2">
            <img src="https://randomuser.me/api/portraits/women/65.jpg" className="w-8 h-8 rounded-full border" alt="" />
            <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-8 h-8 rounded-full border" alt="" />
            <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-8 h-8 rounded-full border" alt="" />
          </div>
          <span className="text-sm font-medium text-gray-700">Join 350+ learners</span>
        </motion.div>
      </motion.div>

      {/* Right Side - Content */}
      <motion.div
        className="text-center md:text-left"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold mb-4">
          Where Chemistry Sparks Curiosity
        </h2>
        <p className="text-gray-600 mb-6 max-w-lg">
          We are on a mission to make chemistry education accessible, interactive, and fun. 
          Our virtual science lab provides a safe environment where students can explore 
          complex chemical reactions, learn theoretical concepts, and practice experiments 
          without real-world risks.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition"
        >
          Read More →
        </motion.button>

        {/* Features */}
        <div className="mt-10 grid grid-cols-2 gap-6">
          <motion.div
            className="bg-white rounded-xl p-6 shadow text-left"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="text-indigo-600 text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-lg">Safe Learning</h3>
            <p className="text-gray-500 text-sm">
              Practice experiments without real-world hazards in a secure environment.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow text-left"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-indigo-600 text-2xl mb-2">🌍</div>
            <h3 className="font-semibold text-lg">Accessible</h3>
            <p className="text-gray-500 text-sm">
              Designed for everyone, making science education easy and inclusive.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  </motion.div>
</div>

{/* MVP Features Section with Glassy Cards */}
<section className="relative py-20 px-6 md:px-12 bg-gradient-to-br from-indigo-900 via-gray-900 to-black">
  <div className="max-w-7xl mx-auto">
    
    {/* Section Header */}
    <div className="text-center mb-16">
      <span className="px-4 py-1 text-sm md:text-base font-medium bg-white/10 text-white rounded-full border border-white/20">
        HIGHLIGHTS
      </span>

      <h2 className="text-3xl md:text-5xl font-bold mt-4 text-white leading-snug">
        Meet the new era of <span className="text-purple-300">Virtual Labs</span>
      </h2>

      <p className="mt-4 text-base md:text-lg text-white/70 max-w-2xl mx-auto">
        Explore, simulate, and learn chemistry experiments in a virtual interactive environment.
      </p>
    </div>

    {/* Features Grid */}
    <div className="grid md:grid-cols-6 gap-6">
      
      {/* Virtual Experiments (Wide Card) */}
      <div className="md:col-span-4 rounded-2xl p-8 
        bg-gradient-to-br from-white/20 to-white/5 
        backdrop-blur-xl border border-white/30 
        shadow-2xl shadow-black/30 
        text-white flex flex-col justify-between 
        hover:scale-105 transition-transform duration-300">
        
        <h3 className="text-2xl font-semibold mb-3">Virtual Experiments</h3>
        <p className="text-white/80">
          Safely simulate chemical reactions in an interactive 3D virtual lab.
        </p>

        <button className="mt-6 bg-white/20 text-white px-4 py-2 rounded-full font-medium hover:bg-white/30">
          Start Lab →
        </button>

        <img
          src="https://cdn-icons-png.flaticon.com/512/2927/2927347.png"
          alt="Lab Flask"
          className="w-24 mx-auto mt-6 opacity-90"
        />
      </div>

      {/* Instant Simulations (Tall Card) */}
      <div className="md:col-span-2 rounded-2xl p-8 
        bg-gradient-to-br from-white/20 to-white/5 
        backdrop-blur-xl border border-white/30 
        shadow-2xl shadow-black/30 
        text-white flex flex-col justify-between hover:scale-105 transition-transform duration-300">
        
        <h3 className="text-2xl font-semibold mb-3">Instant Simulations</h3>
        <p className="text-white/80">
          Run experiments instantly with pre-built templates and auto-results.
        </p>

        <button className="mt-6 bg-white/20 text-white px-4 py-2 rounded-full font-medium hover:bg-white/30">
          Try Now →
        </button>

        <img
          src="https://cdn-icons-png.flaticon.com/512/1048/1048877.png"
          alt="Atom"
          className="w-20 mx-auto mt-6 opacity-90"
        />
      </div>

      {/* Compound Library */}
      <div className="md:col-span-2 rounded-2xl p-8 
        bg-gradient-to-br from-white/20 to-white/5 
        backdrop-blur-xl border border-white/30 
        shadow-2xl shadow-black/30 
        text-white flex flex-col items-center hover:scale-105 transition-transform duration-300">
        
        <h3 className="text-2xl font-semibold mb-3">Compound Library</h3>
        <p className="text-white/80 text-center">
          Explore thousands of molecules, reactions, and chemical properties.
        </p>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3142/3142315.png"
          alt="Molecule"
          className="w-20 mt-6 opacity-90"
        />
      </div>

      {/* Progress Tracking */}
      <div className="md:col-span-2 rounded-2xl p-8 
        bg-gradient-to-br from-white/20 to-white/5 
        backdrop-blur-xl border border-white/30 
        shadow-2xl shadow-black/30 
        text-white flex flex-col items-center hover:scale-105 transition-transform duration-300">
        
        <h3 className="text-2xl font-semibold mb-3">Progress Tracking</h3>
        <p className="text-white/80 text-center">
          Monitor experiment history and track your chemistry learning journey.
        </p>

        {/* Tracking Bars */}
        <div className="flex items-end justify-center gap-2 mt-6 w-full h-24">
          <div className="w-2 bg-white rounded-full h-14"></div>
          <div className="w-2 bg-white/60 rounded-full h-24"></div>
          <div className="w-2 bg-white rounded-full h-16"></div>
          <div className="w-2 bg-white/60 rounded-full h-20"></div>
          <div className="w-2 bg-white rounded-full h-10"></div>
          <div className="w-2 bg-white/60 rounded-full h-24"></div>
          <div className="w-2 bg-white rounded-full h-10"></div>
          <div className="w-2 bg-white/60 rounded-full h-20"></div>
          <div className="w-2 bg-white rounded-full h-14"></div>
          <div className="w-2 bg-white rounded-full h-12"></div>
          <div className="w-2 bg-white/60 rounded-full h-24"></div>
          <div className="w-2 bg-white rounded-full h-8"></div>
        </div>
      </div>

      {/* Global Access */}
      <div className="md:col-span-2 rounded-2xl p-8 
        bg-gradient-to-br from-white/20 to-white/5 
        backdrop-blur-xl border border-white/30 
        shadow-2xl shadow-black/30 
        text-white flex flex-col items-center hover:scale-105 transition-transform duration-300">
        
        <h3 className="text-2xl font-semibold mb-3">Global Access</h3>
        <p className="text-white/80 text-center">
          Learn anytime, anywhere with worldwide access to the virtual lab.
        </p>

        {/* Globe Below */}
        <div className="flex justify-center mt-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/44/44948.png"
            alt="Worldwide Access"
            className="w-16 h-16 opacity-90"
          />
        </div>
      </div>
    </div>
  </div>
</section>



     


      {/* What We Do Section */}
      <section className="container mx-auto px-4 py-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard
            title="Interactive Experiments"
            description="Hands-on virtual labs with real-time feedback and error analysis."
            icon={<FlaskConical className="h-6 w-6 text-yellow-400" />}
          />
          <GlassCard
            title="Detailed Lessons"
            description="Step-by-step tutorials explaining core chemistry concepts clearly."
            icon={<BookOpen className="h-6 w-6 text-yellow-400" />}
          />
          <GlassCard
            title="Performance Tracking"
            description="Monitor learning progress and get personalized recommendations."
            icon={<Users className="h-6 w-6 text-yellow-400" />}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-12 text-center text-gray-500">
        © 2024 Virtual Science Lab. Empowering the next generation of chemists.
      </footer>
    </div>
  );
};

export default Index;
