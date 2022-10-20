import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {Card, CardForm, Cards, ICardsBoardParamsRequest, ICardsParamsRequest} from "../models";


export interface ICardsService {

    getAllCardsCollection(params: ICardsParamsRequest): Promise<Cards>;

    getAllCardsByBoard(params: ICardsParamsRequest): Promise<Cards>;

    getCardById(params): Promise<Card>;

    createCard(params: CardForm): Promise<AxiosResponse>;

    updateCard(params: CardForm): Promise<AxiosResponse>;

    duplicateCard(params: ICardsBoardParamsRequest): Promise<AxiosResponse>;

    deleteCard(params: ICardsBoardParamsRequest): Promise<AxiosResponse>;

}

export const cardsService: ICardsService = {

    getAllCardsCollection: async (params: ICardsParamsRequest): Promise<Cards> => {
        let urlParams: string = `?boardId=${params.boardId}&searchText=${params.searchText}&sortBy=${params.sortBy}&isPublic=${params.isPublic}&isShared=${params.isShared}&page=${params.page}`;
        return http.get(`/magneto/cards/collection${urlParams}`)
            .then((res: AxiosResponse) => new Cards(res.data));
    },

    getAllCardsByBoard: async (params: ICardsParamsRequest): Promise<Cards> => {
        let urlParams: string = !!params.page ? `?page=${params.page}` : '';
        return http.get(`/magneto/cards/${params.boardId}${urlParams}`)
            .then((res: AxiosResponse) => new Cards(res.data));
    },

    getCardById: async (id: string): Promise<Card> => {
        return http.get(`/magneto/card/${id}`)
            .then((res: AxiosResponse) => new Card().build(res.data));
    },

    createCard: async (params: CardForm): Promise<AxiosResponse> => {
        return http.post(`/magneto/card`, params.toJSON());
    },

    updateCard: async (params: CardForm): Promise<AxiosResponse> => {
        return http.put(`/magneto/card/${params.id}`, params.toJSON());
    },

    duplicateCard: async (params: ICardsBoardParamsRequest): Promise<AxiosResponse> => {
        return http.post(`/magneto/card/duplicate`, {cardIds: params.cardIds, boardId: params.boardId});
    },

    deleteCard: async (params: ICardsBoardParamsRequest): Promise<AxiosResponse> => {
        return http.delete(`/magneto/cards/${params.boardId}`, {data : {cardIds: params.cardIds}});
    }
};

export const CardsService = ng.service('CardsService', (): ICardsService => cardsService);