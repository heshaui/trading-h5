import { createContext, useContext } from 'react';
import themeStore from './ThemeStore';
import userStore from './UserStore';

class RootStore {
  themeStore = themeStore;
  userStore = userStore;
}

export const rootStore = new RootStore();

export const StoreContext = createContext(rootStore);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export { themeStore, userStore }; 