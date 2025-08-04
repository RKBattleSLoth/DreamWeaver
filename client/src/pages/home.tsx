import { Link } from "wouter";
import { Sparkles, Book, User, Star, Clock, Images } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StoryCard from "@/components/story-card";
import LoadingSpinner from "@/components/loading-spinner";
import { useActiveChildProfile } from "@/hooks/use-child-profiles";
import { useStoriesForChild } from "@/hooks/use-stories";

export default function Home() {
  const { data: activeProfile, isLoading: profileLoading } = useActiveChildProfile();
  const { data: stories, isLoading: storiesLoading } = useStoriesForChild(activeProfile?.id);

  const recentStories = stories?.slice(0, 3) || [];

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
            <User className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to StoryTime AI!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create a child profile to start generating magical bedtime stories
            </p>
            <Link href="/profiles">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Create Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <section className="text-center mb-12">
        <div className="relative">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Create Magical{" "}
            <span className="text-gradient-magical">Bedtime Stories</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            AI-powered personalized stories with beautiful illustrations, tailored just for {activeProfile.name}
          </p>
          
          {/* Floating decorative elements */}
          <div className="absolute top-0 left-1/4 animate-bounce-slow">
            <div className="w-8 h-8 bg-yellow-300 rounded-full opacity-60"></div>
          </div>
          <div className="absolute top-8 right-1/4 animate-pulse-slow">
            <Star className="text-pink-400 w-8 h-8 opacity-60" />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create New Story */}
          <Link href="/create">
            <Card className="group bg-white dark:bg-slate-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create New Story</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Generate a personalized bedtime story with AI illustrations</p>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-[1.02]">
                  Start Creating
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Story Library */}
          <Link href="/library">
            <Card className="group bg-white dark:bg-slate-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-600 cursor-pointer">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Book className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Story Library</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Browse and revisit your collection of magical stories</p>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-[1.02]">
                  View Library
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Child Profiles */}
          <Link href="/profiles">
            <Card className="group bg-white dark:bg-slate-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-100 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 cursor-pointer">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <User className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Child Profiles</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Manage profiles and preferences for each child</p>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-[1.02]">
                  Manage Profiles
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Recent Stories */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Stories for {activeProfile.name}
          </h3>
          <Link href="/library">
            <Button variant="ghost" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
              View All →
            </Button>
          </Link>
        </div>

        {storiesLoading ? (
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
        ) : recentStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No stories yet!
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create {activeProfile.name}'s first magical bedtime story
              </p>
              <Link href="/create">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create First Story
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Stats Section */}
      {stories && stories.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <Book className="h-12 w-12 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stories.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Stories Created</div>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <Star className="h-12 w-12 text-pink-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stories.filter(s => s.isFavorite).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Favorite Stories</div>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="p-0">
              <Clock className="h-12 w-12 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stories.reduce((total, story) => total + story.readingTime, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Minutes of Stories</div>
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}
