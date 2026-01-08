import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, IndianRupee, TrendingUp, Briefcase, Users, Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { JobCard } from '@/components/JobCard';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    earnings: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      fetchJobs();
    }
  }, [profile]);

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
        .order('created_at', { ascending: false })
        .limit(5);

      if (profile?.role === 'worker') {
        query = query.eq('status', 'open');
      } else {
        query = query.eq('employer_id', profile?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);

      // Calculate stats
      if (profile?.role === 'employer' && data) {
        const completed = data.filter((j: any) => j.status === 'completed').length;
        const totalEarnings = data
          .filter((j: any) => j.status === 'completed')
          .reduce((sum: number, j: any) => sum + (j.hourly_rate * j.duration_hours), 0);
        
        setStats({
          totalJobs: data.length,
          completedJobs: completed,
          earnings: totalEarnings,
        });
      }
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
        title: 'Job Accepted!',
        description: 'You have successfully accepted this job. Check My Jobs for details.',
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

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isWorker = profile.role === 'worker';

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold mb-1">
            Hello, {profile.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            {isWorker
              ? 'Find nearby jobs and start earning today'
              : 'Post jobs and find reliable workers instantly'}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <div className="bg-card rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Briefcase size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-bold">{profile.total_jobs}</p>
            <p className="text-xs text-muted-foreground">Total Jobs</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-2">
              <TrendingUp size={20} className="text-success" />
            </div>
            <p className="text-2xl font-bold">{profile.rating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-2">
              <IndianRupee size={20} className="text-secondary" />
            </div>
            <p className="text-2xl font-bold">₹{stats.earnings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => navigate(isWorker ? '/jobs' : '/post-job')}
          >
            {isWorker ? (
              <>
                <Search size={20} />
                Find Jobs Near Me
              </>
            ) : (
              <>
                <Plus size={20} />
                Post a New Job
              </>
            )}
          </Button>
        </motion.div>

        {/* Jobs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              {isWorker ? 'Available Jobs' : 'Your Posted Jobs'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(isWorker ? '/jobs' : '/my-jobs')}
            >
              View All
            </Button>
          </div>

          {loadingJobs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                {isWorker ? (
                  <Search size={32} className="text-muted-foreground" />
                ) : (
                  <Briefcase size={32} className="text-muted-foreground" />
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {isWorker ? 'No Jobs Available' : 'No Jobs Posted Yet'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {isWorker
                  ? 'Check back soon for new opportunities in your area'
                  : 'Post your first job and find workers instantly'}
              </p>
              {!isWorker && (
                <Button variant="hero" onClick={() => navigate('/post-job')}>
                  <Plus size={18} />
                  Post Your First Job
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  showAccept={isWorker}
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
