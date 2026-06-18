import { useState, useCallback, useEffect } from "react";
import { businessProfileApi } from "../api";
import { BusinessProfile } from "../../../types/business-profile";
import { User } from "../../../types/auth";

export function useBusinessProfile(user: User | null) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await businessProfileApi.getProfile();
      setProfile(res.data);
    } catch (err) {
      setError("Failed to fetch business profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadProfile() {
      try {
        const res = await businessProfileApi.getProfile();
        if (!ignore) {
          setProfile(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError("Failed to fetch business profile");
          setLoading(false);
        }
      }
    }

    if (user) {
      loadProfile();
    }

    return () => {
      ignore = true;
    };
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
  };
}
