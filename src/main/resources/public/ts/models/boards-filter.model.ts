export class BoardsFilter {
    private _page: number;
    private _isTrash: boolean;
    private _isPublic: boolean;
    private _isMyBoards: boolean;
    private _searchText: string;

    constructor() {
        this._page = 0;
        this._isTrash = false;
        this._isPublic = false;
        this._isMyBoards = true;
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

    get isTrash(): boolean {
        return this._isTrash;
    }

    set isTrash(value: boolean) {
        if (value) {
            this._isPublic = false;
            this._isMyBoards = false;
        }
        this._isTrash = value;
    }

    get isPublic(): boolean {
        return this._isPublic;
    }

    set isPublic(value: boolean) {
        if (value) {
            this._isTrash = false;
            this._isMyBoards = false;
        }
        this._isPublic = value;
    }

    get isMyBoards(): boolean {
        return this._isMyBoards;
    }

    set isMyBoards(value: boolean) {
        if (value) {
            this._isTrash = false;
            this._isPublic = false;
        }
        this._isMyBoards = value;
    }

    get searchText(): string {
        return this._searchText;
    }

    set searchText(value: string) {
        this._searchText = value;
    }
}