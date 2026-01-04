import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

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
            }, 1500);
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
      {/* Login Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/20">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4 transition-all duration-300 ${isSuccess ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-gray-800 to-black animate-bounce-slow'}`}>
            <span className="text-3xl">{isSuccess ? '✓' : '💼'}</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {isSuccess ? 'Signed In!' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isSuccess ? 'Taking you to Find Work...' : 'Sign in to continue to WorkNow'}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center py-8 animate-fadeIn">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-transparent border-t-gray-800 rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium animate-pulse">
              Signing you in...
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Please wait a moment
            </p>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="flex flex-col items-center py-8 animate-fadeIn">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              Welcome back!
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Redirecting to Find Work...
            </p>
            <div className="mt-4 flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Google Button Container */}
        <div className={`transition-all duration-300 ${isLoading || isSuccess ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          {!googleReady && (
            <div className="flex flex-col items-center py-4">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-3"></div>
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
            <span className="px-4 bg-white text-gray-400">
              Quick & Secure
            </span>
          </div>
        </div>

        {/* Features */}
        <div className={`space-y-3 transition-all duration-300 ${isLoading || isSuccess ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>One-click sign in with Google</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span>Your data is secure & private</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span>Start finding or posting jobs instantly</span>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <p className={`mt-6 text-sm text-gray-400 text-center transition-opacity duration-300 ${isLoading || isSuccess ? 'opacity-0' : 'opacity-100'}`}>
        By signing in, you agree to our Terms of Service
      </p>
    </div>
  );
}
