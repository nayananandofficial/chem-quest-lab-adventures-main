import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";
import {
  User,
  Settings,
  Palette,
  LogOut,
  Cpu,
  Zap,
  Gauge,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChemistryLabProfilePage() {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    photoURL: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "Profile" | "Settings" | "Appearance"
  >("Profile");

  const [settings, setSettings] = useState({
    performanceMode: "balanced",
    enableGPUBoost: true,
    fastLabRendering: false,
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    accentColor: "indigo",
    density: "comfortable",
  });
  const [gpuType, setGpuType] = useState<"integrated" | "discrete" | "unknown">("unknown");

useEffect(() => {
  const canvas = document.createElement("canvas");
  const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

  if (gl) {
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : "";

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
        bio: "",
        photoURL: currentUser.photoURL || "",
      });
      setLoading(false);
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData({ ...formData, photoURL: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const level = 4;
  const nextLevel = level + 1;
  const progress = 72;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Loading...
      </div>
    );

  return (
    <div
      className={`flex min-h-screen font-sans transition-colors duration-300 ${
        appearance.theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 ${
          appearance.theme === "dark" ? "bg-gray-800" : "bg-white"
        } border-r shadow-md flex flex-col`}
      >
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-indigo-600">
            Virtual Chemistry Lab
          </h1>
        </div>

        <nav className="flex-1 flex flex-col p-4 gap-2">
          {[
            { name: "Profile", icon: <User className="h-4 w-4" /> },
            { name: "Settings", icon: <Settings className="h-4 w-4" /> },
          ].map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setActiveTab(name as any)}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === name
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
            >
              {icon}
              {name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
        <button
            onClick={() => {
            auth.signOut().then(() => {
                navigate("/"); // redirect to landing page
            });
            }}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
            <LogOut className="h-4 w-4" />
            Logout
        </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">{activeTab}</h2>
        </div>

        {/* PROFILE */}
        {activeTab === "Profile" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Progress */}
            <section className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl shadow border">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {level}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    LVL
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">
                    Level {level}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Member since {currentUser.metadata.creationTime?.split("T")[0]}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress to Level {nextLevel}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div
                    className="h-3 bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </section>

            {/* Profile Info */}
            <section className="bg-white p-6 rounded-xl shadow border space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={formData.photoURL || "https://via.placeholder.com/96"}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-100"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-4.553a2 2 0 00-2.828-2.828L12 7.172 8.276 3.448a2 2 0 10-2.828 2.828L9.172 10M12 7v13"
                        />
                      </svg>
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {formData.displayName || "Your Name"}
                  </h3>
                  <p className="text-sm text-gray-500">{currentUser.email}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={currentUser.email || ""}
                    disabled
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={4}
                    disabled={!isEditing}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        alert("Saved!");
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {/* SETTINGS */}
        {activeTab === "Settings" && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow border space-y-6"
          >
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-600" /> System & Performance   (Beta Version - More features coming soon on Version 1.0)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
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
                    className="border rounded p-2 w-full"
                >
                    <option value="balanced">Balanced (Recommended)</option>
                    <option value="performance">High Performance</option>
                    <option value="eco">Power Saving</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    Detected GPU: {gpuType === "unknown"
                    ? "Unknown"
                    : gpuType === "discrete"
                    ? "Discrete (NVIDIA/AMD)"
                    : "Integrated (Intel/AMD Ryzen)"}
                </p>
                </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableGPUBoost}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableGPUBoost: e.target.checked,
                    })
                  }
                />
                <span>Enable GPU Boost for lab rendering (faster visuals)</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.fastLabRendering}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fastLabRendering: e.target.checked,
                    })
                  }
                />
                <span>Enable Fast Chemistry Simulation Mode</span>
              </label>
            </div>

            <div className="pt-4">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Apply Changes
              </button>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
