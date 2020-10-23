import { IUser } from './user';
import { IMedia } from './media';

export interface IArticle {
    author: IUser;
    categories: IArticleCategory[];
    content: string;
    createdAt: string;
    focused: boolean;
    fullscreenImage: IMedia;
    id: string;
    image: IMedia;
    summary: string;
    title: string;
    updatedAt: string;
    video: IMedia;
}

export interface IArticleCategory {
    color: string;
    id: string;
    title: string;
}
