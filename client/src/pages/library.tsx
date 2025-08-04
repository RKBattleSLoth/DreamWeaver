import { useState } from "react";
import { Search, Filter, Heart, Book, Star, Grid, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StoryCard from "@/components/story-card";
import LoadingSpinner from "@/components/loading-spinner";
import { useActiveChildProfile } from "@/hooks/use-child-profiles";
import { useStoriesForChild, useFavoriteStories } from "@/hooks/use-stories";

export default function Library() {
  const { data: activeProfile, isLoading: profileLoading } = useActiveChildProfile();
  const { data: allStories, isLoading: storiesLoading } = useStoriesForChild(activeProfile?.id);
  const { data: favoriteStories, isLoading: favoritesLoading } = useFavoriteStories(activeProfile?.id);

  const [searchTerm, setSearchTerm] = useState("");
  const [themeFilter, setThemeFilter] = useState("all");
  const [lengthFilter, setLengthFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Book className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Active Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please select a child profile to view their story library
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredStories = allStories?.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = themeFilter === "all" || story.theme === themeFilter;
    const matchesLength = lengthFilter === "all" || story.length === lengthFilter;
    
    return matchesSearch && matchesTheme && matchesLength;
  }) || [];

  const themes = [...new Set(allStories?.map(story => story.theme) || [])];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {activeProfile.name}'s Story Library
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover and revisit magical bedtime stories
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={themeFilter} onValueChange={setThemeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Themes</SelectItem>
                {themes.map(theme => (
                  <SelectItem key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={lengthFilter} onValueChange={setLengthFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lengths</SelectItem>
                <SelectItem value="short">Short (5 min)</SelectItem>
                <SelectItem value="medium">Medium (10 min)</SelectItem>
                <SelectItem value="long">Long (15 min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for All Stories vs Favorites */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Book className="h-4 w-4" />
            <span>All Stories ({filteredStories.length})</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Favorites ({favoriteStories?.length || 0})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {storiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-slate-700"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStories.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {filteredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm || themeFilter !== "all" || lengthFilter !== "all" 
                    ? "No stories match your filters" 
                    : "No stories yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchTerm || themeFilter !== "all" || lengthFilter !== "all"
                    ? "Try adjusting your search terms or filters"
                    : `Create ${activeProfile.name}'s first magical bedtime story`}
                </p>
                {!(searchTerm || themeFilter !== "all" || lengthFilter !== "all") && (
                  <Button 
                    onClick={() => window.location.href = "/create"}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Create First Story
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          {favoritesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-slate-700"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favoriteStories && favoriteStories.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {favoriteStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No favorite stories yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Heart your favorite stories to see them here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Stats */}
      {allStories && allStories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <Book className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">{allStories.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Stories</div>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {favoriteStories?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Favorite Stories</div>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {themes.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Different Themes</div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
