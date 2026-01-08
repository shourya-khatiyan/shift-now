import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, MapPin, Clock, IndianRupee, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
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
  { value: 'retail', label: '🛍️ Retail' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'warehouse', label: '📦 Warehouse' },
  { value: 'events', label: '🎉 Events' },
  { value: 'household', label: '🏠 Household' },
  { value: 'construction', label: '🔨 Construction' },
  { value: 'delivery', label: '🚚 Delivery' },
  { value: 'other', label: '📋 Other' },
];

export default function PostJob() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    hourlyRate: '',
    durationHours: '',
    locationAddress: '',
    city: '',
    startDate: '',
    startTime: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
      newErrors.hourlyRate = 'Valid hourly rate is required';
    }
    if (!formData.durationHours || parseInt(formData.durationHours) <= 0) {
      newErrors.durationHours = 'Valid duration is required';
    }
    if (!formData.locationAddress.trim()) newErrors.locationAddress = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !profile) return;

    setIsSubmitting(true);

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);

      const { error } = await supabase.from('jobs').insert({
        employer_id: profile.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category as any,
        hourly_rate: parseFloat(formData.hourlyRate),
        duration_hours: parseInt(formData.durationHours),
        location_address: formData.locationAddress.trim(),
        location_lat: 28.6139,
        location_lng: 77.209,
        city: formData.city.trim(),
        start_time: startDateTime.toISOString(),
        status: 'open' as any,
      } as any);

      if (error) throw error;

      toast({
        title: 'Job Posted! 🎉',
        description: 'Your job is now visible to nearby workers.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to post job. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft size={18} />
            Back
          </Button>

          <h1 className="text-2xl font-bold mb-2">Post a New Job</h1>
          <p className="text-muted-foreground mb-6">
            Find reliable workers in your area instantly
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Job Title */}
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g., Shop Helper Needed Today"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-destructive text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select job category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-destructive text-xs mt-1">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the work, requirements, and any other details..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={errors.description ? 'border-destructive' : ''}
                rows={4}
              />
              {errors.description && (
                <p className="text-destructive text-xs mt-1">{errors.description}</p>
              )}
            </div>

            {/* Pay & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourlyRate">
                  <IndianRupee size={14} className="inline mr-1" />
                  Hourly Rate
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="e.g., 200"
                  value={formData.hourlyRate}
                  onChange={(e) => handleChange('hourlyRate', e.target.value)}
                  className={errors.hourlyRate ? 'border-destructive' : ''}
                />
                {errors.hourlyRate && (
                  <p className="text-destructive text-xs mt-1">{errors.hourlyRate}</p>
                )}
              </div>
              <div>
                <Label htmlFor="durationHours">
                  <Clock size={14} className="inline mr-1" />
                  Duration (hours)
                </Label>
                <Input
                  id="durationHours"
                  type="number"
                  placeholder="e.g., 4"
                  value={formData.durationHours}
                  onChange={(e) => handleChange('durationHours', e.target.value)}
                  className={errors.durationHours ? 'border-destructive' : ''}
                />
                {errors.durationHours && (
                  <p className="text-destructive text-xs mt-1">{errors.durationHours}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="locationAddress">
                <MapPin size={14} className="inline mr-1" />
                Address
              </Label>
              <Input
                id="locationAddress"
                placeholder="Full address of the job location"
                value={formData.locationAddress}
                onChange={(e) => handleChange('locationAddress', e.target.value)}
                className={errors.locationAddress ? 'border-destructive' : ''}
              />
              {errors.locationAddress && (
                <p className="text-destructive text-xs mt-1">{errors.locationAddress}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., New Delhi"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={errors.city ? 'border-destructive' : ''}
              />
              {errors.city && (
                <p className="text-destructive text-xs mt-1">{errors.city}</p>
              )}
            </div>

            {/* Start Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={errors.startDate ? 'border-destructive' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.startDate && (
                  <p className="text-destructive text-xs mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className={errors.startTime ? 'border-destructive' : ''}
                />
                {errors.startTime && (
                  <p className="text-destructive text-xs mt-1">{errors.startTime}</p>
                )}
              </div>
            </div>

            {/* Total Pay Preview */}
            {formData.hourlyRate && formData.durationHours && (
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Total Pay for Worker</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{(parseFloat(formData.hourlyRate) * parseInt(formData.durationHours)).toLocaleString()}
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Job
            </Button>
          </form>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
