import { ServiceStatusEnum } from "@/lib";
import { Technicians } from "./technicians.entity";

export interface ServiceDetails {
    SvdId?: number;
    ItemDetails?: string;
    FaultMessage?: string;
    Status?: ServiceStatusEnum;
    TecId?: number; 
    Technician?: Technicians;
    IsDeleted?: boolean;
    CreatedOn?: Date;
}