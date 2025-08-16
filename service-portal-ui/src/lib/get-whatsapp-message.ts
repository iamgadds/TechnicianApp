import { ServiceStatusEnum } from "./service-status.enum";

export const getWhatsAppMessage = (name: string, itemName: string, status: ServiceStatusEnum): string => {
    switch (status) {
        case ServiceStatusEnum.ACTIVE:
            return "Hello *" +  name + "*, \nPCB: *" + itemName + "*\nStatus: *Received* \n`You will receive another message to come and pick it up.`  \n\nThank You, \nIM Solutions.";
        case ServiceStatusEnum.RESOLVED:
            return "Hello *" +  name + "*, \nPCB: *" + itemName + "*\nStatus: *Completed* \n`You may come and collect it at your convenience.`  \n\nThank You, \nIM Solutions.";
        case ServiceStatusEnum.REJECTED:
            return "Hello *" +  name + "*, \nPCB: *" + itemName + "*\nStatus: *Failed* \n Sorry, your PCB is beyond repair. \n\nThank You, \nIM Solutions.";
        default:
            return "Hello *" +  name + "*, \nPCB: *" + itemName + "*\nStatus: *There is an update in your PCB* \n\nThank You, \nIM Solutions.";
    }
};
