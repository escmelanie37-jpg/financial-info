import { useUser } from "@clerk/nextjs";

export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser();

  return {
    isLoaded,
    isSignedIn,
    user,
    userId: user?.id ?? null,
    userName: user?.fullName ?? user?.username ?? null,
    userEmail: user?.primaryEmailAddress?.emailAddress ?? null,
    userImageUrl: user?.imageUrl ?? null,
  };
}
