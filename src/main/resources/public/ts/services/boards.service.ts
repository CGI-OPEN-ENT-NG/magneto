import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {IBoardsParamsRequest, IBoardPayload, Boards} from "../models/board.model";


export interface IBoardsService {
    getAllBoards(params: IBoardsParamsRequest): Promise<Boards>;

    createBoard(params: IBoardPayload): Promise<AxiosResponse>;
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

    createBoard: async (params: IBoardPayload): Promise<AxiosResponse> => {
        return http.post(`/magneto/board`, params);
    }
};

export const BoardsService = ng.service('BoardsService', (): IBoardsService => boardsService);