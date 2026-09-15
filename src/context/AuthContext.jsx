import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "beunique-auth-token";
const USER_KEY = "beunique-local-user";
const PASSWORD_KEY = "beunique-local-password";

function getStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors.
  }
}

function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors.
  }
}

function getSavedToken() {
  return getStorageItem(TOKEN_KEY);
}

function getSavedUser() {
  try {
    const savedUser = getStorageItem(USER_KEY);

    if (!savedUser) {
      return null;
    }

    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function saveUser(user) {
  setStorageItem(USER_KEY, JSON.stringify(user));
}

function generateToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `beunique-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

async function hashPassword(password) {
  if (
    typeof crypto !== "undefined" &&
    crypto.subtle &&
    typeof TextEncoder !== "undefined"
  ) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      data,
    );

    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  // Development fallback only.
  return btoa(unescape(encodeURIComponent(password)));
}

function getStoredPasswordHash() {
  return getStorageItem(PASSWORD_KEY);
}

function createLocalUser({
  firstName,
  lastName,
  email,
  phone,
}) {
  return {
    id: `local-${Date.now()}`,
    firstName,
    lastName,
    email,
    phone: phone || "",
    addresses: [],
    wishlist: [],
    createdAt: new Date().toISOString(),
  };
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id || `local-${Date.now()}`,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    addresses: Array.isArray(user.addresses)
      ? user.addresses
      : [],
    wishlist: Array.isArray(user.wishlist)
      ? user.wishlist
      : [],
    createdAt:
      user.createdAt || new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getSavedToken());
  const [user, setUser] = useState(getSavedUser());
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback(
    (nextToken, nextUser) => {
      if (!nextToken || !nextUser) {
        throw new Error(
          "Unable to create a valid login session.",
        );
      }

      const normalizedUser = normalizeUser(nextUser);

      setStorageItem(TOKEN_KEY, nextToken);
      saveUser(normalizedUser);

      setToken(nextToken);
      setUser(normalizedUser);
    },
    [],
  );

  const clearSession = useCallback(() => {
    removeStorageItem(TOKEN_KEY);

    setToken(null);
    setUser(null);
  }, []);

  const signup = useCallback(
    async ({
      firstName,
      lastName,
      email,
      password,
      phone,
    }) => {
      const cleanFirstName = firstName?.trim();
      const cleanLastName = lastName?.trim();
      const cleanEmail = email?.trim().toLowerCase();
      const cleanPhone = phone?.trim() || "";

      if (!cleanFirstName) {
        throw new Error(
          "Please enter your first name.",
        );
      }

      if (!cleanLastName) {
        throw new Error(
          "Please enter your last name.",
        );
      }

      if (!cleanEmail) {
        throw new Error(
          "Please enter your email address.",
        );
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw new Error(
          "Please enter a valid email address.",
        );
      }

      if (!password) {
        throw new Error(
          "Please enter a password.",
        );
      }

      if (password.length < 6) {
        throw new Error(
          "Your password must be at least 6 characters.",
        );
      }

      const existingUser = getSavedUser();

      if (
        existingUser?.email?.toLowerCase() ===
        cleanEmail
      ) {
        throw new Error(
          "An account with this email already exists. Please sign in instead.",
        );
      }

      const passwordHash =
        await hashPassword(password);

      const newUser = createLocalUser({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        phone: cleanPhone,
      });

      const nextToken = generateToken();

      setStorageItem(
        PASSWORD_KEY,
        passwordHash,
      );

      saveSession(nextToken, newUser);

      return newUser;
    },
    [saveSession],
  );

  const login = useCallback(
    async ({ email, password }) => {
      const cleanEmail = email?.trim().toLowerCase();

      if (!cleanEmail) {
        throw new Error(
          "Please enter your email address.",
        );
      }

      if (!password) {
        throw new Error(
          "Please enter your password.",
        );
      }

      const savedUser = getSavedUser();
      const savedPasswordHash =
        getStoredPasswordHash();

      if (!savedUser || !savedPasswordHash) {
        throw new Error(
          "No account was found on this device. Please create an account first.",
        );
      }

      if (
        savedUser.email?.toLowerCase() !==
        cleanEmail
      ) {
        throw new Error(
          "The email or password is incorrect.",
        );
      }

      const passwordHash =
        await hashPassword(password);

      if (passwordHash !== savedPasswordHash) {
        throw new Error(
          "The email or password is incorrect.",
        );
      }

      const nextToken =
        getSavedToken() || generateToken();

      saveSession(nextToken, savedUser);

      return savedUser;
    },
    [saveSession],
  );

  const logout = useCallback(async () => {
    clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    setLoading(true);

    try {
      const savedToken = getSavedToken();
      const savedUser = getSavedUser();

      if (!savedToken || !savedUser) {
        setToken(null);
        setUser(null);
        return;
      }

      const normalizedUser =
        normalizeUser(savedUser);

      setToken(savedToken);
      setUser(normalizedUser);

      saveUser(normalizedUser);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  const updateProfile = useCallback(
    async ({
      firstName,
      lastName,
      phone,
    }) => {
      if (!user) {
        throw new Error(
          "You must be signed in to update your profile.",
        );
      }

      const updatedUser = {
        ...user,
        firstName:
          firstName?.trim() ?? user.firstName,
        lastName:
          lastName?.trim() ?? user.lastName,
        phone:
          phone?.trim() ?? user.phone,
      };

      saveUser(updatedUser);
      setUser(updatedUser);

      return updatedUser;
    },
    [user],
  );

  const changePassword = useCallback(
    async ({
      currentPassword,
      newPassword,
    }) => {
      if (!user) {
        throw new Error(
          "You must be signed in to change your password.",
        );
      }

      if (!currentPassword) {
        throw new Error(
          "Please enter your current password.",
        );
      }

      if (!newPassword) {
        throw new Error(
          "Please enter your new password.",
        );
      }

      if (newPassword.length < 6) {
        throw new Error(
          "Your new password must be at least 6 characters.",
        );
      }

      const currentHash =
        await hashPassword(currentPassword);

      const savedHash =
        getStoredPasswordHash();

      if (currentHash !== savedHash) {
        throw new Error(
          "Your current password is incorrect.",
        );
      }

      const newHash =
        await hashPassword(newPassword);

      setStorageItem(
        PASSWORD_KEY,
        newHash,
      );

      return {
        success: true,
        message: "Password updated successfully.",
      };
    },
    [user],
  );

  const getOrders = useCallback(async () => {
    // Orders will be connected to the database later.
    return [];
  }, []);

  const getOrder = useCallback(
    async (reference) => {
      // Orders will be connected to the database later.
      return null;
    },
    [],
  );

  const addAddress = useCallback(
    async (address) => {
      if (!user) {
        throw new Error(
          "You must be signed in to add an address.",
        );
      }

      const newAddress = {
        id: `address-${Date.now()}`,
        ...address,
      };

      const addresses = [
        ...(user.addresses || []),
        newAddress,
      ];

      const updatedUser = {
        ...user,
        addresses,
      };

      saveUser(updatedUser);
      setUser(updatedUser);

      return newAddress;
    },
    [user],
  );

  const removeAddress = useCallback(
    async (addressId) => {
      if (!user) {
        throw new Error(
          "You must be signed in to remove an address.",
        );
      }

      const addresses = (
        user.addresses || []
      ).filter(
        (address) => address.id !== addressId,
      );

      const updatedUser = {
        ...user,
        addresses,
      };

      saveUser(updatedUser);
      setUser(updatedUser);
    },
    [user],
  );

  const getWishlist = useCallback(async () => {
    if (!user) {
      return [];
    }

    return user.wishlist || [];
  }, [user]);

  const addToWishlist = useCallback(
    async (productId) => {
      if (!user) {
        throw new Error(
          "Please sign in to add items to your wishlist.",
        );
      }

      const currentWishlist =
        user.wishlist || [];

      if (currentWishlist.includes(productId)) {
        return currentWishlist;
      }

      const wishlist = [
        ...currentWishlist,
        productId,
      ];

      const updatedUser = {
        ...user,
        wishlist,
      };

      saveUser(updatedUser);
      setUser(updatedUser);

      return wishlist;
    },
    [user],
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!user) {
        return [];
      }

      const wishlist = (
        user.wishlist || []
      ).filter(
        (id) => id !== productId,
      );

      const updatedUser = {
        ...user,
        wishlist,
      };

      saveUser(updatedUser);
      setUser(updatedUser);

      return wishlist;
    },
    [user],
  );

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(
          user && token,
        ),

        signup,
        login,
        logout,
        refreshUser,

        updateProfile,
        changePassword,

        getOrders,
        getOrder,

        addAddress,
        removeAddress,

        getWishlist,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}