"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthData } from "@/lib/auth";
import { setLoading, setToken, setUser } from "@/lib/slices/authSlice";
import { RootState } from '@/lib/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function HomeClient() {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const { user, token } = getAuthData();
      if (user && token) {
        dispatch(setUser(user));
        dispatch(setToken(token));
      }
      dispatch(setLoading(false));
    };

    initializeAuth();
  }, [dispatch]);

  if (isLoading) {
    return null; // Return null instead of a loading indicator
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold">Welcome to Our eCommerce Store</CardTitle>
            <CardDescription>Your one-stop shop for all your needs</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <p>Hello, {user.name}! Your role is: {user.role}</p>
            ) : (
              <p>Please log in or register to continue.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
