import { motion } from 'framer-motion';
import { TrendingUp, PieChart, DollarSign } from 'lucide-react';

export const DeFiSection = () => {
  return (
    <div className="py-24 bg-gray-900 overflow-hidden relative" id="defi">
        {/* Background elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div className="relative">
            <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl"
            >
              Maximiza tus Criptoactivos
            </motion.h3>
            <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-3 text-lg text-gray-300"
            >
              No dejes que tus Satoshis se queden quietos. En Biterva te ofrecemos herramientas DeFi avanzadas simplificadas para ti.
            </motion.p>

            <dl className="mt-10 space-y-10">
              {[
                {
                  id: 1,
                  name: 'Ahorro Programado (DCA)',
                  description: 'Compra Bitcoin de forma recurrente y promedia tu precio de entrada automáticamente.',
                  icon: TrendingUp,
                },
                {
                  id: 2,
                  name: 'Staking Flexible',
                  description: 'Obtén rendimientos anuales competitivos sin bloquear tus fondos por años.',
                  icon: PieChart,
                },
                {
                  id: 3,
                  name: 'Préstamos Instantáneos',
                  description: 'Necesitas liquidez? Pide prestado en Stablecoins usando tu Bitcoin como colateral.',
                  icon: DollarSign,
                },
              ].map((item) => (
                <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-brand-primary text-white">
                      <item.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-white">{item.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-400">
                    {item.description}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-10 -mx-4 relative lg:mt-0"
            aria-hidden="true"
          >
             <div className="relative mx-auto rounded-xl shadow-2xl bg-brand-dark border border-white/10 p-6 overflow-hidden max-w-md">
                 <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-brand-accent/20 rounded-full blur-2xl"></div>
                 
                 <div className="text-center mb-8">
                     <div className="text-gray-400 text-sm">Rendimiento Total</div>
                     <div className="text-4xl font-bold text-white mt-1">+12.5%</div>
                     <div className="text-brand-accent text-sm mt-1">▲ $3,400 USD este mes</div>
                 </div>

                 {/* Mock chart bars */}
                 <div className="flex items-end justify-center space-x-2 h-40 mb-6">
                     {[40, 60, 45, 70, 50, 80, 65, 90, 75, 100].map((h, i) => (
                         <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="w-4 bg-brand-primary/50 rounded-t-sm hover:bg-brand-primary transition-colors cursor-pointer"
                         ></motion.div>
                     ))}
                 </div>
                 
                 <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                         <div className="flex items-center">
                             <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">₿</div>
                             <div className="ml-3">
                                 <div className="text-white text-sm font-medium">Bitcoin Staking</div>
                                 <div className="text-gray-400 text-xs">5% APY</div>
                             </div>
                         </div>
                         <div className="text-right">
                             <div className="text-white text-sm">0.05 BTC</div>
                             <div className="text-gray-400 text-xs">$2,300</div>
                         </div>
                     </div>
                 </div>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
