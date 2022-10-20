export class CardsFilter {
    private _page: number;
    private _boardId: string;
    private _sortBy: string;
    private _isShared: boolean;
    private _isPublic: boolean;
    private _searchText: string;

    constructor() {
        this._page = 0;
        this._isShared = false;
        this._isPublic = false;
        this._sortBy = '';
        this._searchText = '';
    }

    get page(): number {
        return this._page;
    }

    set page(value: number) {
        this._page = value;
    }

    nextPage() {
        this._page++;
    }

    get searchText(): string {
        return this._searchText;
    }

    set searchText(value: string) {
        this._searchText = value;
    }

    get sortBy(): string {
        return this._sortBy;
    }

    set sortBy(value: string) {
        this._sortBy = value;
    }

    get isPublic(): boolean {
        return this._isPublic;
    }

    set isPublic(value: boolean) {
        this._isPublic = value;
    }

    get isShared(): boolean {
        return this._isShared;
    }

    set isShared(value: boolean) {
        this._isShared = value;
    }

    get boardId(): string {
        return this._boardId;
    }

    set boardId(value: string) {
        this._boardId = value;
    }
}