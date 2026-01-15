import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { getProfile, getPortfolioVideo } from "../api/client";
import VideoUpload from "../components/VideoUpload";

function StarRating({ rating, count }) {
  const stars = [];
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current drop-shadow-sm" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <svg key={i} className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`halfGrad-${i}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
          <path fill={`url(#halfGrad-${i})`} d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      );
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">{stars}</div>
      <span className="text-lg font-bold text-gray-700">{(rating || 0).toFixed(1)}</span>
      {count > 0 && <span className="text-sm text-gray-400">({count} reviews)</span>}
    </div>
  );
}

function AchievementBadge({ icon, title, unlocked, description }) {
  return (
    <div className={`relative group ${unlocked ? '' : 'opacity-40 grayscale'}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all duration-300 group-hover:scale-110 ${
        unlocked
          ? 'bg-gradient-to-br from-amber-400 to-orange-500 animate-glow'
          : 'bg-gray-200'
      }`}>
        {icon}
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-bottom-8 transition-all duration-300 whitespace-nowrap">
        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg">
          {title}
        </div>
      </div>
      {unlocked && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, subtext }) {
  return (
    <div className="stat-card group hover:scale-105 transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800 group-hover:animate-number-pop">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

export default function Profile() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    async function fetchData() {
      try {
        const [profileData, videoData] = await Promise.all([
          getProfile(),
          getPortfolioVideo().catch(() => ({ hasVideo: false, videoUrl: null }))
        ]);
        setProfile(profileData);
        if (videoData.hasVideo) {
          setVideoUrl(videoData.videoUrl);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isLoggedIn, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 animate-pulse" />
            </div>
          </div>
          <p className="text-white/80 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const data = profile || user || {};

  // Calculate level based on activity
  const totalActivity = (data.jobsApplied || 0) + (data.jobsPosted || 0) + (data.jobsCompleted || 0);
  const level = Math.floor(totalActivity / 5) + 1;
  const xpProgress = (totalActivity % 5) * 20;

  // Determine achievements
  const achievements = [
    { icon: "🎯", title: "First Apply", unlocked: (data.jobsApplied || 0) >= 1 },
    { icon: "🏆", title: "5 Jobs Done", unlocked: (data.jobsCompleted || 0) >= 5 },
    { icon: "💼", title: "Employer", unlocked: (data.jobsPosted || 0) >= 1 },
    { icon: "⭐", title: "Top Rated", unlocked: (data.workerRating || 0) >= 4.5 },
    { icon: "🎬", title: "Video Pro", unlocked: !!videoUrl },
    { icon: "🔥", title: "On Fire", unlocked: (data.jobsCompleted || 0) >= 10 },
  ];

  return (
    <div className="animate-fadeIn space-y-6 pb-24">
      {/* Profile Header Card */}
      <div className="glass-vibrant rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl" />

        <div className="relative flex items-start gap-5">
          {/* Avatar */}
          <div className="relative">
            {data.avatar || data.picture ? (
              <img
                src={data.avatar || data.picture}
                alt="Profile"
                className="w-24 h-24 rounded-2xl shadow-xl object-cover ring-4 ring-white/50"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl shadow-xl flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white/50">
                {data.name?.charAt(0) || "U"}
              </div>
            )}
            {/* Online Indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-800">
                {data.name || "User"}
              </h2>
              <div className="level-badge">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Level {level}
              </div>
            </div>

            <p className="text-gray-500 mb-3">{data.email || "No email"}</p>

            {/* XP Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>XP Progress</span>
                <span>{xpProgress}/100 to Level {level + 1}</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-success">
                <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse" />
                Active
              </span>
              {data.mode && (
                <span className={data.mode === 'EMPLOYER' ? 'badge-info' : 'badge-warning'}>
                  {data.mode === 'EMPLOYER' ? '👔 Employer' : '👷 Worker'}
                </span>
              )}
              {videoUrl && (
                <span className="badge-premium">
                  🎬 Video Profile
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-vibrant rounded-2xl p-1.5 flex gap-1">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'video', label: 'Portfolio', icon: '🎬' },
          { id: 'achievements', label: 'Badges', icon: '🏆' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Ratings Section */}
          <div className="glass-vibrant rounded-2xl p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">⭐</span>
              Your Ratings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-600 mb-2 font-medium">As Worker</p>
                <StarRating rating={data.workerRating} count={data.workerRatingCount || 0} />
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <p className="text-sm text-purple-600 mb-2 font-medium">As Employer</p>
                <StarRating rating={data.employerRating} count={data.employerRatingCount || 0} />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              label="Jobs Applied"
              value={data.jobsApplied || 0}
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Jobs Completed"
              value={data.jobsCompleted || 0}
              color="bg-gradient-to-br from-green-500 to-emerald-500"
            />
            <StatCard
              icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Money Earned"
              value={`₹${data.moneyEarned || 0}`}
              color="bg-gradient-to-br from-amber-500 to-orange-500"
              subtext="Total earnings"
            />
            <StatCard
              icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              label="Jobs Posted"
              value={data.jobsPosted || 0}
              color="bg-gradient-to-br from-violet-500 to-purple-500"
              subtext="As employer"
            />
          </div>
        </div>
      )}

      {activeTab === 'video' && (
        <div className="glass-vibrant rounded-2xl p-5 animate-fadeIn">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-xl">🎬</span>
            Portfolio Video
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Stand out from the crowd! Add a video to introduce yourself to potential employers.
          </p>
          <VideoUpload
            videoUrl={videoUrl}
            onVideoChange={(url) => setVideoUrl(url)}
          />
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="glass-vibrant rounded-2xl p-5 animate-fadeIn">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🏆</span>
            Achievement Badges
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Complete tasks to unlock badges and show off your experience!
          </p>
          <div className="grid grid-cols-3 gap-6 justify-items-center">
            {achievements.map((achievement, index) => (
              <AchievementBadge
                key={index}
                icon={achievement.icon}
                title={achievement.title}
                unlocked={achievement.unlocked}
              />
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {achievements.filter(a => a.unlocked).length} of {achievements.length} badges unlocked
            </p>
            <div className="progress-bar mt-2">
              <div
                className="progress-bar-fill"
                style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-vibrant rounded-2xl p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="font-medium text-gray-700">Find Work</span>
          </button>

          <button
            onClick={() => navigate("/post")}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-violet-50 to-pink-50 hover:from-violet-100 hover:to-pink-100 rounded-xl transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-medium text-gray-700">Post a Job</span>
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
        className="w-full glass-vibrant p-4 rounded-2xl flex items-center justify-between group hover:bg-red-50 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="font-medium text-red-600">Sign Out</span>
        </div>
        <svg className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Google Sign In Info */}
      <p className="text-center text-sm text-white/60 flex items-center justify-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Signed in with Google
      </p>
    </div>
  );
}
