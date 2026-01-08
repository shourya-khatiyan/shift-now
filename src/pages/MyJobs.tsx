import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { JobCard } from '@/components/JobCard';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyJobs() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

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
    if (!profile) return;

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
          ),
          worker:worker_id (
            full_name,
            rating,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

      if (profile.role === 'worker') {
        query = query.eq('worker_id', profile.id);
      } else {
        query = query.eq('employer_id', profile.id);
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

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus as any })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Job marked as ${newStatus.replace('_', ' ')}`,
      });

      fetchJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const activeJobs = jobs.filter((j) => ['open', 'accepted', 'in_progress'].includes(j.status));
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const cancelledJobs = jobs.filter((j) => j.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderJobs = (jobsList: any[]) => {
    if (loadingJobs) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      );
    }

    if (jobsList.length === 0) {
      return (
        <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
            <Briefcase size={32} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Jobs Here</h3>
          <p className="text-muted-foreground text-sm">
            {profile?.role === 'worker'
              ? 'Accept jobs to see them here'
              : 'Post jobs to see them here'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {jobsList.map((job, index) => (
          <div key={job.id}>
            <JobCard job={job} index={index} showAccept={false} />
            
            {/* Action Buttons */}
            {profile?.role === 'employer' && job.status === 'accepted' && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="success"
                  className="flex-1"
                  onClick={() => updateJobStatus(job.id, 'in_progress')}
                >
                  <Clock size={16} />
                  Start Work
                </Button>
              </div>
            )}
            
            {profile?.role === 'employer' && job.status === 'in_progress' && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="success"
                  className="flex-1"
                  onClick={() => updateJobStatus(job.id, 'completed')}
                >
                  <CheckCircle size={16} />
                  Mark Complete
                </Button>
              </div>
            )}

            {job.status === 'open' && profile?.role === 'employer' && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => updateJobStatus(job.id, 'cancelled')}
                >
                  <XCircle size={16} />
                  Cancel Job
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold mb-6">My Jobs</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="active" className="flex-1">
                Active ({activeJobs.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                Completed ({completedJobs.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1">
                Cancelled ({cancelledJobs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {renderJobs(activeJobs)}
            </TabsContent>
            <TabsContent value="completed">
              {renderJobs(completedJobs)}
            </TabsContent>
            <TabsContent value="cancelled">
              {renderJobs(cancelledJobs)}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
