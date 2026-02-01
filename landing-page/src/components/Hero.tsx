import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Zap } from 'lucide-react';

export const Hero = () => {
  return (
    <div className="relative bg-brand-dark overflow-hidden pt-20">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 mix-blend-multiply opacity-40"></div>
        {/* Animated blobs */}
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/30 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-secondary/30 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pb-32">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">El Futuro de tus Finanzas</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                está en Biterva
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl mx-auto text-xl text-gray-300"
          >
            Envía y recibe Satoshis al instante. Convierte tus criptos a Nequi en segundos. 
            Ahorra, invierte y obtén préstamos con el poder de Bitcoin.
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center gap-4"
          >
            <a
              href="#contact"
              className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-brand-primary hover:bg-blue-600 md:py-4 md:text-lg md:px-10 transition-all shadow-lg hover:shadow-brand-primary/50"
            >
              Me Interesa
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="#features"
              className="flex items-center justify-center px-8 py-3 border border-gray-600 text-base font-medium rounded-full text-gray-300 hover:bg-gray-800 md:py-4 md:text-lg md:px-10 transition-all"
            >
              Saber Más
            </a>
          </motion.div>
        </div>

        {/* Hero Image / Mockup Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 w-full relative"
        >
            <div className="absolute inset-0 bg-brand-secondary blur-3xl opacity-20 transform rotate-[-5deg]"></div>
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden p-4 sm:p-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="text-center md:text-left bg-gradient-to-br from-brand-dark to-gray-900 rounded-xl p-6 border border-white/5 hover:scale-105 transition-transform duration-300">
                        <Zap className="h-12 w-12 text-yellow-400 mx-auto md:mx-0 mb-4" />
                        <h3 className="text-xl font-bold text-white">Lightning Network</h3>
                        <p className="text-gray-400 mt-2">Pagos instantáneos con comisiones cercanas a cero.</p>
                    </div>
                    <div className="flex justify-center">
                         {/* Here we would put a phone mockup. Using a simple glass styling for now. */}
                        <div className="w-64 h-[500px] border-8 border-gray-800 rounded-[3rem] bg-gray-900 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                           <div className="w-full h-full bg-brand-dark relative z-10 flex flex-col items-center pt-10">
                              <img src="/logo.png" className="w-20 h-20 mb-4" alt="Biterva" />
                              <div className="text-2xl font-bold text-white mb-2">$125,430</div>
                              <div className="text-sm text-green-400 mb-8">+2.4% hoy</div>
                              
                              <div className="w-full bg-white/10 h-full rounded-t-3xl p-4 space-y-3">
                                  <div className="w-full h-12 bg-white/5 rounded-xl flex items-center px-3">
                                      <div className="w-8 h-8 rounded-full bg-orange-500"></div>
                                      <div className="ml-3 h-2 w-24 bg-white/20 rounded"></div>
                                  </div>
                                  <div className="w-full h-12 bg-white/5 rounded-xl flex items-center px-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                                      <div className="ml-3 h-2 w-24 bg-white/20 rounded"></div>
                                  </div>
                              </div>
                           </div>
                        </div>
                    </div>
                    <div className="text-center md:text-right bg-gradient-to-br from-brand-dark to-gray-900 rounded-xl p-6 border border-white/5 hover:scale-105 transition-transform duration-300">
                        <Smartphone className="h-12 w-12 text-brand-primary mx-auto md:ml-auto md:mr-0 mb-4" />
                        <h3 className="text-xl font-bold text-white">Cripto a Nequi</h3>
                        <p className="text-gray-400 mt-2">Baja tus fondos directamente a tu cuenta Nequi al instante.</p>
                    </div>
               </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};
