import { useState } from "react";
import { Plus, Edit, User, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ChildProfileCard from "@/components/child-profile-card";
import LoadingSpinner from "@/components/loading-spinner";
import { useChildProfiles, useCreateChildProfile, useUpdateChildProfile } from "@/hooks/use-child-profiles";
import { insertChildProfileSchema } from "@shared/schema";
import type { ChildProfile, InsertChildProfile } from "@shared/schema";
import { z } from "zod";

const profileFormSchema = insertChildProfileSchema.extend({
  interestsText: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function Profiles() {
  const { data: profiles, isLoading } = useChildProfiles();
  const createProfile = useCreateChildProfile();
  const updateProfile = useUpdateChildProfile();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      age: 5,
      grade: "",
      interests: [],
      favoriteThemes: [],
      readingLevel: "kindergarten",
      contentSafety: "strict",
      illustrationStyle: "watercolor",
      avatarUrl: "",
      isActive: false,
      interestsText: "",
    },
  });

  const readingLevels = [
    { value: "preschool", label: "Preschool (Ages 3-4)" },
    { value: "kindergarten", label: "Kindergarten (Age 5)" },
    { value: "grade-1", label: "Grade 1 (Age 6)" },
    { value: "grade-2", label: "Grade 2 (Age 7)" },
    { value: "grade-3", label: "Grade 3 (Age 8)" },
    { value: "grade-4", label: "Grade 4 (Age 9)" },
    { value: "grade-5", label: "Grade 5 (Age 10)" },
    { value: "grade-6", label: "Grade 6+ (Ages 11-12)" },
  ];

  const contentSafetyLevels = [
    { value: "strict", label: "Strict (No conflict or danger)" },
    { value: "moderate", label: "Moderate (Mild adventure elements)" },
    { value: "relaxed", label: "Relaxed (Age-appropriate challenges)" },
  ];

  const illustrationStyles = [
    { value: "watercolor", label: "Watercolor" },
    { value: "cartoon", label: "Cartoon" },
    { value: "digital", label: "Digital Art" },
    { value: "storybook", label: "Storybook Classic" },
  ];

  const themes = [
    "fantasy", "adventure", "space", "animals", "fairy", "pirate", "dinosaur", "science", "friendship", "family"
  ];

  const commonInterests = [
    "unicorns", "dragons", "castles", "princesses", "knights", "dinosaurs", "space", "rockets", "aliens",
    "animals", "cats", "dogs", "bears", "ocean", "fish", "mermaids", "pirates", "treasure", "magic",
    "fairies", "wizards", "trains", "cars", "trucks", "airplanes", "robots", "superheroes", "sports",
    "soccer", "baseball", "dancing", "music", "art", "books", "nature", "flowers", "butterflies"
  ];

  const handleOpenDialog = (profile?: ChildProfile) => {
    if (profile) {
      setEditingProfile(profile);
      form.reset({
        name: profile.name,
        age: profile.age,
        grade: profile.grade || "",
        interests: profile.interests || [],
        favoriteThemes: profile.favoriteThemes || [],
        readingLevel: profile.readingLevel,
        contentSafety: profile.contentSafety,
        illustrationStyle: profile.illustrationStyle,
        avatarUrl: profile.avatarUrl || "",
        isActive: profile.isActive || false,
        interestsText: profile.interests?.join(", ") || "",
      });
    } else {
      setEditingProfile(null);
      form.reset({
        name: "",
        age: 5,
        grade: "",
        interests: [],
        favoriteThemes: [],
        readingLevel: "kindergarten",
        contentSafety: "strict",
        illustrationStyle: "watercolor",
        avatarUrl: "",
        isActive: false,
        interestsText: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProfile(null);
    form.reset();
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Parse interests from text input
      const interests = data.interestsText
        ? data.interestsText.split(",").map(i => i.trim()).filter(Boolean)
        : [];

      const profileData: InsertChildProfile = {
        name: data.name,
        age: data.age,
        grade: data.grade || undefined,
        interests,
        favoriteThemes: data.favoriteThemes,
        readingLevel: data.readingLevel,
        contentSafety: data.contentSafety,
        illustrationStyle: data.illustrationStyle,
        avatarUrl: data.avatarUrl || undefined,
        isActive: data.isActive,
      };

      if (editingProfile) {
        await updateProfile.mutateAsync({
          id: editingProfile.id,
          updates: profileData,
        });
      } else {
        await createProfile.mutateAsync(profileData);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Profile submission error:", error);
    }
  };

  const handleQuickInterestToggle = (interest: string) => {
    const currentInterests = form.getValues("interestsText")
      ?.split(",")
      .map(i => i.trim())
      .filter(Boolean) || [];

    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];

    form.setValue("interestsText", newInterests.join(", "));
  };

  const handleQuickThemeToggle = (theme: string) => {
    const currentThemes = form.getValues("favoriteThemes") || [];
    const newThemes = currentThemes.includes(theme)
      ? currentThemes.filter(t => t !== theme)
      : [...currentThemes, theme];

    form.setValue("favoriteThemes", newThemes);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Child Profiles
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage profiles and preferences for personalized storytelling
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Child Profile
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? "Edit Profile" : "Create New Profile"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child's Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Emma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="3" 
                            max="12" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Grade 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="readingLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reading Level *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reading level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {readingLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/avatar.jpg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interestsText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interests & Hobbies</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., unicorns, dinosaurs, space, art..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Quick select common interests:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {commonInterests.slice(0, 12).map((interest) => (
                            <Badge
                              key={interest}
                              variant={
                                field.value?.includes(interest) ? "default" : "outline"
                              }
                              className="cursor-pointer text-xs"
                              onClick={() => handleQuickInterestToggle(interest)}
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="favoriteThemes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favorite Story Themes</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {themes.map((theme) => (
                          <Badge
                            key={theme}
                            variant={
                              field.value?.includes(theme) ? "default" : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() => handleQuickThemeToggle(theme)}
                          >
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contentSafety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Safety Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select safety level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contentSafetyLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="illustrationStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Illustration Style</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {illustrationStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={createProfile.isPending || updateProfile.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProfile.isPending || updateProfile.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {createProfile.isPending || updateProfile.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingProfile ? "Update Profile" : "Create Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profiles Grid */}
      {profiles && profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <ChildProfileCard
              key={profile.id}
              profile={profile}
              onEdit={() => handleOpenDialog(profile)}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No profiles yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first child profile to start generating personalized bedtime stories
            </p>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Management Tips */}
      {profiles && profiles.length > 0 && (
        <Card className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center">
              💡 Profile Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700 dark:text-amber-300">
              <div>
                <h4 className="font-semibold mb-2">📚 Reading Levels</h4>
                <p>Adjust the reading level as your child grows to ensure age-appropriate vocabulary and story complexity.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎨 Interests</h4>
                <p>Keep interests updated to generate more engaging and personalized stories that capture your child's imagination.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🛡️ Safety Settings</h4>
                <p>Content safety levels ensure all stories are appropriate. "Strict" avoids any conflict, while "Relaxed" allows gentle challenges.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🖼️ Illustration Styles</h4>
                <p>Different illustration styles create unique visual experiences. Try different styles to see what your child prefers!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
