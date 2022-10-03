import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {CardForm, Cards, ICardsParamsRequest} from "../models";


export interface ICardsService {
    getAllCards(params: ICardsParamsRequest): Promise<Cards>;

    createCard(params: CardForm): Promise<AxiosResponse>;

    updateCard(params: CardForm): Promise<AxiosResponse>;

    deleteCard(boardId: string, cardIds: Array<string>): Promise<AxiosResponse>;

}

export const cardsService: ICardsService = {
    getAllCards: async (params: ICardsParamsRequest): Promise<Cards> => {
        let urlParams: string = `?page=${params.page}`;
        return http.get(`/magneto/cards/${params.boardId}${urlParams}`)
            .then((res: AxiosResponse) => new Cards(res.data));
    },

    createCard: async (params: CardForm): Promise<AxiosResponse> => {
        return http.post(`/magneto/card`, params.toJSON());
    },

    updateCard: async (params: CardForm): Promise<AxiosResponse> => {
        return http.put(`/magneto/card/${params.id}`, params.toJSON());
    },

    deleteCard: async (boardId: string, cardIds: Array<string>): Promise<AxiosResponse> => {
        return http.delete(`/magneto/cards/${boardId}`, {data: {cardIds: cardIds}});
    }
};

export const CardsService = ng.service('CardsService', (): ICardsService => cardsService);