import { Heart, Clock, Images, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToggleStoryFavorite } from "@/hooks/use-stories";
import { Link } from "wouter";
import type { Story } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const toggleFavorite = useToggleStoryFavorite();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate(story.id);
  };

  const getThemeColor = (theme: string) => {
    const colors = {
      fantasy: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      adventure: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
      space: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      animals: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
      fairy: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
      pirate: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    };
    return colors[theme as keyof typeof colors] || colors.fantasy;
  };

  const getPlaceholderImage = (theme: string) => {
    const images = {
      fantasy: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      adventure: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      space: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      animals: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      fairy: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      pirate: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    };
    return images[theme as keyof typeof images] || images.fantasy;
  };

  return (
    <Link href={`/story/${story.id}`}>
      <a className="block">
        <Card className="group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600">
          <div className="relative">
            <img
              src={story.illustrations?.[0] || getPlaceholderImage(story.theme)}
              alt={story.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Badge className={getThemeColor(story.theme)}>
                {story.theme.charAt(0).toUpperCase() + story.theme.slice(1)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className={`${
                  story.isFavorite 
                    ? "text-red-500 hover:text-red-600" 
                    : "text-gray-400 hover:text-red-500"
                } transition-colors`}
              >
                <Heart className={`h-4 w-4 ${story.isFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>
            
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {story.title}
            </h4>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {story.content.substring(0, 100)}...
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{story.readingTime} min read</span>
                </div>
                {story.illustrations && story.illustrations.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Images className="h-3 w-3" />
                    <span>{story.illustrations.length} illustrations</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(story.createdAt!), { addSuffix: true })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
