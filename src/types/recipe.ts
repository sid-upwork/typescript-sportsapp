import { IMedia } from './media';
import { IArticle } from './article';

export interface IRecipe extends IArticle {
    calories: number;
    carbs: number;
    content: string;
    cookTime: number;
    fat: number;
    id: string;
    image: IMedia;
    ingredients: IRecipeIngredient[];
    preparationTime: number;
    proteins: number;
    servings: number;
    summary: string;
    tags: IRecipeTag[];
    title: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface IRecipeIngredient {
    id: string;
    name: string;
    image: string;
    quantity: number;
    type: string;
    volume: number;
    weight: number;
}

export interface IRecipeTag {
    color: string;
    id: string;
    title: string;
}
