import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {BoardForm, Boards, IBoardsParamsRequest} from "../models";

export interface IBoardsService {
    getAllBoards(params: IBoardsParamsRequest): Promise<Boards>;

    getAllBoardsEditable(): Promise<Boards>;

    getBoardsByIds(boardIds: Array<string>): Promise<Boards>;

    createBoard(params: BoardForm): Promise<AxiosResponse>;

    updateBoard(boardId: string, params: BoardForm): Promise<AxiosResponse>;

    preDeleteBoards(boardIds: Array<string>): Promise<AxiosResponse>;

    restorePreDeleteBoards(boardIds: Array<string>): Promise<AxiosResponse>;

    deleteBoards(boardIds: Array<string>): Promise<AxiosResponse>;

    duplicateBoard(boardId: string): Promise<AxiosResponse>;

    moveBoardsToFolder(boardIds: Array<string>, folderId: string): Promise<AxiosResponse>;
}

export const boardsService: IBoardsService = {
    getAllBoards: async (params: IBoardsParamsRequest): Promise<Boards> => {
        let urlParams: string = `?isPublic=${params.isPublic}&isShared=${params.isShared}` +
            `&isDeleted=${params.isDeleted}&sortBy=${params.sortBy}`;

        if (params.folderId) {
            urlParams += `&folderId=${params.folderId}`;
        }

        if (params.page != null) {
            urlParams += `&page=${params.page}`;
        }

        if (params.searchText !== undefined && params.searchText !== null && params.searchText !== '') {
            urlParams += `&searchText=${params.searchText}`;
        }
        return http.get(`/magneto/boards${urlParams}`)
            .then((res: AxiosResponse) => new Boards(res.data));
    },

    getBoardsByIds: async (boardIds: Array<string>): Promise<Boards> => {
        return http.post(`/magneto/boards`, {boardIds: boardIds})
            .then((res: AxiosResponse) => new Boards(res.data));
    },

    getAllBoardsEditable: async (): Promise<Boards> => {
        return http.get(`/magneto/boards/editable`)
            .then((res: AxiosResponse) => new Boards(res.data));
    },

    createBoard: async (params: BoardForm): Promise<AxiosResponse> => {
        return http.post(`/magneto/board`, params.toJSON());
    },

    updateBoard: async (boardId: string, params: BoardForm): Promise<AxiosResponse> => {
        return http.put(`/magneto/board/${boardId}`, params.toJSON());
    },

    preDeleteBoards: async (boardIds: Array<string>): Promise<AxiosResponse> => {
        return http.put(`/magneto/boards/predelete`, {boardIds: boardIds});
    },

    restorePreDeleteBoards: async (boardIds: Array<string>): Promise<AxiosResponse> => {
        return http.put(`/magneto/boards/restore`, {boardIds: boardIds});
    },

    deleteBoards: async (boardIds: Array<string>): Promise<AxiosResponse> => {
        return http.delete(`/magneto/boards`, {data: {boardIds: boardIds}});
    },

    duplicateBoard: async (boardId: string): Promise<AxiosResponse> => {
        return http.put(`/magneto/board/duplicate/${boardId}`);
    },

    moveBoardsToFolder: async (boardIds: Array<string>, folderId: string): Promise<AxiosResponse> => {
        return http.put(`/magneto/boards/folder/${folderId}`, {boardIds: boardIds});
    }
};

export const BoardsService = ng.service('BoardsService', (): IBoardsService => boardsService);