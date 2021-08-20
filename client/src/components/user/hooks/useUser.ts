import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

async function getUser(user: User | null): Promise<User | null> {
  if (!user) return null;
  const { data } = await axiosInstance.get(`/user/${user.id}`, {
    headers: getJWTHeader(user),
  });
  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export function useUser(): UseUser {
  const queryClient = useQueryClient();

  // Need to maintain a react state because can't run user useQuery without knowing userId
  const [user, setUser] = useState<User | null>(getStoredUser());

  // Make sure user state is consistent with the server
  useQuery(queryKeys.user, () => getUser(user), {
    enabled: !!user, // Dependent query, only run when we have a logged in user
    onSuccess(data) {
      setUser(data);
    },
  });

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // set user in state
    setUser(newUser);

    // update user in localstorage
    setStoredUser(newUser);

    // pre-populate user profile in React Query client
    queryClient.setQueryData(queryKeys.user, newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    // update state
    setUser(null);

    // remove from localstorage
    clearStoredUser();

    // reset user to null in query client
    // can't use removeQueries here because it doesn't cancel the query in progress to server. (race condition)
    // setQueryData overwrites and cancels existing queries in progress.
    queryClient.setQueryData(queryKeys.user, null);

    // remove userAppointments query from cache
    queryClient.removeQueries('user-appointments');
  }

  return { user, updateUser, clearUser };
}
