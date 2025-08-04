import { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, Clock, Shield, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/loading-spinner";
import { useActiveChildProfile } from "@/hooks/use-child-profiles";
import { useGenerateStory, useStoryGenerationStatus } from "@/hooks/use-stories";
import { useToast } from "@/hooks/use-toast";
import type { InsertStoryGenerationRequest } from "@shared/schema";

export default function StoryCreator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: activeProfile, isLoading: profileLoading } = useActiveChildProfile();
  const generateStory = useGenerateStory();
  
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const { data: generationStatus } = useStoryGenerationStatus(currentRequestId || undefined);

  const [formData, setFormData] = useState({
    theme: "fantasy",
    length: "short" as "short" | "medium" | "long",
    specialInterests: "",
    moralLessons: [] as string[],
    customCharacter: null as { name: string; appearance: string; personality: string } | null,
    useCustomCharacter: false,
  });

  const themes = [
    { value: "fantasy", label: "🏰 Fantasy Adventure", emoji: "🏰" },
    { value: "dinosaur", label: "🦕 Dinosaur Discovery", emoji: "🦕" },
    { value: "space", label: "🚀 Space Exploration", emoji: "🚀" },
    { value: "animals", label: "🐻 Animal Friends", emoji: "🐻" },
    { value: "fairy", label: "🧚‍♀️ Fairy Tale Magic", emoji: "🧚‍♀️" },
    { value: "pirate", label: "🏴‍☠️ Pirate Treasure", emoji: "🏴‍☠️" },
  ];

  const moralLessonOptions = [
    "kindness", "sharing", "courage", "friendship", "honesty", "perseverance"
  ];

  const handleMoralLessonToggle = (lesson: string) => {
    setFormData(prev => ({
      ...prev,
      moralLessons: prev.moralLessons.includes(lesson)
        ? prev.moralLessons.filter(l => l !== lesson)
        : [...prev.moralLessons, lesson]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeProfile) {
      toast({
        title: "No Profile Selected",
        description: "Please select a child profile first.",
        variant: "destructive",
      });
      return;
    }

    const request: InsertStoryGenerationRequest = {
      childProfileId: activeProfile.id,
      theme: formData.theme,
      length: formData.length,
      specialInterests: formData.specialInterests || undefined,
      moralLessons: formData.moralLessons,
      customCharacter: formData.useCustomCharacter ? formData.customCharacter || undefined : undefined,
    };

    try {
      const result = await generateStory.mutateAsync(request);
      setCurrentRequestId(result.requestId);
    } catch (error) {
      console.error("Generation error:", error);
    }
  };

  // Check if story generation is complete
  if (generationStatus?.status === "completed" && generationStatus.storyId) {
    setLocation(`/story/${generationStatus.storyId}`);
    return null;
  }

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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Active Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please select a child profile to create stories
            </p>
            <Button onClick={() => setLocation("/profiles")}>
              Select Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Generation Status */}
      {currentRequestId && generationStatus && (
        <Card className="mb-8 border-l-4 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {generationStatus.status === "pending" && "Story generation queued..."}
                  {generationStatus.status === "generating" && "Creating your magical story..."}
                  {generationStatus.status === "failed" && "Generation failed"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {generationStatus.status === "pending" && "Your story will begin generating shortly"}
                  {generationStatus.status === "generating" && "This usually takes 2-3 minutes"}
                  {generationStatus.status === "failed" && generationStatus.errorMessage}
                </p>
              </div>
              {(generationStatus.status === "pending" || generationStatus.status === "generating") && (
                <LoadingSpinner />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story Creation Interface */}
      <Card className="shadow-xl border border-purple-100 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Sparkles className="text-purple-500 mr-3" />
              Create Your Story
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Usually takes 2-3 minutes</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Story Configuration */}
              <div className="space-y-6">
                {/* Character Selection */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                    Main Character
                  </Label>
                  <RadioGroup
                    value={formData.useCustomCharacter ? "custom" : "default"}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, useCustomCharacter: value === "custom" }))
                    }
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="relative">
                      <RadioGroupItem value="default" id="default" className="peer sr-only" />
                      <Label 
                        htmlFor="default" 
                        className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-transparent peer-checked:border-purple-500 peer-checked:bg-purple-100 dark:peer-checked:bg-purple-900/40 cursor-pointer transition-all duration-300 hover:scale-105"
                      >
                        <Avatar className="w-12 h-12 mb-2">
                          <AvatarImage src={activeProfile.avatarUrl || undefined} alt={activeProfile.name} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                            {activeProfile.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900 dark:text-white">{activeProfile.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Age {activeProfile.age}</span>
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
                      <Label 
                        htmlFor="custom" 
                        className="flex flex-col items-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-transparent peer-checked:border-amber-500 peer-checked:bg-amber-100 dark:peer-checked:bg-amber-900/40 cursor-pointer transition-all duration-300 hover:scale-105"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mb-2 flex items-center justify-center">
                          <Sparkles className="text-white w-6 h-6" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">Custom</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Create new</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Custom Character Fields */}
                {formData.useCustomCharacter && (
                  <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div>
                      <Label htmlFor="customName">Character Name</Label>
                      <Input
                        id="customName"
                        value={formData.customCharacter?.name || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          customCharacter: {
                            ...prev.customCharacter,
                            name: e.target.value,
                            appearance: prev.customCharacter?.appearance || "",
                            personality: prev.customCharacter?.personality || "",
                          }
                        }))}
                        placeholder="e.g., Princess Luna"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customAppearance">Appearance</Label>
                      <Input
                        id="customAppearance"
                        value={formData.customCharacter?.appearance || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          customCharacter: {
                            ...prev.customCharacter,
                            name: prev.customCharacter?.name || "",
                            appearance: e.target.value,
                            personality: prev.customCharacter?.personality || "",
                          }
                        }))}
                        placeholder="e.g., silver hair, green eyes, blue dress"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customPersonality">Personality</Label>
                      <Input
                        id="customPersonality"
                        value={formData.customCharacter?.personality || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          customCharacter: {
                            ...prev.customCharacter,
                            name: prev.customCharacter?.name || "",
                            appearance: prev.customCharacter?.appearance || "",
                            personality: e.target.value,
                          }
                        }))}
                        placeholder="e.g., brave, curious, kind"
                      />
                    </div>
                  </div>
                )}

                {/* Story Theme */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                    Story Theme
                  </Label>
                  <Select value={formData.theme} onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Story Length */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                    Story Length
                  </Label>
                  <RadioGroup
                    value={formData.length}
                    onValueChange={(value: "short" | "medium" | "long") => 
                      setFormData(prev => ({ ...prev, length: value }))
                    }
                    className="grid grid-cols-3 gap-3"
                  >
                    <div>
                      <RadioGroupItem value="short" id="short" className="peer sr-only" />
                      <Label 
                        htmlFor="short" 
                        className="block p-3 text-center bg-gray-50 dark:bg-slate-700 rounded-xl border-2 border-transparent peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 cursor-pointer transition-all duration-300"
                      >
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">5 min</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Short</div>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
                      <Label 
                        htmlFor="medium" 
                        className="block p-3 text-center bg-gray-50 dark:bg-slate-700 rounded-xl border-2 border-transparent peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 cursor-pointer transition-all duration-300"
                      >
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">10 min</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Medium</div>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem value="long" id="long" className="peer sr-only" />
                      <Label 
                        htmlFor="long" 
                        className="block p-3 text-center bg-gray-50 dark:bg-slate-700 rounded-xl border-2 border-transparent peer-checked:border-purple-500 peer-checked:bg-purple-50 dark:peer-checked:bg-purple-900/20 cursor-pointer transition-all duration-300"
                      >
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">15 min</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Long</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Special Interests */}
                <div>
                  <Label htmlFor="interests" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                    Special Interests (Optional)
                  </Label>
                  <Textarea
                    id="interests"
                    value={formData.specialInterests}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialInterests: e.target.value }))}
                    placeholder="e.g., loves unicorns, enjoys building blocks, fascinated by trains..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Preview & Generate */}
              <div className="space-y-6">
                {/* Story Preview Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Sparkles className="text-purple-500 mr-2 h-5 w-5" />
                    Story Preview
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Character:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.useCustomCharacter && formData.customCharacter?.name 
                          ? formData.customCharacter.name 
                          : `${activeProfile.name} (Age ${activeProfile.age})`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Theme:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {themes.find(t => t.value === formData.theme)?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Length:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.length === 'short' ? '5' : formData.length === 'medium' ? '10' : '15'} minutes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moral Lesson Selection */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                    Include a Lesson About
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {moralLessonOptions.map((lesson) => (
                      <div key={lesson} className="flex items-center space-x-2">
                        <Checkbox
                          id={lesson}
                          checked={formData.moralLessons.includes(lesson)}
                          onCheckedChange={() => handleMoralLessonToggle(lesson)}
                        />
                        <Label 
                          htmlFor={lesson} 
                          className="text-sm capitalize cursor-pointer"
                        >
                          {lesson}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  type="submit"
                  disabled={generateStory.isPending || (currentRequestId && generationStatus?.status !== "failed")}
                  className="w-full bg-gradient-magical text-white py-4 text-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  {generateStory.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Starting Generation...
                    </>
                  ) : currentRequestId && generationStatus?.status !== "failed" ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Generating Story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Story & Illustrations
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 flex items-center justify-center">
                  <Shield className="mr-1 h-3 w-3 text-green-500" />
                  All content is automatically filtered for child safety
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
