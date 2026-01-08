import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-2xl' },
    lg: { icon: 40, text: 'text-4xl' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="gradient-primary rounded-xl p-2 shadow-md">
        <Zap 
          size={sizes[size].icon} 
          className="text-primary-foreground" 
          strokeWidth={2.5}
          fill="currentColor"
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-extrabold text-gradient', sizes[size].text)}>
            SHIFT
          </span>
          <span className={cn('font-bold text-foreground/80', size === 'lg' ? 'text-lg' : 'text-sm')}>
            NOW
          </span>
        </div>
      )}
    </div>
  );
}
