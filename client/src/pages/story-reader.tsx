import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Bookmark, Type, Heart, ChevronLeft, ChevronRight, Share2, Moon, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "next-themes";
import LoadingSpinner from "@/components/loading-spinner";
import { useStory, useToggleStoryFavorite, useMarkStoryAsRead } from "@/hooks/use-stories";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function StoryReader() {
  const [, params] = useRoute("/story/:id");
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const { data: story, isLoading, error } = useStory(params?.id);
  const toggleFavorite = useToggleStoryFavorite();
  const markAsRead = useMarkStoryAsRead();

  const [fontSize, setFontSize] = useState(18);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isNightMode, setIsNightMode] = useState(false);

  // Split story content into chapters/sections for better reading experience
  const chapters = story?.content.split('\n\n').filter(paragraph => paragraph.trim()) || [];
  const chaptersPerPage = 3;
  const totalPages = Math.ceil(chapters.length / chaptersPerPage);
  const currentPageChapters = chapters.slice(
    currentChapter * chaptersPerPage,
    (currentChapter + 1) * chaptersPerPage
  );

  // Mark story as read when component mounts
  useEffect(() => {
    if (story && !story.lastReadAt) {
      markAsRead.mutate(story.id);
    }
  }, [story, markAsRead]);

  const handleToggleFavorite = () => {
    if (story) {
      toggleFavorite.mutate(story.id);
    }
  };

  const handleShare = () => {
    if (story) {
      if (navigator.share) {
        navigator.share({
          title: story.title,
          text: `Check out this magical bedtime story: ${story.title}`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Story link has been copied to clipboard!",
        });
      }
    }
  };

  const nextPage = () => {
    if (currentChapter < totalPages - 1) {
      setCurrentChapter(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentChapter > 0) {
      setCurrentChapter(prev => prev - 1);
    }
  };

  const toggleReadingMode = () => {
    setIsNightMode(!isNightMode);
    if (!isNightMode) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Story Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The story you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/library")}>
              Back to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className={`min-h-screen ${isNightMode ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900'} transition-colors duration-300`}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Story Reader Interface */}
        <Card className="shadow-xl border border-purple-100 dark:border-slate-700">
          {/* Story Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-600">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/library")}
                className="rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{story.title}</h1>
                  <Badge className={getThemeColor(story.theme)}>
                    {story.theme.charAt(0).toUpperCase() + story.theme.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentChapter + 1} of {totalPages} • {story.readingTime} minute read
                  {story.lastReadAt && (
                    <span className="ml-2">
                      • Last read {formatDistanceToNow(new Date(story.lastReadAt), { addSuffix: true })}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Font Size Control */}
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                <Type className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  max={24}
                  min={14}
                  step={2}
                  className="w-20"
                />
              </div>

              {/* Reading Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleReadingMode}
                className="rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                {isNightMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Favorite Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                disabled={toggleFavorite.isPending}
                className={`rounded-lg ${
                  story.isFavorite 
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50" 
                    : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                <Heart className={`h-5 w-5 ${story.isFavorite ? "fill-current" : ""}`} />
              </Button>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Story Illustration */}
            {story.illustrations && story.illustrations.length > 0 && (
              <div className="mb-8 text-center">
                <img
                  src={story.illustrations[Math.min(currentChapter, story.illustrations.length - 1)]}
                  alt={`Illustration for ${story.title}`}
                  className="w-full max-w-2xl mx-auto rounded-2xl shadow-lg"
                  onError={(e) => {
                    // Fallback to placeholder if illustration fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600";
                  }}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                  {story.characterName}'s magical adventure continues
                </p>
              </div>
            )}

            {/* Story Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {currentPageChapters.map((paragraph, index) => (
                <div key={index} className="mb-6">
                  {paragraph.includes('"') ? (
                    // Render dialogue with special styling
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border-l-4 border-purple-400">
                      <p 
                        className="leading-relaxed text-gray-700 dark:text-gray-300 italic"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {paragraph}
                      </p>
                    </div>
                  ) : (
                    <p 
                      className="leading-relaxed text-gray-700 dark:text-gray-300"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {paragraph}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Moral Lessons */}
            {story.moralLessons && story.moralLessons.length > 0 && currentChapter === totalPages - 1 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  ✨ What We Learned
                </h4>
                <div className="flex flex-wrap gap-2">
                  {story.moralLessons.map((lesson, index) => (
                    <Badge key={index} variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                      {lesson.charAt(0).toUpperCase() + lesson.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-slate-600">
              <Button
                variant="outline"
                onClick={prevPage}
                disabled={currentChapter === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              {/* Page Indicators */}
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentChapter(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === currentChapter 
                        ? "bg-purple-500" 
                        : "bg-gray-300 dark:bg-slate-600"
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={nextPage}
                disabled={currentChapter === totalPages - 1}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <span>{currentChapter === totalPages - 1 ? "The End" : "Next Page"}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Story Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {story.readingTime} min
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Reading Time</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {story.illustrations?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Illustrations</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {story.characterName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Main Character</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDistanceToNow(new Date(story.createdAt!), { addSuffix: true })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
