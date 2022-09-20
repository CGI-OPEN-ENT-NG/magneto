import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {IBoardsParamsRequest, IBoardPayload, Boards, BoardForm} from "../models/board.model";

export interface IBoardsService {
    getAllBoards(params: IBoardsParamsRequest): Promise<Boards>;

    createBoard(params: BoardForm): Promise<AxiosResponse>;

    updateBoard(boardId: string, params: BoardForm): Promise<AxiosResponse>;

    preDeleteBoards(boardIds: Array<string>): Promise<AxiosResponse>;

    restorePreDeleteBoards(boardIds: Array<string>): Promise<AxiosResponse>;

    deleteBoards(boardIds: Array<string>): Promise<AxiosResponse>;
}

export const boardsService: IBoardsService = {
    getAllBoards: async (params: IBoardsParamsRequest): Promise<Boards> => {
        let urlParams: string = `?isPublic=${params.isPublic}&isShared=${params.isShared}` +
            `&isDeleted=${params.isDeleted}&sortBy=${params.sortBy}&page=${params.page}`;

        if (params.folderId) {
            urlParams += `&folderId=${params.folderId}`;
        }

        if (params.searchText !== undefined && params.searchText !== null && params.searchText !== '') {
            urlParams += `&searchText=${params.searchText}`;
        }
        return http.get(`/magneto/boards${urlParams}`)
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
    }
};

export const BoardsService = ng.service('BoardsService', (): IBoardsService => boardsService);