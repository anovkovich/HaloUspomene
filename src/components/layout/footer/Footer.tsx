import React from "react";
import { Heart } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#232323] text-[#F5F4DC] pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-24">
          <div className="lg:col-span-2">
            <span className="text-3xl font-serif font-bold">
              HALO <span className="text-[#AE343F] italic">Uspomene</span>
            </span>
            <p className="mt-8 text-[#F5F4DC]/40 max-w-sm">
              Prvi i originalni audio guest book u Srbiji.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-serif mb-8">Kontakt</h4>
            <ul className="space-y-4 text-[#F5F4DC]/50 font-light">
              <li>info@halouspomene.rs</li>
              <li>+381 60 123 4567</li>
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-[#F5F4DC]/20">
          <p>© {new Date().getFullYear()} HALO Uspomene.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={10} className="text-[#AE343F]" /> by Halo
            Creative
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
