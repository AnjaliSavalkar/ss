// import React, { useState } from "react";
// import { Activity, AlertCircle } from "lucide-react";
// import { authAPI } from "../services/api";

// export default function Login({ onLogin }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isRegister, setIsRegister] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       let response;
//       if (isRegister) {
//         response = await authAPI.register(email, password);
//       } else {
//         response = await authAPI.login(email, password);
//       }

//       // Save token to localStorage
//       localStorage.setItem("token", response.token);
//       localStorage.setItem("user", JSON.stringify(response.user));

//       // Notify parent component
//       onLogin(response.user, response.token);
//     } catch (err) {
//       setError(err.response?.data?.message || "Authentication failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Activity className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-800">Stock Broker</h1>
//           <p className="text-gray-600 mt-2">Real-time market dashboard</p>
//         </div>

//         {error && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
//             <AlertCircle className="w-5 h-5" />
//             <span className="text-sm">{error}</span>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               required
//               minLength={6}
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <button
//             onClick={() => {
//               setIsRegister(!isRegister);
//               setError("");
//             }}
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             {isRegister
//               ? "Already have an account? Login"
//               : "Need an account? Register"}
//           </button>
//         </div>

//         <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//           <p className="text-xs text-blue-800">
//             <strong>Demo:</strong> Register with any email/password (min 6
//             chars)
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { Activity, AlertCircle } from "lucide-react";
import { authAPI } from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Auto-login with just email (backend creates account if needed)
      const response = await authAPI.login(email, "");

      // Save token to localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Notify parent component
      onLogin(response.user, response.token);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Stock Broker</h1>
          <p className="text-gray-600 mt-2">Real-time market dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : "Login to Dashboard"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            <strong>✨ No Registration Required!</strong>
            <br />
            Just enter any email to instantly access your dashboard.
            <br />
            Your subscriptions are automatically saved.
          </p>
        </div>
      </div>
    </div>
  );
}
