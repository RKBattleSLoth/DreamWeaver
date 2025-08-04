import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ChildProfile, CreateChildProfileRequest, UpdateChildProfileRequest } from 'shared/types';
import { READING_LEVELS, CONTENT_SAFETY_LEVELS, ART_STYLES } from 'shared/constants';

interface ChildProfileFormProps {
  profile?: ChildProfile;
  onSubmit: (data: CreateChildProfileRequest | UpdateChildProfileRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ChildProfileForm({ 
  profile, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ChildProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age?.toString() || '',
    grade: profile?.grade || '',
    reading_level: profile?.reading_level || '',
    interests: profile?.interests?.join(', ') || '',
    favorite_themes: profile?.favorite_themes?.join(', ') || '',
    content_safety: profile?.content_safety || 'strict',
    preferred_art_style: profile?.preferred_art_style || 'watercolor'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 18)) {
      newErrors.age = 'Age must be between 0 and 18';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      age: formData.age ? Number(formData.age) : undefined,
      grade: formData.grade.trim() || undefined,
      reading_level: formData.reading_level as 'beginner' | 'intermediate' | 'advanced' || undefined,
      interests: formData.interests ? formData.interests.split(',').map(s => s.trim()).filter(s => s) : undefined,
      favorite_themes: formData.favorite_themes ? formData.favorite_themes.split(',').map(s => s.trim()).filter(s => s) : undefined,
      content_safety: formData.content_safety as 'strict' | 'moderate' | 'relaxed',
      preferred_art_style: formData.preferred_art_style
    };

    onSubmit(submitData);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {profile ? 'Edit Child Profile' : 'Create Child Profile'}
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium mb-2 block">
                Name *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Child's name"
                error={errors.name}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="age" className="text-sm font-medium mb-2 block">
                Age
              </label>
              <Input
                id="age"
                type="number"
                min="0"
                max="18"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="Age"
                error={errors.age}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="grade" className="text-sm font-medium mb-2 block">
                Grade
              </label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => handleChange('grade', e.target.value)}
                placeholder="e.g., Kindergarten, 1st, 2nd"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="reading_level" className="text-sm font-medium mb-2 block">
                Reading Level
              </label>
              <select
                id="reading_level"
                value={formData.reading_level}
                onChange={(e) => handleChange('reading_level', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">Select reading level</option>
                {READING_LEVELS.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="interests" className="text-sm font-medium mb-2 block">
              Interests
            </label>
            <Input
              id="interests"
              value={formData.interests}
              onChange={(e) => handleChange('interests', e.target.value)}
              placeholder="e.g., dinosaurs, princesses, space (comma-separated)"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple interests with commas
            </p>
          </div>

          <div>
            <label htmlFor="favorite_themes" className="text-sm font-medium mb-2 block">
              Favorite Story Themes
            </label>
            <Input
              id="favorite_themes"
              value={formData.favorite_themes}
              onChange={(e) => handleChange('favorite_themes', e.target.value)}
              placeholder="e.g., adventure, friendship, magic (comma-separated)"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple themes with commas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferred_art_style" className="text-sm font-medium mb-2 block">
                Preferred Art Style
              </label>
              <select
                id="preferred_art_style"
                value={formData.preferred_art_style}
                onChange={(e) => handleChange('preferred_art_style', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {ART_STYLES.map(style => (
                  <option key={style} value={style}>
                    {style.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="content_safety" className="text-sm font-medium mb-2 block">
                Content Safety
              </label>
              <select
                id="content_safety"
                value={formData.content_safety}
                onChange={(e) => handleChange('content_safety', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {CONTENT_SAFETY_LEVELS.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            isLoading={isLoading}
          >
            {profile ? 'Update Profile' : 'Create Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}