import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-brand-dark/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <img className="h-10 w-auto" src="/logo.png" alt="Biterva Logo" />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="hover:text-brand-primary text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Servicios</a>
                <a href="#defi" className="hover:text-brand-primary text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">DeFi</a>
                <a href="#contact" className="hover:text-brand-primary text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contacto</a>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <a href="#contact" className="bg-brand-primary hover:bg-blue-600 text-white px-4 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-brand-primary/50">
              Me Interesa
            </a>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-brand-dark border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#features" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Servicios</a>
            <a href="#defi" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>DeFi</a>
            <a href="#contact" className="text-brand-primary hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Me Interesa</a>
          </div>
        </motion.div>
      )}
    </nav>
  );
};
