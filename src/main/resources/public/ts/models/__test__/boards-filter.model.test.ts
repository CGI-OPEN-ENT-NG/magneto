import {BoardsFilter} from "../boards-filter.model";

describe('BoardsFilterModel', () => {
   it ('test BoardsFilter initialization', done => {
         let filter = new BoardsFilter();
         expect(filter.page).toEqual(0);
         expect(filter.isTrash).toEqual(false);
         expect(filter.isPublic).toEqual(false);
         expect(filter.isMyBoards).toEqual(true);
         expect(filter.searchText).toEqual('');
         done();
   });

   it ('test BoardsFilter nextPage', done => {
            let filter = new BoardsFilter();
            filter.nextPage();
            expect(filter.page).toEqual(1);
            filter.nextPage();
            expect(filter.page).toEqual(2);
            done();
   });

    it ('test BoardsFilter isTrash/isPublic/isMyBoards', done => {
            let filter = new BoardsFilter();
            filter.isTrash = true;
            expect(filter.isTrash).toEqual(true);
            expect(filter.isPublic).toEqual(false);
            expect(filter.isMyBoards).toEqual(false);

            filter.isPublic = true;
            expect(filter.isTrash).toEqual(false);
            expect(filter.isPublic).toEqual(true);
            expect(filter.isMyBoards).toEqual(false);

            filter.isMyBoards = true;
            expect(filter.isTrash).toEqual(false);
            expect(filter.isPublic).toEqual(false);
            expect(filter.isMyBoards).toEqual(true);
            done();
    });
});