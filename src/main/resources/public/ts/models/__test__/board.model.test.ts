import {Board, BoardForm, Boards} from "../board.model";

describe('BoardModel', () => {
   it('test Board initialization', done => {
       const boardResponse = {
           _id: 'id',
           title: 'title',
           imageUrl: 'imageUrl',
           description: 'description',
           nbCards: 0,
           modificationDate: 'modificationDate',
           creationDate: 'creationDate'
       }

        const board = new Board().build(boardResponse);

        expect(board.id).toEqual(boardResponse._id);
        expect(board.title).toEqual(boardResponse.title);
        expect(board.imageUrl).toEqual(boardResponse.imageUrl);
        expect(board.description).toEqual(boardResponse.description);
        expect(board.nbCards).toEqual(boardResponse.nbCards);
        expect(board.modificationDate).toEqual(boardResponse.modificationDate);
        expect(board.creationDate).toEqual(boardResponse.creationDate);
        done();
   });

   it('test Boards initialization', done => {
       const boardsResponse = {
           all: [
               {
                   _id: 'id',
                   title: 'title',
                   imageUrl: 'imageUrl',
                   description: 'description',
                   nbCards: 0,
                   modificationDate: 'modificationDate',
                   creationDate: 'creationDate'
               }
           ],
           page: 1,
           pageCount: 1
       }

       const boards = new Boards(boardsResponse);

       expect(boards.all.length).toEqual(1);
       expect(boards.page).toEqual(1);
       expect(boards.pageCount).toEqual(1);
       done();
   });

    it('test BordForm initialization', done => {
        let form = new BoardForm();
        expect(form.id).toEqual('');
        expect(form.title).toEqual('');
        expect(form.description).toEqual('');
        expect(form.imageUrl).toEqual('');
        done();
    });

    it('test boardForm isValid', done => {
        let form = new BoardForm();
        expect(form.isValid()).toEqual(false);
        form.title = 'title';
        form.description = 'description';
        form.imageUrl = 'imageUrl';
        expect(form.isValid()).toEqual(true);
        done();
    });

    it('test boardForm toJSON', done => {
        const formJSON1 = {
            title: 'title',
            description: 'description',
            imageUrl: 'imageUrl',
            folderId: null
        }

        const formJSON2 = {
            id: 'id',
            title: 'title',
            description: 'description',
            imageUrl: 'imageUrl',
            folderId: null
        }

        let form = new BoardForm();
        form.title = 'title';
        form.description = 'description';
        form.imageUrl = 'imageUrl';
        expect(form.toJSON()).toEqual(formJSON1);
        form.id = 'id';
        expect(form.toJSON()).toEqual(formJSON2);
        done();
    });
});