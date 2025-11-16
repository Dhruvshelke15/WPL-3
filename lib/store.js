import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Optional: to persist login state

/**
 * Zustand store for shared application state.
 
 * We add `persist` middleware to keep the user logged in across refreshes.
 */

export const useAppStore = create(
  // persist( // Uncomment to enable persistence
    (set) => ({
      // --- State ---
      loggedInUser: null, // Holds user object (e.g., { _id, first_name })
      appContext: "Home",     // For TopBar context
      advancedFeatures: false, // For feature toggle

      // --- Actions ---
      login: (user) => set({ loggedInUser: user }),
      logout: () => set({ loggedInUser: null }),
      
      setAppContext: (context) => set({ appContext: context }),
      
      setAdvancedFeatures: (enabled) => set({ advancedFeatures: enabled }),
    }),
    // {
    //   name: 'photoshare-app-storage', // name for localStorage
    //   getStorage: () => localStorage, // (optional) by default uses localStorage
    // }
  // )
);