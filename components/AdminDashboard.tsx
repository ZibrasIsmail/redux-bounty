"use client";

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from '@/utils/types';

export default function AdminDashboard() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: '' });

  const fetchUsers = useCallback(async () => {
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setUsers(data);
  }, [token]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
    } else {
      fetchUsers();
    }
  }, [currentUser, router, fetchUsers]);

  const handleDeleteUser = async (userId: number) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account while logged in.");
      return;
    }
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      fetchUsers();
    } else {
      const data = await response.json();
      alert(data.error || 'An error occurred while deleting the user');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newUser),
    });
    if (response.ok) {
      fetchUsers();
      setNewUser({ name: '', email: '', password: '', role: '' });
    } else {
      const data = await response.json();
      alert(data.error || 'An error occurred while adding the user');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole }),
    });
    if (response.ok) {
      fetchUsers();
    } else {
      const data = await response.json();
      alert(data.error || 'An error occurred while updating the user role');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>Create a new user account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => setNewUser({ ...newUser, role: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="shopper">Shopper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Add User</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all users of the eCommerce platform</CardDescription>
        </CardHeader>
        <CardContent>
          <ul>
            {users.map((user: User) => (
              <li key={user.id} className="flex justify-between items-center mb-2">
                <span>{user.name} ({user.email}) - {user.role}</span>
                <div>
                  {user.role !== 'admin' && (
                    <Button onClick={() => handleUpdateRole(user.id, 'admin')} className="mr-2">
                      Make Admin
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleDeleteUser(user.id)} 
                    variant="destructive"
                    disabled={user.id === currentUser?.id}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
