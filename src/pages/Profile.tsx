import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  LogOut,
  Cpu,
  Edit,
  Camera,
  Award,
  Beaker,
  FlaskConical,
  Atom,
  Trophy,
  Clock,
  Target,
  BookOpen,
  ChevronRight,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Monitor,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Editable Field Component
const EditableField = ({ label, value, field, multiline = false, icon, formData, setFormData, editingField, setEditingField }) => {
  const isEditing = editingField === field;
  
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {icon && <span className="text-indigo-600">{icon}</span>}
          <CardTitle className="text-sm font-semibold">{label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {multiline ? (
              <textarea
                value={value}
                onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                rows={4}
                placeholder={`Enter your ${label.toLowerCase()}`}
              />
            ) : (
              <Input
                value={value}
                onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                placeholder={`Enter your ${label.toLowerCase()}`}
              />
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => setEditingField(null)}
                size="sm"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingField(null)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="group flex items-center justify-between">
            <p className="text-gray-800 font-medium">
              {value || (
                <span className="text-gray-400 italic">Add {label.toLowerCase()}</span>
              )}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingField(field)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </Button>  
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Stats Card Component
const StatsCard = ({ icon, value, label, className }) => (
  <Card className={`${className} transition-all duration-300 hover:shadow-md`}>
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-600 rounded-lg shadow-lg">
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Achievement Badge Component
const AchievementBadge = ({ title, description, earned = false }) => (
  <Card className={`transition-all ${
    earned
      ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50'
      : 'border-gray-200 bg-gray-50'
  }`}>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          earned ? 'bg-yellow-500' : 'bg-gray-400'
        }`}>
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <div>
          <h4 className={`font-semibold ${earned ? 'text-yellow-700' : 'text-gray-500'}`}>
            {title}
          </h4>
          <p className={`text-xs ${earned ? 'text-yellow-600' : 'text-gray-400'}`}>
            {description}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ChemistryLabProfilePage() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: "",
    photoURL: "",
  });

  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");

  const [settings, setSettings] = useState({
    performanceMode: "balanced",
    enableGPUBoost: true,
    fastLabRendering: false,
  });

  const [gpuType, setGpuType] = useState("unknown");

  // GPU Detection
  useEffect(() => {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as unknown as WebGLRenderingContext | null;

      if (gl) {
        // use any to safely access WebGL debug extension methods without TS errors
        const anyGl = gl as any;
        const debugInfo = anyGl.getExtension && anyGl.getExtension("WEBGL_debug_renderer_info");
        const renderer = debugInfo && anyGl.getParameter ? String(anyGl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : "";

        if (renderer) {
          const lower = renderer.toLowerCase();
          if (lower.includes("intel") || (lower.includes("radeon vega") && lower.includes("integrated"))) {
            setGpuType("integrated");
          } else if (lower.includes("nvidia") || lower.includes("amd") || lower.includes("radeon")) {
            setGpuType("discrete");
          } else {
            setGpuType("unknown");
          }
        }
      }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || "",
        photoURL: currentUser.photoURL || "",
      });
      setLoading(false);
    }
  }, [currentUser]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData({ ...formData, photoURL: String(reader.result || '') });
      reader.readAsDataURL(file);
    }
  };

  const handleBackToLab = () => {
    navigate("/lab");
  };

  const level = 4;
  const nextLevel = level + 1;
  const progress = 72;
  const experimentsCompleted = 23;
  const labHours = 47;
  const badges = 8;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700 mt-6">Loading your lab profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Top Navbar: Title left, Tabs center, Button right */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-start">
          <h1 className="text-2xl font-bold">Chemistry Lab Profile</h1>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2">
          {[
            { name: "Profile", icon: <User className="h-4 w-4" /> },
            { name: "Settings", icon: <Settings className="h-4 w-4" /> },
          ].map(({ name, icon }) => (
            <Button
              key={name}
              variant={activeTab === name ? "default" : "outline"}
              onClick={() => setActiveTab(name)}
              className="flex items-center gap-2"
              size="sm"
            >
              {icon}
              {name}
            </Button>
          ))}
        </div>
        
        <div className="flex-shrink-0 flex gap-2">
          <Button
            variant="outline"
            onClick={handleBackToLab}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lab
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              auth.signOut().then(() => {
                navigate("/");
              });
            }}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* PROFILE SECTION */}
          {activeTab === "Profile" && (
            <>
              {/* Profile Header Card */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-8">
                    <div className="relative group">
                      <img
                        src={formData.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80"}
                        alt="Profile Avatar"
                        className="w-24 h-24 rounded-full border-4 border-gray-200 shadow-lg object-cover"
                      />
                      <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer group-hover:scale-110 transition-transform">
                        <Camera className="h-4 w-4 text-indigo-600" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                    
                    <div>
                      <h2 className="text-3xl font-bold mb-2">
                        {formData.displayName || "Chemistry Researcher"}
                      </h2>
                      <p className="text-gray-600 flex items-center gap-2 mb-4">
                        <Mail className="h-4 w-4" />
                        {currentUser?.email}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                          Level {level} Chemist
                        </span>
                        <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {badges} Badges
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progress to Level {nextLevel}
                      </span>
                      <span className="text-sm font-bold text-indigo-600">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Complete 5 more experiments to reach the next level
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Lab Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  icon={<Beaker className="h-6 w-6 text-white" />}
                  value={experimentsCompleted}
                  label="Experiments Completed"
                  className=""
                />
                
                <StatsCard
                  icon={<Clock className="h-6 w-6 text-white" />}
                  value={labHours}
                  label="Total Lab Hours"
                  className=""
                />
                
                <StatsCard
                  icon={<Award className="h-6 w-6 text-white" />}
                  value={badges}
                  label="Badges Earned"
                  className=""
                />
              </div>

              {/* Personal Information - Simplified */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <EditableField
                      label="Display Name"
                      value={formData.displayName}
                      field="displayName"
                      icon={<User className="h-4 w-4" />}
                      formData={formData}
                      setFormData={setFormData}
                      editingField={editingField}
                      setEditingField={setEditingField}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* SETTINGS SECTION */}
          {activeTab === "Settings" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-600" />
                  System & Performance
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                    Beta
                  </span>
                </CardTitle>
                <CardDescription>
                  Configure your lab settings and performance options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Monitor className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">System Detection</span>
                    </div>
                    <p className="text-blue-700 font-medium">
                      GPU Type: {gpuType === "unknown" ? "Unknown" : gpuType === "discrete" ? "Discrete (NVIDIA/AMD)" : "Integrated (Intel/AMD Ryzen)"}
                    </p>
                  </CardContent>
                </Card>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Optimization Mode
                  </label>
                  <select
                    value={settings.performanceMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        performanceMode: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="balanced">Balanced (Recommended)</option>
                    <option value="performance">High Performance</option>
                    <option value="eco">Power Saving</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <label className="flex items-center gap-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableGPUBoost}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              enableGPUBoost: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div>
                          <span className="font-semibold text-gray-800">Enable GPU Boost</span>
                          <p className="text-sm text-gray-600">Faster 3D rendering for chemistry models</p>
                        </div>
                      </label>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <label className="flex items-center gap-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.fastLabRendering}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              fastLabRendering: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div>
                          <span className="font-semibold text-gray-800">Fast Chemistry Simulation</span>
                          <p className="text-sm text-gray-600">Accelerated molecular simulations</p>
                        </div>
                      </label>
                    </CardContent>
                  </Card>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full">
                    Apply Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-72 space-y-4">
          {/* Chemistry Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FlaskConical className="h-4 w-4 text-indigo-600" />
                Chemistry Specializations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  'Organic Chemistry',
                  'Analytical Chemistry', 
                  'Physical Chemistry',
                  'Biochemistry',
                  'Inorganic Chemistry',
                  'Environmental Chemistry'
                ].map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-indigo-600" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AchievementBadge
                  title="First Experiment"
                  description="Completed your first lab experiment"
                  earned={true}
                />
                <AchievementBadge
                  title="Safety Expert"
                  description="Perfect safety record for 30 days"
                  earned={true}
                />
                <AchievementBadge
                  title="Speed Chemist"
                  description="Complete 5 experiments in one day"
                  earned={false}
                />
                <AchievementBadge
                  title="Lab Master"
                  description="Reach Level 10 in the lab"
                  earned={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}