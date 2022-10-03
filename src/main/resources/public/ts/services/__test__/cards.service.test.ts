import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {cardsService} from "../cards.service";
import {CardForm, ICardsParamsRequest} from "../../models";

describe('CardsService', () => {
    it('returns data when getAllCards is correctly called', done => {
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

        mock.onGet(`/magneto/cards/${params.boardId}?page=${params.page}`)
            .reply(200, data);


        cardsService.getAllCards(params).then(res => {
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

        mock.onDelete(`/magneto/cards/boardId`, {data: {cardIds: ['cardId']}})
            .reply(200, data);
        cardsService.deleteCard('boardId', ["cardId"]).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

});
