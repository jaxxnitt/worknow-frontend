import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Confetti from "../components/Confetti";

const API = "https://worknow-backend.onrender.com";

export default function Login() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && !isSuccess) {
      navigate("/");
    }
  }, [isLoggedIn, isSuccess, navigate]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      return;
    }

    // Check if Google script is ready
    const initGoogle = () => {
      if (!window.google) {
        setTimeout(initGoogle, 100);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setIsLoading(true);
          try {
            const res = await fetch(`${API}/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                idToken: response.credential
              })
            });

            if (!res.ok) {
              throw new Error("Login failed");
            }

            const data = await res.json();
            login(data.token, data.user);
            setIsLoading(false);
            setIsSuccess(true);

            // Show success animation then redirect
            setTimeout(() => {
              navigate("/");
            }, 2000);
          } catch (err) {
            alert("Login failed. Please try again.");
            setIsLoading(false);
          }
        }
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-login"),
        {
          theme: "outline",
          size: "large",
          width: 300,
          shape: "pill"
        }
      );

      setGoogleReady(true);
    };

    initGoogle();
  }, [login]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
      <Confetti active={isSuccess} />

      {/* Login Card */}
      <div className="glass-vibrant rounded-3xl shadow-2xl p-10 w-full max-w-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl" />

        {/* Logo / Brand */}
        <div className="text-center mb-8 relative">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-xl mb-4 transition-all duration-500 ${
            isSuccess
              ? 'bg-gradient-to-br from-green-400 to-emerald-500 scale-110'
              : 'bg-gradient-to-br from-violet-500 to-pink-500 animate-float'
          }`}>
            {isSuccess ? (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-4xl">💼</span>
            )}
          </div>
          <h1 className="text-3xl font-bold gradient-text">
            {isSuccess ? 'Welcome!' : 'Join WorkNow'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isSuccess ? 'Taking you to your dashboard...' : 'Sign in to find or post jobs'}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center py-8 animate-fadeIn">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-700 font-semibold animate-pulse">
              Signing you in...
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Just a moment
            </p>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="flex flex-col items-center py-8 animate-fadeIn">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-4 animate-success-pop">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-bold text-gray-800">
              You're all set!
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Redirecting...
            </p>
            <div className="loading-dots mt-4">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {/* Google Button Container */}
        <div className={`transition-all duration-300 ${isLoading || isSuccess ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          {!googleReady && (
            <div className="flex flex-col items-center py-4">
              <div className="w-8 h-8 rounded-full border-3 border-violet-200 border-t-violet-600 animate-spin mb-3"></div>
              <p className="text-sm text-gray-500">Loading Google Sign-In...</p>
            </div>
          )}

          <div
            id="google-login"
            className={`flex justify-center transition-all duration-500 ${googleReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          />
        </div>

        {/* Divider */}
        <div className={`relative my-8 transition-all duration-300 ${isLoading || isSuccess ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 text-gray-400 rounded-full">
              Why WorkNow?
            </span>
          </div>
        </div>

        {/* Features */}
        <div className={`space-y-3 transition-all duration-300 ${isLoading || isSuccess ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 text-sm text-gray-600 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">One-click sign in with Google</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-medium">Your data is secure & private</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 bg-gradient-to-r from-violet-50 to-pink-50 p-3 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-medium">Start finding or posting jobs instantly</span>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <p className={`mt-6 text-sm text-white/60 text-center transition-opacity duration-300 ${isLoading || isSuccess ? 'opacity-0' : 'opacity-100'}`}>
        By signing in, you agree to our Terms of Service
      </p>
    </div>
  );
}
