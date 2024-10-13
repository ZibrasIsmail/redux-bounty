export const saveCurrentRoute = (route: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastRoute', route);
  }
};

export const getLastRoute = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('lastRoute');
  }
  return null;
};
