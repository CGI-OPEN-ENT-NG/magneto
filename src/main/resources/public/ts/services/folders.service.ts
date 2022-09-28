import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {Folder, IFolderResponse} from "../models";


export interface IFoldersService {
    getFolders(): Promise<Array<Folder>>;

    createFolder(title: string, parentId: string): Promise<AxiosResponse>;
}

export const foldersService: IFoldersService = {
    getFolders: async (): Promise<Array<Folder>> => {
        return http.get(`/magneto/folders`)
            .then((res: AxiosResponse) => res.data.map((folder: IFolderResponse) => new Folder().build(folder)));
    },

    createFolder: async (title: string, parentId: string): Promise<AxiosResponse> => {
        return http.post(`/magneto/folder`, {title: title, parentId: parentId});
    }
};

export const FoldersService = ng.service('FoldersService', (): IFoldersService => foldersService);