import { Github, Twitter, Linkedin, Facebook } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-gray-900 border-t border-white/10">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
                <div className="flex justify-center space-x-6 md:order-2">
                    <a href="#" className="text-gray-400 hover:text-gray-300">
                        <span className="sr-only">Facebook</span>
                        <Facebook className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-300">
                        <span className="sr-only">Twitter</span>
                        <Twitter className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-300">
                        <span className="sr-only">GitHub</span>
                        <Github className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-300">
                        <span className="sr-only">LinkedIn</span>
                        <Linkedin className="h-6 w-6" />
                    </a>
                </div>
                <div className="mt-8 md:mt-0 md:order-1">
                    <div className="flex items-center justify-center md:justify-start mb-4">
                        <img src="/logo.png" alt="Biterva" className="h-8 w-auto mr-2"/>
                        <span className="text-xl font-bold text-white">Biterva</span>
                    </div>
                    <p className="text-center text-base text-gray-400 md:text-left">
                        &copy; 2026 Biterva, Inc. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};
