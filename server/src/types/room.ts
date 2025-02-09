import { User } from "./user";

export interface RoomInfo{
    roomID: string;
    hostID: string;
    users : User[];
}