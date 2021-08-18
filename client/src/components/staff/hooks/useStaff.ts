import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import type { Staff } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { filterByTreatment } from '../utils';

async function getStaff(): Promise<Staff[]> {
  const { data } = await axiosInstance.get('/staff');
  return data;
}

interface UseStaff {
  staff: Staff[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
}

export function useStaff(): UseStaff {
  // for filtering staff by treatment
  const [filter, setFilter] = useState('all');

  const { data = [] } = useQuery([queryKeys.staff], getStaff);

  return {
    staff: useMemo(
      () => (filter === 'all' ? data : filterByTreatment(data, filter)),
      [data, filter],
    ),
    filter,
    setFilter,
  };
}
