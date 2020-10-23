import { IUser } from './user';

export interface ICollage {
    author: IUser;
    createdAt: string;
    date: string;
    id: string;
    updatedAt: string;
    url: string;
    thumbnailUrl: string;
}
