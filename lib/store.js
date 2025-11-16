import { create } from 'zustand';

/**
 * Zustand store for shared application state.
 */

// exporting
const useAppStore = create(
  (set) => ({
    // State
    loggedInUser: null, // Holds user object (e.g., { _id, first_name })
    appContext: "Home",     // For TopBar context
    advancedFeatures: false, // For feature toggle

    // Actions
    login: (user) => set({ loggedInUser: user }),
    logout: () => set({ loggedInUser: null }),
    
    setAppContext: (context) => set({ appContext: context }),
    
    setAdvancedFeatures: (enabled) => set({ advancedFeatures: enabled }),
  }),
);

export default useAppStore;