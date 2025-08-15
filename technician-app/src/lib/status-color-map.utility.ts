import { ServiceStatusEnum } from "./service-status.enum";

export const StatusColorMap = {
    [ServiceStatusEnum.ACTIVE]: 'blue',
    [ServiceStatusEnum.RESOLVED]: 'amber',
    [ServiceStatusEnum.REJECTED]: 'red',
  };
  