import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {cardsService} from "../cards.service";
import {CardForm, ICardsBoardParamsRequest, ICardsParamsRequest} from "../../models";

describe('CardsService', () => {
    it('returns data when getAllCardsCollection is correctly called', done => {
        const mock = new MockAdapter(axios);

        const params: ICardsParamsRequest = {
            boardId: 'boardId',
            page: 0
        }

        const data = {
            page: 0,
            pageCount:  0,
            all: []
        }

        let urlParams: string = `?boardId=${params.boardId}&searchText=${params.searchText}&sortBy=${params.sortBy}&isPublic=${params.isPublic}&isShared=${params.isShared}&page=${params.page}`;
        mock.onGet(`/magneto/cards/collection${urlParams}`)
            .reply(200, data);


        cardsService.getAllCardsCollection(params).then(res => {
            expect(res).toEqual(data);
            done();
        });
    });

    it('returns data when getAllCardsByBoard is correctly called', done => {
        const mock = new MockAdapter(axios);

        const params: ICardsParamsRequest = {
            boardId: 'boardId'
        }

        const data = {
                page: 0,
                pageCount:  0,
                all: []
        }

        mock.onGet(`/magneto/cards/boardId`)
            .reply(200, data);


        cardsService.getAllCardsByBoard(params).then(res => {
            expect(res).toEqual(data);
            done();
        });
    });

    it('returns data when createCard is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        let form = new CardForm();


        let spy = jest.spyOn(axios, "post");
        mock.onPost(`/magneto/card`).reply(200, data);
        cardsService.createCard(form).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when updateCard is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        let form = new CardForm();
        form.id = 'id';

        let spy = jest.spyOn(axios, "put");
        mock.onPut(`/magneto/card/id`, form.toJSON()).reply(200, data);
        cardsService.updateCard(form).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when deleteCard is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        const params: ICardsBoardParamsRequest = {
            boardId: 'boardId',
            cardIds: ["cardId"]
        }

        mock.onDelete(`/magneto/cards/${params.boardId}`, {data: {cardIds: params.cardIds}})
            .reply(200, data);
        cardsService.deleteCard(params).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when duplicateCard is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            number: 0
        }

        const params: ICardsBoardParamsRequest = {
            boardId: 'boardId',
            cardIds: ["cardId"]
        }

        let spy = jest.spyOn(axios, "post");
        mock.onPost(`/magneto/card/duplicate`)
            .reply(200, data);
        cardsService.duplicateCard(params).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

});
