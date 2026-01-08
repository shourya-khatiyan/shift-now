import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { JobCard } from '@/components/JobCard';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'retail', label: '🛍️ Retail' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'warehouse', label: '📦 Warehouse' },
  { value: 'events', label: '🎉 Events' },
  { value: 'household', label: '🏠 Household' },
  { value: 'construction', label: '🔨 Construction' },
  { value: 'delivery', label: '🚚 Delivery' },
  { value: 'other', label: '📋 Other' },
];

export default function Jobs() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          employer:employer_id (
            full_name,
            rating,
            is_verified
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          worker_id: profile.id,
          status: 'accepted',
        })
        .eq('id', jobId)
        .eq('status', 'open');

      if (error) throw error;

      toast({
        title: 'Job Accepted! 🎉',
        description: 'You have successfully accepted this job.',
      });

      fetchJobs();
    } catch (error) {
      console.error('Error accepting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept job. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold mb-4">Find Jobs</h1>
          
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search jobs, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-sm text-muted-foreground mb-4">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
          </p>

          {loadingJobs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <MapPin size={32} className="text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Jobs Found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or check back later for new opportunities
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  showAccept={true}
                  onAccept={handleAcceptJob}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
