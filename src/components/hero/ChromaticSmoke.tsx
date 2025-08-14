import { useEffect, useRef } from 'react';
import p5 from 'p5';

interface ChromaticSmokeProps {
  colorMode?: 'default' | 'mono' | 'light' | 'custom';
  customColor?: string | string[];
}

const ChromaticSmoke = ({ colorMode = 'default', customColor }: ChromaticSmokeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const particles: any[] = [];
      const numParticles = 30;
      const flags = colorMode === 'mono' || colorMode === 'light'
        ? ["⬛", "⬜", "◼", "◻", "◾", "◽", "▪", "▫", "●", "○", "■", "□", "◆", "◇", "▲", "△", "▼", "▽"]
        : [
            "🇺🇸", "🇬🇧", "🇫🇷", "🇩🇪", "🇮🇹", "🇪🇸", "🇵🇹", "🇯🇵",
            "🇰🇷", "🇨🇳", "🇮🇳", "🇧🇷", "🇲🇽", "🇨🇦", "🇦🇺", "🇳🇿",
            "🇿🇦", "🇸🇪", "🇳🇴", "🇫🇮", "🇩🇰", "🇳🇱", "🇧🇪", "🇨🇭"
          ];
      
      class Particle {
        pos: p5.Vector;
        speedY: number;
        speedX: number;
        flag: string;
        size: number;
        opacity: number;
        
        constructor() {
          this.reset();
        }
        
        reset() {
          this.pos = p.createVector(p.random(p.width), p.random(-p.height, 0));
          this.speedY = p.random(0.5, 2);
          this.speedX = p.random(-0.3, 0.3);
          this.flag = flags[Math.floor(p.random(flags.length))];
          this.size = p.random(30, 40);
          this.opacity = p.random(0.3, 0.8);
        }
        
        update() {
          this.pos.y += this.speedY;
          this.pos.x += this.speedX;
          if (this.pos.y > p.height + this.size || this.pos.x < -this.size || this.pos.x > p.width + this.size) {
            this.pos.x = p.random(p.width);
            this.pos.y = -this.size;
            this.flag = flags[Math.floor(p.random(flags.length))];
            this.speedY = p.random(0.5, 2);
            this.speedX = p.random(-0.3, 0.3);
            this.size = p.random(30, 40);
            this.opacity = p.random(0.3, 0.8);
          }
        }
        
        display() {
          p.push();
          p.translate(this.pos.x, this.pos.y);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(this.size);
          if (colorMode === 'custom' && customColor) {
            if (Array.isArray(customColor)) {
              const color = customColor[Math.floor(p.random(customColor.length))];
              p.fill(color);
            } else {
              p.fill(customColor);
            }
          } else if (colorMode === 'mono') {
            p.fill(30 + p.random(0, 80), 30 + p.random(0, 80), 30 + p.random(0, 80), this.opacity * 255);
          } else if (colorMode === 'light') {
            const grey = 200 + p.random(0, 40);
            p.fill(grey, grey, grey, this.opacity * 255);
          } else {
            p.fill(255, this.opacity * 255);
          }
          p.text(this.flag, 0, 0);
          p.pop();
        }
      }
      
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.style('display', 'block');
        canvas.parent(containerRef.current!);
        for (let i = 0; i < numParticles; i++) {
          particles.push(new Particle());
        }
      };
      
      p.draw = () => {
        p.clear();
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].display();
        }
      };
      
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    const p5Instance = new p5(sketch);
    
    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full bg-[#090909]" 
      style={{ zIndex: -1 }}
    />
  );
};

export default ChromaticSmoke;
