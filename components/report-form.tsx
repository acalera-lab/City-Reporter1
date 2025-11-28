import { useState } from 'react';
import { MapPin, Upload, Send, CheckCircle, Loader2, X } from 'lucide-react';
import { Report, ReportType } from '../App';
import * as api from '../utils/api';

interface ReportFormProps {
  onSubmit: (report: Omit<Report, 'id' | 'status' | 'timestamp'>) => void;
}

export function ReportForm({ onSubmit }: ReportFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ReportType>('other');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      setError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImageUrl('');
    setError(null);

    // Upload immediately
    try {
      setUploading(true);
      const uploadedUrl = await api.uploadImage(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError('Failed to upload image. Please try again.');
      setImageFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      setSubmitting(true);
      
      await onSubmit({
        title,
        description,
        type,
        location,
        imageUrl: imageUrl || undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setType('other');
      setLocation('');
      setImageUrl('');
      setImageFile(null);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-white">Submit a Report</h2>
        <p className="text-sm text-blue-100 mt-1">Help improve our city</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm text-slate-700 mb-2">
            Report Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            required
            disabled={submitting}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm text-slate-700 mb-2">
            Report Type *
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as ReportType)}
            required
            disabled={submitting}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="infrastructure">Infrastructure</option>
            <option value="safety">Safety</option>
            <option value="environment">Environment</option>
            <option value="traffic">Traffic</option>
            <option value="public-services">Public Services</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm text-slate-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed information about the issue..."
            required
            rows={4}
            disabled={submitting}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm text-slate-700 mb-2">
            Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Street address or landmark"
              required
              disabled={submitting}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="imageUpload" className="block text-sm text-slate-700 mb-2">
            Upload Image (Optional)
          </label>
          <div className="relative">
            <input
              type="file"
              id="imageUpload"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              disabled={uploading || submitting}
              className="hidden"
            />
            <label
              htmlFor="imageUpload"
              className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                uploading || submitting
                  ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-sm text-slate-600">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {imageFile ? imageFile.name : 'Click to upload image'}
                  </span>
                </>
              )}
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            JPEG, PNG, or WebP • Max 5MB
          </p>
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-slate-200">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={submitting}
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Report
            </>
          )}
        </button>

        {/* Success Message */}
        {showSuccess && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Report submitted successfully!</span>
          </div>
        )}
      </form>
    </div>
  );
}