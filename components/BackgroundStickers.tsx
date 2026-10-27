import React from 'react';
import { Hexagon, Star, Shield, Zap, Globe, Layout as LayoutIcon, Circle } from 'lucide-react';

export const BackgroundStickers: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Top Left Cluster */}
            <div className="absolute top-10 left-10 animate-float-slow opacity-40">
                <Hexagon className="w-16 h-16 text-pink-300 fill-pink-100/50 transform -rotate-12" />
            </div>
            <div className="absolute top-24 left-32 animate-float opacity-30">
                <Zap className="w-8 h-8 text-pink-400 fill-pink-200" />
            </div>

            {/* Top Right Cluster */}
            <div className="absolute top-12 right-20 animate-float-delayed opacity-40">
                <Shield className="w-14 h-14 text-pink-300 fill-pink-100/50 transform rotate-12" />
            </div>
            <div className="absolute top-32 right-10 animate-pulse opacity-30">
                <Globe className="w-20 h-20 text-pink-200/60" />
            </div>

            {/* Bottom Left Cluster */}
            <div className="absolute bottom-20 left-12 animate-float opacity-40">
                <LayoutIcon className="w-24 h-24 text-pink-300/40 transform -rotate-6" />
            </div>
            <div className="absolute bottom-40 left-32 animate-bounce-slow opacity-30">
                <Hexagon className="w-10 h-10 text-pink-400 fill-pink-300/50" />
            </div>

            {/* Bottom Right Cluster */}
            <div className="absolute bottom-16 right-16 animate-float-slow opacity-40">
                <Star className="w-20 h-20 text-pink-300 fill-pink-100/50 transform rotate-12" />
            </div>
            <div className="absolute bottom-48 right-32 animate-spin-slow opacity-20">
                <Circle className="w-12 h-12 text-pink-400 border-2 border-pink-300 rounded-full" />
            </div>

            {/* Random Floating Elements */}
            <div className="absolute top-1/3 left-1/4 animate-float opacity-10">
                <Shield className="w-12 h-12 text-pink-300" />
            </div>
            <div className="absolute top-2/3 right-1/3 animate-float-delayed opacity-10">
                <Zap className="w-8 h-8 text-pink-400 fill-pink-400" />
            </div>
        </div>
    );
};
