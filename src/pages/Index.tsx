import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DestinationSearch from "@/components/search/DestinationSearch";
import TrustBadges from "@/components/hero/TrustBadges";
import ChromaticSmoke from "@/components/hero/ChromaticSmoke";

const Index = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-b from-transparent to-gray-900 overflow-hidden">
        <ChromaticSmoke />
        
        {/* Content Container */}
        <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Badge */}
            <div className={`transform transition-all duration-700 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <span className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
                Email Extraction Tool🔗
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 
              className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white transform transition-all duration-700 delay-100 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
            >
              Extract Emails Easily
            </h1>
            
            {/* Description */}
            <p 
              className={`text-lg sm:text-xl text-white/90 transform transition-all duration-700 delay-200 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
            >
              Get Information from any Email Address.
            </p>
            
            {/* Search Component */}
            <div className={`transform transition-all duration-700 delay-300 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <DestinationSearch />
            </div>
            
            {/* Trust Badges */}
            <div className={`transform transition-all duration-700 delay-400 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <TrustBadges />
            </div>
            
            {/* Navigation Buttons */}
            <div className={`transform transition-all duration-700 delay-500 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/email-extraction">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                    Try Email Extraction
                  </Button>
                </Link>
                <Link to="/admin">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-3">
                    Admin Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
