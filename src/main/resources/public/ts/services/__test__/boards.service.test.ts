import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {boardsService} from "../boards.service";
import {BoardForm, IBoardsParamsRequest} from "../../models";

describe('BoardsService', () => {
    it('returns data when getAllboards is correctly called', done => {
        const mock = new MockAdapter(axios);

        const params: IBoardsParamsRequest = {
            isPublic: true,
            isShared: false,
            isDeleted: false,
            sortBy: 'modificationDate',
            page: 0,
            folderId: 'folderId',
            searchText: 'searchText'
        }

        const data = {
            page: 0,
            pageCount:  0,
            all: []
        }

        let spy = jest.spyOn(axios, "get");
        mock.onGet(`/magneto/boards?isPublic=${params.isPublic}&isShared=${params.isShared}&isDeleted=${params.isDeleted}` +
        `&sortBy=${params.sortBy}&page=${params.page}&folderId=${params.folderId}&searchText=${params.searchText}`)
            .reply(200, data);

        boardsService.getAllBoards(params).then(res => {
                expect(res).toEqual(data);
                done();
            });
    });

    it('returns data when createBoard is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        let form = new BoardForm();
        form.title = 'title';
        form.description = 'description';
        form.imageUrl = 'imageUrl';

        let spy = jest.spyOn(axios, "post");
        mock.onPost(`/magneto/board`).reply(200, data);
        boardsService.createBoard(form).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when preDeleteBoards is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        mock.onPut(`/magneto/boards/predelete`, {boardIds: ['boardId']})
            .reply(200, data);

        boardsService.preDeleteBoards(['boardId']).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when restorePreDeleteBoards is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        mock.onPut(`/magneto/boards/restore`, {boardIds: ['boardId']})
            .reply(200, data);

        boardsService.restorePreDeleteBoards(['boardId']).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when deleteBoards is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        mock.onDelete(`/magneto/boards`, {data: {boardIds: ['boardId']}})
            .reply(200, data);

        boardsService.deleteBoards(['boardId']).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when updateBoard is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        const form = new BoardForm();
        form.title = 'title';
        form.description = 'description';
        form.imageUrl = 'imageUrl';

        mock.onPut(`/magneto/board/boardId`, form.toJSON())
            .reply(200, data);

        boardsService.updateBoard('boardId', form).then(res => {
            expect(res.data).toEqual(data);
            done();
        });

    });

    it('returns date when moveBoardsToFolder is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        mock.onPut(`/magneto/boards/folder/folderId1`, {boardIds: ['boardId']})
            .reply(200, data);

        boardsService.moveBoardsToFolder(['boardId'], 'folderId1').then(res => {
            expect(res.data).toEqual(data);
            done();
        });

    });

});
