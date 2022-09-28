import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {Folder, IFolderResponse} from "../models";


export interface IFoldersService {
    getFolders(isDeleted: boolean): Promise<Array<Folder>>;

    createFolder(title: string, parentId: string): Promise<AxiosResponse>;

    preDeleteFolders(folderIds: Array<string>): Promise<AxiosResponse>;

    restorePreDeleteFolders(folderIds: Array<string>): Promise<AxiosResponse>;

    deleteFolders(folderIds: Array<string>): Promise<AxiosResponse>;

    updateFolder(folderId: string, title: string): Promise<AxiosResponse>;
}

export const foldersService: IFoldersService = {
    getFolders: async (isDeleted: boolean): Promise<Array<Folder>> => {
        let urlParams: string = `?isDeleted=${isDeleted}`;
        return http.get(`/magneto/folders${urlParams}`)
            .then((res: AxiosResponse) => res.data.map((folder: IFolderResponse) => new Folder().build(folder)));
    },

    createFolder: async (title: string, parentId: string): Promise<AxiosResponse> => {
        return http.post(`/magneto/folder`, {title: title, parentId: parentId});
    },

    preDeleteFolders: async (folderIds: Array<string>): Promise<AxiosResponse> => {
        return http.put(`/magneto/folders/predelete`, {folderIds: folderIds});
    },

    restorePreDeleteFolders: async (folderIds: Array<string>): Promise<AxiosResponse> => {
        return http.put(`/magneto/folders/restore`, {folderIds: folderIds});
    },

    deleteFolders: async (folderIds: Array<string>): Promise<AxiosResponse> => {
        return http.delete(`/magneto/folders`, {data: {folderIds: folderIds}});
    },

    updateFolder: async (folderId: string, title: string): Promise<AxiosResponse> => {
        return http.put(`/magneto/folder/${folderId}`, {title: title});
    }
};

export const FoldersService = ng.service('FoldersService', (): IFoldersService => foldersService);