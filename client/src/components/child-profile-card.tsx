import { User, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useActivateChildProfile, useUpdateChildProfile } from "@/hooks/use-child-profiles";
import type { ChildProfile } from "@shared/schema";

interface ChildProfileCardProps {
  profile: ChildProfile;
  onEdit?: (profile: ChildProfile) => void;
}

export default function ChildProfileCard({ profile, onEdit }: ChildProfileCardProps) {
  const activateProfile = useActivateChildProfile();

  const handleActivate = () => {
    if (!profile.isActive) {
      activateProfile.mutate(profile.id);
    }
  };

  const handleEdit = () => {
    onEdit?.(profile);
  };

  return (
    <Card 
      className={`relative cursor-pointer transition-all duration-300 ${
        profile.isActive 
          ? "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-600" 
          : "bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-600"
      }`}
      onClick={handleActivate}
    >
      {profile.isActive && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-500 text-white">Active</Badge>
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 mb-4">
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.name} />
            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-2xl font-semibold">
              {profile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{profile.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Age {profile.age} {profile.grade && `• ${profile.grade}`}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-4 justify-center">
            {profile.interests?.slice(0, 3).map((interest, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200"
              >
                {interest}
              </Badge>
            ))}
            {profile.interests && profile.interests.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{profile.interests.length - 3} more
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Reading level: {profile.readingLevel}
          </p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
