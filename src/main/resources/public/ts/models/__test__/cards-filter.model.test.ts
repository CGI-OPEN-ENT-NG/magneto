import {CardsFilter} from "../cards-filter.model";

describe("CardsFilterModel", () => {
    it('test card filter initialization', done => {

        const cardFilter = new CardsFilter();

        expect(cardFilter.page).toEqual(0);
        expect(cardFilter.isShared).toEqual(false);
        expect(cardFilter.isPublic).toEqual(false);
        expect(cardFilter.sortBy).toEqual('');
        expect(cardFilter.searchText).toEqual('');

        done();
    })
});