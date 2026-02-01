import { motion } from 'framer-motion';
import { CreditCard, Landmark, TrendingUp, ShieldCheck } from 'lucide-react';

const features = [
  {
    name: 'Wallet Lightning',
    description: 'Envía y recibe pagos en Bitcoin a la velocidad de la luz. Sin esperas, sin complicaciones.',
    icon: ZapIcon,
  },
  {
    name: 'Retiro a Nequi',
    description: 'Convierte tus Satoshis a Pesos Colombianos y recíbelos en tu Nequi al instante.',
    icon: NequiIcon, // Custom component below
  },
  {
    name: 'Ahorro DCA',
    description: 'Programe compras automáticas de Bitcoin (DCA) y ahorra a largo plazo sin estrés.',
    icon: TrendingUp,
  },
  {
    name: 'Staking',
    description: 'Pon tus activos a trabajar. Gana rendimientos pasivos con nuestras opciones de Staking.',
    icon: Landmark,
  },
  {
    name: 'Préstamos Colaterales',
    description: 'Obtén liquidez sin vender tus Bitcoin. Usa tus criptos como garantía para préstamos rápidos.',
    icon: CreditCard,
  },
  {
    name: 'Seguridad Total',
    description: 'Tus activos están protegidos con la mejor tecnología de encriptación y custodia.',
    icon: ShieldCheck,
  },
];

function ZapIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
    )
}

function NequiIcon(props: any) {
    return (
        <img src="/nequi.png" alt="Nequi" className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all" {...props} />
    )
}


export const Features = () => {
  return (
    <div className="py-24 bg-brand-dark relative z-10" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-brand-primary font-semibold tracking-wide uppercase">Servicios</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            Todo lo que necesitas en una sola App
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-400 mx-auto">
            Biterva integra los servicios financieros tradicionales con la potencia de Bitcoin.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative group bg-white/5 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-brand-primary rounded-2xl border border-white/10 hover:border-brand-primary/50 hover:bg-white/10 transition-all"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 ring-4 ring-white/10 bg-brand-primary/20 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-white group-hover:text-brand-primary transition-colors">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
