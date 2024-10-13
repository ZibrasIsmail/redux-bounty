import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const setAuthData = (user: User, token: string) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

export const getAuthData = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem('token');
  return { user, token };
};

export const clearAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('cart'); // Add this line to clear the cart
};

// Add this new function
export const verifyToken = async (token: string): Promise<User | null> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, role: string };
    // In a real application, you might want to fetch the full user object from the database here
    return { 
      id: decoded.userId, 
      name: 'User', // You might want to fetch this from the database
      email: 'user@example.com', // You might want to fetch this from the database
      role: decoded.role 
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};
