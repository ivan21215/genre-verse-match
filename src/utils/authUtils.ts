
export interface User {
  name: string;
  email: string;
  businessType: "venue" | "club";
  address: string;
}

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem("currentUser");
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const isUserLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};

export const logoutUser = () => {
  localStorage.removeItem("currentUser");
};

export const registerUser = (
  email: string,
  password: string,
  name: string,
  businessType: "venue" | "club",
  address: string
): boolean => {
  // Check if user already exists
  const existingUser = localStorage.getItem(`${businessType}_${email}`);
  if (existingUser) return false;
  
  // Save user info
  localStorage.setItem(`${businessType}_${email}`, JSON.stringify({
    name,
    email,
    password, // Note: In a real app, never store passwords in plain text
    businessType,
    address,
    registeredAt: new Date().toISOString()
  }));
  
  // Set current user
  localStorage.setItem("currentUser", JSON.stringify({
    email,
    name,
    businessType,
    address
  }));
  
  return true;
};

export const loginUser = (
  email: string,
  password: string,
  businessType: "venue" | "club"
): boolean => {
  const storedUser = localStorage.getItem(`${businessType}_${email}`);
  
  if (!storedUser) return false;
  
  const user = JSON.parse(storedUser);
  if (user.password !== password) return false;
  
  // Set current user
  localStorage.setItem("currentUser", JSON.stringify({
    email: user.email,
    name: user.name,
    businessType: user.businessType,
    address: user.address
  }));
  
  return true;
};
