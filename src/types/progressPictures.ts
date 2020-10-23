import { IUser } from './user';

export interface IProgressPicture {
    author: IUser;
    createdAt: string;
    date: string;
    id: string;
    updatedAt: string;
    url: string;
    thumbnailUrl: string;
}
