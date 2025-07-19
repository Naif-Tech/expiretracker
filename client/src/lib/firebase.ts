import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut, onAuthStateChanged, type User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "expire-app"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "expire-app",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "expire-app"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');

export function signInWithGoogle() {
  return signInWithRedirect(auth, provider);
}

export function signOutUser() {
  return signOut(auth);
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Call this function on page load when the user is redirected back to your site
export async function handleRedirect() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      return user;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}
