import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, getDocs, addDoc, updateDoc, serverTimestamp, orderBy, deleteDoc, doc, where, getDoc } from 'firebase/firestore';
import { LogOut, Trash2, Sun, Moon } from 'lucide-react';
import { FaXTwitter, FaTiktok, FaLinkedin, FaInstagram } from 'react-icons/fa6';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function ProjectCarousel({ images, title }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  const scrollPrev = React.useCallback((e) => {
    e.preventDefault();
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback((e) => {
    e.preventDefault();
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!images || images.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-zinc-800">
        <span className="text-sm font-medium tracking-wider uppercase">Project Preview</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group/carousel overflow-hidden" ref={emblaRef}>
      <div className="flex h-full touch-pan-y">
        {images.map((imgUrl, i) => (
          <div className="flex-[0_0_100%] min-w-0 h-full relative" key={i}>
            <img 
              src={imgUrl} 
              alt={`${title} - image ${i + 1}`} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
            />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <button 
            type="button"
            onClick={scrollPrev} 
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-black hover:scale-110 transition-all duration-300"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            type="button"
            onClick={scrollNext} 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-black hover:scale-110 transition-all duration-300"
          >
            <ChevronRight size={16} />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Home() {
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const qProj = query(collection(db, 'projects'), where('visibility', '==', 'public'));
        const snapshotProj = await getDocs(qProj);
        const fetchedProjects = snapshotProj.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedProjects.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setProjects(fetchedProjects);

        const qBlog = query(collection(db, 'blogs'), where('visibility', '==', 'public'));
        const snapshotBlog = await getDocs(qBlog);
        const fetchedBlogs = snapshotBlog.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedBlogs.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setBlogs(fetchedBlogs);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    }
    loadData();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      setSubmitError('Please fill out all fields.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await addDoc(collection(db, 'messages'), {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        createdAt: serverTimestamp()
      });
      setSubmitSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { isDark, toggleTheme } = React.useContext(ThemeContext);

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black pb-24">
      {/* Header Section */}
      <header className="w-full relative">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="absolute top-4 right-4 md:top-8 md:right-8 p-3 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white hover:scale-110 transition-transform z-50 shadow-md"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Massive full-width text */}
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[18vw] md:text-[20vw] leading/[0.75] font-black tracking-tighter text-center pt-6 pb-2 md:pb-6 overflow-hidden text-black dark:text-white">
          ANTELIO
        </motion.h1>
        {/* Navigation */}
        <nav className="flex justify-between items-center px-4 md:px-8 py-5 border-t border-b border-zinc-300 dark:border-[#222] text-lg md:text-xl text-zinc-600 dark:text-zinc-500 font-medium whitespace-nowrap overflow-x-auto gap-4">
          <a href="#" className="text-black dark:text-white hover:text-black dark:hover:text-white transition-colors">Home</a>
          <a href="#projects" className="hover:text-black dark:hover:text-white transition-colors">Projects</a>
          <a href="#about" className="hover:text-black dark:hover:text-white transition-colors">About</a>
          <a href="#contact" className="hover:text-black dark:hover:text-white transition-colors">Contact</a>
        </nav>
      </header>

      {/* Hero Content Section */}
      <section id="about" className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="/hero.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 to-[#0a0a0a]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-16 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 shrink-0 rounded-full overflow-hidden border border-zinc-300 dark:border-[#333] shadow-2xl relative group pointer-events-auto"
          >
            <img 
              src="/Profile1.jpg" 
              alt="Elijah Savage" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="max-w-4xl pointer-events-auto"
          >
            <h2 className="text-[1.75rem] md:text-4xl lg:text-5xl xl:text-6xl font-medium leading-[1.3] md:leading-[1.2] tracking-tight mb-4 text-zinc-900 dark:text-zinc-100">
              Hi, I'm Elijah,—Product engineer
            </h2>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl font-light">
              Crafting interactive experiences and digital products with over 3 years of experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#projects" 
                className="bg-black text-white dark:bg-white dark:text-black px-8 py-3.5 rounded-full text-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors inline-block">
                All Projects
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:savageelijah994@gmail.com" 
                className="bg-white text-black dark:bg-[#1a1a1a] dark:text-white px-8 py-3.5 rounded-full text-lg font-medium hover:bg-zinc-100 dark:hover:bg-[#2a2a2a] transition-colors border border-zinc-300 dark:border-[#333] inline-block">
                Get in Touch
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="projects" className="px-4 md:px-8 pt-12 w-full">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8">
          Case Studies
        </motion.h2>
        <p className="text-2xl md:text-3xl lg:text-4xl text-zinc-600 dark:text-zinc-400 max-w-4xl leading-[1.4] mb-12 font-medium">
          The projects here come from real collaborations with clients at different stages. Some needed a clearer brand, others a website that finally made sense.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 w-full">
          {projects.length > 0 ? projects.map((proj, idx) => {
            const CardWrapper = proj.link ? motion.a : motion.div;
            const wrapperProps = proj.link ? { href: proj.link, target: "_blank", rel: "noreferrer" } : {};
            
            return (
              <CardWrapper 
                {...wrapperProps} 
                key={proj.id} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                className="group block mb-4"
              >
                <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-[#111] rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-[#222] mb-6">
                  <ProjectCarousel images={proj.imageUrls || (proj.imageUrl ? [proj.imageUrl] : [])} title={proj.title} />
                </div>
                <div className="flex flex-col gap-3 px-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white tracking-tight">{proj.title}</h3>
                  {proj.tags && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {proj.tags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="bg-zinc-100 dark:bg-[#111] text-zinc-600 dark:text-zinc-400 text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-[#222]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardWrapper>
            );
          }) : (
            <div className="text-zinc-500 text-xl py-12">No projects added yet...</div>
          )}
        </div>

        {/* Floating Inner Website Canvas (Example from mockup) */}
        {projects.length === 0 && (
          <div className="relative w-full aspect-[3/4] md:aspect-video bg-zinc-200 dark:bg-zinc-900 rounded-[2rem] overflow-hidden mt-8 border border-zinc-300 dark:border-[#222]">
            <div className="absolute left-6 right-6 md:left-24 md:right-24 bottom-0 top-[20%] bg-white rounded-t-[1.5rem] md:rounded-t-[2.5rem] p-6 md:p-12 shadow-2xl flex flex-col">
              {/* Inner Top Bar */}
              <div className="flex justify-between items-start text-black font-semibold text-[10px] md:text-sm mb-auto">
                <div>
                  <p className="font-bold mb-1 uppercase tracking-wider">Elijah Savage</p>
                  <p className="text-zinc-500 font-medium">Product Engineer</p>
                </div>
                <div className="hidden md:flex gap-16 text-zinc-800">
                  <ul className="space-y-1">
                    <li>Work</li>
                    <li>Studio</li>
                    <li>Contact</li>
                  </ul>
                  <ul className="space-y-1 text-zinc-500">
                    <li>SaaS</li>
                    <li>Architecture</li>
                    <li>Restaurants</li>
                    <li>Fashion</li>
                  </ul>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="text-zinc-500 font-medium">Lagos, Nigeria</p>
                </div>
              </div>

              {/* Inner Content Area */}
              <div>
                <h3 className="text-black text-[2.5rem] md:text-7xl lg:text-8xl font-bold tracking-tighter flex items-center gap-2 md:gap-4 mb-4">
                  OUR WORK
                </h3>
                <p className="text-zinc-800 text-sm md:text-lg max-w-2xl font-medium leading-[1.6] md:leading-relaxed pb-6 md:pb-8">
                  Elijah Savage is a product designer + frontend developer who works with Spline (3D), Framer and modern frontend tools (React, Tailwind, etc.). It's about blending futuristic 3D visuals with clean, functional UI/UX.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Blogs Section */}
      {blogs.length > 0 && (
        <section id="blogs" className="px-4 md:px-8 mt-24 w-full">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 text-black dark:text-white">
            Writings
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 w-full">
            {blogs.map((blog, idx) => {
              const MotionLink = motion.create(Link);
              
              return (
                <MotionLink 
                  to={`/blog/${blog.id}`}
                  key={blog.id} 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                  className="group block mb-4"
                >
                  <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-[#111] rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-[#222] mb-6">
                    <ProjectCarousel images={blog.imageUrls || (blog.imageUrl ? [blog.imageUrl] : [])} title={blog.title} />
                  </div>
                  <div className="flex flex-col gap-3 px-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white tracking-tight">{blog.title}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 line-clamp-3">{blog.content}</p>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {blog.tags.map((tag, tagIdx) => (
                          <span key={tagIdx} className="bg-zinc-100 dark:bg-[#111] text-zinc-600 dark:text-zinc-400 text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-[#222]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </MotionLink>
              );
            })}
          </div>
        </section>
      )}

      {/* Clients + Niches Section */}
      <section className="px-4 md:px-8 mt-24 mb-12 w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-zinc-100 dark:bg-[#111] border border-zinc-200 dark:border-[#222] rounded-[2rem] p-8 md:p-12 lg:p-16 hover:border-zinc-300 dark:hover:border-[#333] transition-colors"
        >
          <h3 className="text-2xl font-bold mb-8 text-black dark:text-white tracking-tight">CLIENTS + NICHES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-zinc-600 dark:text-zinc-400 text-[13px] leading-relaxed font-medium">
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> Startups</li>
              <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> Design agencies</li>
              <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> SaaS companies</li>
              <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> No-code agencies</li>
              <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> Creative studios</li>
              <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> Tech founders</li>
            </ul>
            <div>
              <p className="text-[11px] text-zinc-600 mb-4 uppercase tracking-wider font-semibold">Lethal at:</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> 2D + 3D brand experiences</li>
                <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> Interactive landing pages</li>
                <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> Design-to-code workflows</li>
                <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> Design system engineering</li>
                <li className="flex items-center gap-3"><span className="text-[#3b82f6] text-[1.5rem] leading-[0]">•</span> 2D illustration + icon design</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-4 md:px-8 mt-24 mb-12 w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-zinc-100 dark:bg-[#111] border border-zinc-200 dark:border-[#222] rounded-[2rem] p-8 md:p-12 lg:p-16 hover:border-zinc-300 dark:hover:border-[#333] transition-colors relative overflow-hidden"
        >
          {/* Subtle gradient glow in the background */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <h3 className="text-3xl md:text-5xl font-bold mb-4 text-black dark:text-white tracking-tight">Got a project?</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-10 text-lg md:text-xl font-medium max-w-xl">
            Let's build something great together. Drop me a message and I'll get back to you as soon as possible.
          </p>

          {submitSuccess ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-xl font-medium text-center">
              Message sent successfully! I'll be in touch soon.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-6 relative z-10">
              {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">
                  {submitError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 ml-1">Name</label>
                  <input 
                    id="name"
                    type="text" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded-xl p-4 text-black dark:text-white focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 ml-1">Email</label>
                  <input 
                    id="email"
                    type="email" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded-xl p-4 text-black dark:text-white focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 ml-1">Message</label>
                <textarea 
                  id="message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded-xl p-4 text-black dark:text-white focus:outline-none focus:border-zinc-500 transition-colors min-h-[150px] resize-y"
                  placeholder="Tell me about your project..."
                  disabled={isSubmitting}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-black text-white dark:bg-white dark:text-black font-semibold text-lg py-4 rounded-xl mt-4 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto md:px-12 self-start"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </motion.div>
      </section>

      <footer className="w-full text-center py-12 text-zinc-500 dark:text-zinc-600 mt-24 border-t border-zinc-200 dark:border-[#222]">
        <div className="flex justify-center items-center gap-8 md:gap-10 mb-8 text-black dark:text-zinc-400">
          <motion.a 
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0 }}
            whileHover={{ scale: 1.15, textShadow: "0px 0px 8px rgba(128,128,128,0.5)" }}
            href="#" aria-label="LinkedIn" className="hover:text-zinc-600 dark:hover:text-white transition-colors"
          ><FaLinkedin size={24} /></motion.a>
          <motion.a 
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.2 }}
            whileHover={{ scale: 1.15, textShadow: "0px 0px 8px rgba(128,128,128,0.5)" }}
            href="#" aria-label="X" className="hover:text-zinc-600 dark:hover:text-white transition-colors"
          ><FaXTwitter size={24} /></motion.a>
          <motion.a 
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.4 }}
            whileHover={{ scale: 1.15, textShadow: "0px 0px 8px rgba(128,128,128,0.5)" }}
            href="#" aria-label="Instagram" className="hover:text-zinc-600 dark:hover:text-white transition-colors"
          ><FaInstagram size={24} /></motion.a>
          <motion.a 
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.6 }}
            whileHover={{ scale: 1.15, textShadow: "0px 0px 8px rgba(128,128,128,0.5)" }}
            href="#" aria-label="TikTok" className="hover:text-zinc-600 dark:hover:text-white transition-colors"
          ><FaTiktok size={24} /></motion.a>
        </div>
        <Link to="/admin" className="hover:text-black dark:hover:text-white transition-colors text-xs tracking-wider uppercase font-semibold">Admin Login</Link>
      </footer>
    </div>
  );
}

function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // for blog
  const [link, setLink] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [tags, setTags] = useState('');
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('projects'); // projects, blogs, messages
  const [editingId, setEditingId] = useState(null); // id of doc being edited
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u && u.email === 'savageelijah994@gmail.com') {
        loadProjects();
        loadBlogs();
        loadMessages();
      }
    });
    return unsub;
  }, []);

  const loadProjects = async () => {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadBlogs = async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async () => {
    try {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_DIMENSION = 800;
          if (width > height && width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'projects') {
      if (!title || (!link && imageFiles.length === 0 && !editingId)) {
        alert("Please provide a title and either a link or images.");
        return;
      }
    } else {
      if (!title || !content) {
        alert("Please provide a title and content for the blog.");
        return;
      }
    }
    
    try {
      let finalImageUrls = [];
      let totalSizeStr = 0;
      if (imageFiles.length > 0) {
        if (imageFiles.length > 5) {
          alert("Please select maximum 5 images to avoid limits.");
          return;
        }
        for (const file of imageFiles) {
          if (file.size > 5000000) {
            alert(`Image ${file.name} is larger than 5MB. It will be skipped.`);
            continue;
          }
          const base64 = await compressImage(file);
          totalSizeStr += base64.length;
          // Firestore limit is ~1,048,576 bytes
          if (totalSizeStr > 900000) {
            alert(`Too many images or too large. Reached limit at image ${file.name}. Remaining images clipped.`);
            break;
          }
          finalImageUrls.push(base64);
        }
      }

      const tagList = tags.split(',').map(t => t.trim()).filter(t => t);

      const targetCollection = activeTab === 'projects' ? 'projects' : 'blogs';

      if (editingId) {
        const updateData = {
          title,
          tags: tagList.length > 0 ? tagList : null,
          link: link || null,
        };
        if (activeTab === 'blogs') updateData.content = content;
        
        if (finalImageUrls.length > 0) {
          updateData.imageUrls = finalImageUrls;
          updateData.imageUrl = finalImageUrls[0];
        }

        // Clean up nulls
        Object.keys(updateData).forEach(key => updateData[key] === null && delete updateData[key]);

        await updateDoc(doc(db, targetCollection, editingId), updateData);
      } else {
        const data = {
          title,
          visibility: 'public',
          createdAt: serverTimestamp()
        };
        if (activeTab === 'blogs') data.content = content;
        if (link) data.link = link;
        if (finalImageUrls.length > 0) {
          data.imageUrls = finalImageUrls;
          data.imageUrl = finalImageUrls[0];
        }
        if (tagList.length > 0) data.tags = tagList;
        
        await addDoc(collection(db, targetCollection), data);
      }
      
      resetForm();
      if (activeTab === 'projects') loadProjects();
      if (activeTab === 'blogs') loadBlogs();
    } catch (err) {
      console.error(err);
      alert('Error adding/updating item. Check permissions and data size.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setLink('');
    setImageFiles([]);
    setTags('');
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content || '');
    setLink(item.link || '');
    setTags(item.tags ? item.tags.join(', ') : '');
    setImageFiles([]); // We don't load files back, they can overwrite them
  };

  const handleDelete = async (id, type) => {
    try {
      await deleteDoc(doc(db, type, id));
      if (type === 'projects') loadProjects();
      if (type === 'blogs') loadBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-transparent text-white p-8">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-8">Admin Access</h1>
        <button onClick={handleLogin} className="bg-white text-black px-6 py-3 rounded-full font-medium">
          Sign in with Google
        </button>
        <Link to="/" className="mt-8 text-zinc-500 hover:text-white">← Back to home</Link>
      </div>
    );
  }

  if (user.email !== 'savageelijah994@gmail.com') {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="mb-4">You do not have permission to view the dashboard.</p>
        <button onClick={() => signOut(auth)} className="bg-white text-black px-6 py-2 rounded-full font-medium mb-4">
          Sign out
        </button>
        <Link to="/" className="text-zinc-500 hover:text-white">← Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black/80 backdrop-blur-md dark:text-white p-8 max-w-4xl mx-auto border-x border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">View Site</Link>
          <button onClick={() => signOut(auth)} className="bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white px-4 py-2 rounded-full text-sm">
            Sign out
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={() => { setActiveTab('projects'); resetForm(); }}
          className={`font-medium pb-2 -mb-[17px] border-b-2 transition-colors ${activeTab === 'projects' ? 'border-black text-black dark:border-white dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          Projects
        </button>
        <button 
          onClick={() => { setActiveTab('blogs'); resetForm(); }}
          className={`font-medium pb-2 -mb-[17px] border-b-2 transition-colors ${activeTab === 'blogs' ? 'border-black text-black dark:border-white dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          Blogs
        </button>
        <button 
          onClick={() => { setActiveTab('messages'); resetForm(); }}
          className={`font-medium pb-2 -mb-[17px] border-b-2 transition-colors ${activeTab === 'messages' ? 'border-black text-black dark:border-white dark:text-white' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          Messages
        </button>
      </div>

      {activeTab !== 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div>
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-medium">
                  {editingId ? `Edit ${activeTab === 'projects' ? 'Project' : 'Blog'}` : `Add New ${activeTab === 'projects' ? 'Project' : 'Blog'}`}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white">Cancel Edit</button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">{activeTab === 'projects' ? 'Project' : 'Blog'} Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-white text-black dark:bg-black dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
                
                {activeTab === 'blogs' && (
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Content</label>
                    <textarea 
                      value={content} 
                      onChange={e => setContent(e.target.value)}
                      className="w-full bg-white text-black dark:bg-black dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors min-h-[150px]"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Link (Optional)</label>
                  <input 
                    type="url" 
                    value={link} 
                    onChange={e => setLink(e.target.value)}
                    className="w-full bg-white text-black dark:bg-black dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Images (Optional, Multiple)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={e => {
                      if (e.target.files) {
                        setImageFiles(Array.from(e.target.files));
                      } else {
                        setImageFiles([]);
                      }
                    }}
                    className="w-full bg-white text-black dark:bg-black dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                  {imageFiles.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-2">{imageFiles.length} file(s) selected.</p>
                  )}
                  {editingId && imageFiles.length === 0 && (
                    <p className="text-xs text-zinc-500 mt-2">Leave empty to keep existing images.</p>
                  )}
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Tags (Comma separated)</label>
                  <input 
                    type="text" 
                    value={tags} 
                    onChange={e => setTags(e.target.value)}
                    className="w-full bg-white text-black dark:bg-black dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
                <button type="submit" className="bg-black text-white dark:bg-white dark:text-black font-medium py-3 rounded-lg mt-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                  {editingId ? 'Update' : 'Add'} {activeTab === 'projects' ? 'Project' : 'Blog'}
                </button>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div>
            <h2 className="text-2xl font-medium mb-6">Manage {activeTab === 'projects' ? 'Projects' : 'Blogs'}</h2>
            <div className="flex flex-col gap-4">
              {(activeTab === 'projects' ? projects : blogs).map(item => (
                <div key={item.id} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <div className="flex gap-4">
                      {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">Link</a>}
                      {item.imageUrl && <a href={item.imageUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">Image</a>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-blue-400 hover:bg-blue-400/10 px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id, activeTab === 'projects' ? 'projects' : 'blogs')}
                      className="text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {(activeTab === 'projects' ? projects : blogs).length === 0 && <p className="text-zinc-500">No {activeTab} added yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div>
          <h2 className="text-2xl font-medium mb-6">Messages</h2>
          <div className="flex flex-col gap-4">
            {messages.map(msg => (
              <div key={msg.id} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg text-black dark:text-white">{msg.name}</h3>
                    <a href={`mailto:${msg.email}`} className="text-sm text-blue-500 dark:text-blue-400 hover:underline">{msg.email}</a>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">{msg.message}</p>
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={async () => {
                      try {
                        await deleteDoc(doc(db, 'messages', msg.id));
                        loadMessages();
                      } catch (err) {
                        console.error('Failed to delete message', err);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center border-dashed">
                <p className="text-zinc-500">No messages yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BlogPost() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlog() {
      try {
        const d = await getDoc(doc(db, 'blogs', id));
        if (d.exists()) {
          setBlog({ id: d.id, ...d.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center p-8 text-center text-zinc-500">Loading...</div>;
  if (!blog) return <div className="min-h-screen bg-transparent flex items-center justify-center p-8 text-center text-zinc-500">Blog not found.</div>;

  return (
    <div className="min-h-screen bg-transparent text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <Link to="/" className="inline-flex items-center text-zinc-600 dark:text-zinc-500 hover:text-black dark:hover:text-white mb-12 transition-colors">
          <ChevronLeft size={16} className="mr-1" /> Back to home
        </Link>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-black dark:text-white">{blog.title}</h1>
        
        <div className="text-zinc-600 dark:text-zinc-500 text-sm font-medium mb-12 uppercase tracking-wider">
          {blog.createdAt ? new Date(blog.createdAt.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown date'}
        </div>

        {(blog.imageUrls?.length > 0 || blog.imageUrl) && (
          <div className="relative w-full aspect-video bg-zinc-100 dark:bg-[#111] rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-[#222] mb-12">
            <ProjectCarousel images={blog.imageUrls || (blog.imageUrl ? [blog.imageUrl] : [])} title={blog.title} />
          </div>
        )}

        <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-300 text-lg leading-relaxed mb-16 whitespace-pre-wrap font-medium">
          {blog.content}
        </div>

        {blog.link && (
          <div className="mb-12 pt-8 border-t border-zinc-300 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-500 mb-4 uppercase tracking-wider font-semibold">External Resource</p>
            <a href={blog.link} target="_blank" rel="noreferrer" className="inline-block bg-black text-white dark:bg-white dark:text-black font-semibold text-lg px-8 py-4 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95">
              Visit Link
            </a>
          </div>
        )}

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-8 border-t border-zinc-300 dark:border-zinc-800">
            {blog.tags.map((tag, tagIdx) => (
              <span key={tagIdx} className="bg-zinc-100 dark:bg-[#111] text-zinc-700 dark:text-zinc-400 text-sm px-4 py-2 rounded-full border border-zinc-200 dark:border-[#222] font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const ThemeContext = React.createContext({
  isDark: true,
  toggleTheme: () => {},
});

export default function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
    } else if (savedTheme === 'dark') {
      setIsDark(true);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className="bg-white dark:bg-black min-h-screen text-black dark:text-white transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </ThemeContext.Provider>
  );
}
