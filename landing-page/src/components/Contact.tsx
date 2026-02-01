import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import ReactGA from 'react-ga4';

export const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would normally send the data to a backend
        console.log('Sending data:', formData);
        
        // Track event
        ReactGA.event({
            category: 'User',
            action: 'Submit Interest Form',
            label: 'Landing Page'
        });

        setSubmitted(true);
    };

    return (
        <div id="contact" className="bg-brand-dark py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24 relative">
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                  <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]"></div>
             </div>

            <div className="relative max-w-xl mx-auto z-10">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        ¿Interesado?
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-gray-400">
                        Únete a la lista de espera para ser de los primeros en experimentar Biterva.
                    </p>
                </div>
                <div className="mt-12">
                    {submitted ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-500/10 border border-green-500/50 rounded-xl p-8 text-center"
                        >
                            <h3 className="text-xl font-bold text-green-400">¡Gracias por tu interés!</h3>
                            <p className="text-gray-300 mt-2">Te mantendremos informado sobre nuestro lanzamiento.</p>
                            <button 
                                onClick={() => setSubmitted(false)} 
                                className="mt-4 text-sm text-green-400 underline hover:text-green-300"
                            >
                                Enviar otro
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                            <div className="sm:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                                    Nombre
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        autoComplete="given-name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="py-3 px-4 block w-full shadow-sm bg-white/5 border-white/10 text-white focus:ring-brand-primary focus:border-brand-primary border rounded-md"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                                    Correo Electrónico
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="py-3 px-4 block w-full shadow-sm bg-white/5 border-white/10 text-white focus:ring-brand-primary focus:border-brand-primary border rounded-md"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-400">
                                    Mensaje (Opcional)
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        className="py-3 px-4 block w-full shadow-sm bg-white/5 border-white/10 text-white focus:ring-brand-primary focus:border-brand-primary border rounded-md"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
                                >
                                    Enviar
                                    <Send className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
