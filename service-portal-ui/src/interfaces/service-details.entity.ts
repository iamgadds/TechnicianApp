import { ServiceStatusEnum } from "@/lib";
import { Technicians } from "./technicians.entity";
import { Items } from "./items.entity";

export interface ServiceDetails {
    SvdId?: number;
    ItemId?: number;
    Item?: Items;
    FaultMessage?: string;
    Status?: ServiceStatusEnum;
    TecId?: number; 
    Technician?: Technicians;
    IsDeleted?: boolean;
    CreatedOn?: Date;
}