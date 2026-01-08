import { MapPin, Clock, IndianRupee, User, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  hourly_rate: number;
  duration_hours: number;
  location_address: string;
  city: string;
  status: string;
  start_time: string;
  employer?: {
    full_name: string;
    rating: number;
    is_verified: boolean;
  };
}

interface JobCardProps {
  job: Job;
  onAccept?: (jobId: string) => void;
  showAccept?: boolean;
  index?: number;
}

const categoryLabels: Record<string, string> = {
  retail: '🛍️ Retail',
  restaurant: '🍽️ Restaurant',
  warehouse: '📦 Warehouse',
  events: '🎉 Events',
  household: '🏠 Household',
  construction: '🔨 Construction',
  delivery: '🚚 Delivery',
  other: '📋 Other',
};

export function JobCard({ job, onAccept, showAccept = true, index = 0 }: JobCardProps) {
  const totalPay = job.hourly_rate * job.duration_hours;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-lg text-foreground mb-1">{job.title}</h3>
              <Badge className={cn('category-badge', `category-${job.category}`)}>
                {categoryLabels[job.category] || job.category}
              </Badge>
            </div>
            <Badge className={cn('status-badge', `status-${job.status}`)}>
              {job.status === 'open' ? 'Available' : job.status.replace('_', ' ')}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {job.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <IndianRupee size={16} className="text-primary" />
              <span className="font-semibold">₹{job.hourly_rate}/hr</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-muted-foreground" />
              <span>{job.duration_hours} hours</span>
            </div>
            <div className="flex items-center gap-2 text-sm col-span-2">
              <MapPin size={16} className="text-muted-foreground" />
              <span className="truncate">{job.location_address}, {job.city}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{job.employer?.full_name || 'Employer'}</p>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-secondary fill-secondary" />
                  <span className="text-xs text-muted-foreground">
                    {job.employer?.rating?.toFixed(1) || '4.5'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Earnings</p>
              <p className="font-bold text-lg text-primary">₹{totalPay.toLocaleString()}</p>
            </div>
          </div>

          {showAccept && job.status === 'open' && (
            <Button 
              variant="hero" 
              className="w-full mt-4"
              onClick={() => onAccept?.(job.id)}
            >
              Accept Job
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
