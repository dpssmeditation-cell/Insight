import { User } from '../types';

const USERS_STORAGE_KEY = 'insight_sharing_users';
const SESSION_STORAGE_KEY = 'insight_sharing_session';

// Helper to get all users
const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save users
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const authService = {
  // Register a new user
  register: async (fullName: string, email: string, password?: string, provider: User['provider'] = 'email'): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      throw new Error('User with this email already exists.');
    }

    const newUser: User = {
      id: Date.now().toString(),
      fullName,
      email,
      password, // Note: In a production app, never store plain text passwords!
      provider,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5D3A1A&color=fff`,
      joinedDate: new Date().toISOString(),
      bookmarks: [],
      history: []
    };

    users.push(newUser);
    saveUsers(users);
    
    // Auto login after register
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // Login existing user
  login: async (email: string, password?: string, provider: User['provider'] = 'email'): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getUsers();
    
    // For social login simulation, we find by email or create if not exists
    if (provider !== 'email') {
        let socialUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!socialUser) {
             // Implicitly register social user
             return authService.register(email.split('@')[0], email, undefined, provider);
        }
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(socialUser));
        return socialUser;
    }

    // Standard Email login
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  // Update user profile/data
  updateUser: async (updatedUser: User): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
    
    const users = getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index === -1) {
      throw new Error('User not found');
    }

    users[index] = updatedUser;
    saveUsers(users);
    
    // Update session if it's the current user
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
    }
    
    return updatedUser;
  },

  // Simulate Password Reset
  resetPassword: async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // In a real app, we might not want to reveal if a user exists, 
    // but for this demo, it helps to know if the account is found.
    if (!user) {
        throw new Error("No account found with this email address.");
    }

    return;
  },

  // Get current session
  getCurrentUser: (): User | null => {
    const sessionJson = localStorage.getItem(SESSION_STORAGE_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};
