import { UseMutateFunction, useMutation } from 'react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from '../../user/hooks/useUser';

async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined,
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? 'replace' : 'add';
  const patchData = [{ op: patchOp, path: '/userId', value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

type AppointmentMutationFunction = UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
>;

export function useReserveAppointment(): AppointmentMutationFunction {
  const { user } = useUser();
  const toast = useCustomToast();

  const { mutate } = useMutation((appointment: Appointment) =>
    setAppointmentUser(appointment, user.id),
  );

  return mutate;
}
