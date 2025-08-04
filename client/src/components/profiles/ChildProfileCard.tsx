import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { ChildProfile } from '../../../../shared/types';

interface ChildProfileCardProps {
  profile: ChildProfile;
  isActive: boolean;
  onEdit: (profile: ChildProfile) => void;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
}

export default function ChildProfileCard({ 
  profile, 
  isActive, 
  onEdit, 
  onDelete, 
  onSetActive 
}: ChildProfileCardProps) {
  return (
    <Card className={`${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {profile.name}
              {isActive && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {profile.age ? `Age ${profile.age}` : 'Age not set'}
              {profile.grade && ` • Grade ${profile.grade}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {profile.reading_level && (
            <div className="text-sm">
              <span className="font-medium">Reading Level:</span> {profile.reading_level}
            </div>
          )}
          
          {profile.interests && profile.interests.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">Interests:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {profile.favorite_themes && profile.favorite_themes.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">Favorite Themes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.favorite_themes.map((theme, index) => (
                  <span
                    key={index}
                    className="bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm">
            <span className="font-medium">Art Style:</span> {profile.preferred_art_style || 'watercolor'}
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Content Safety:</span> {profile.content_safety || 'strict'}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          {!isActive && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSetActive(profile.id)}
            >
              Set Active
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(profile)}
          >
            Edit
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(profile.id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}