export interface IBoardItemResponse {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    nbCards: number;
    modificationDate: string;
    creationDate: string;
}

export interface IBoardsResponse {
    page: number;
    pageCount: number;
    all: Array<IBoardItemResponse>;
}

export interface IBoardsParamsRequest {
    folderId: string;
    isPublic: boolean;
    isShared: boolean;
    isDeleted: boolean;
    searchText: string;
    sortBy: string;
    page: number;
}

export interface IBoardPayload {
    title: string;
    description: string;
    imageUrl: string;
}

export interface IBoardCategoriesParam {
    isPublic: boolean;
    isTrash: boolean;
}

export class Board {
    private _id: string;
    private _title: string;
    private _imageUrl: string;
    private _description: string;
    private _nbCards: number;
    private _modificationDate: string;
    private _creationDate: string;

    build(date: IBoardItemResponse): Board {
        this._id = date._id;
        this._title = date.title;
        this._imageUrl = date.imageUrl;
        this._description = date.description;
        this._nbCards = date.nbCards;
        this._modificationDate = date.modificationDate;
        this._creationDate = date.creationDate;
        return this;
    }

    get id(): string {
        return this._id;
    }

    get title(): string {
        return this._title;
    }

    get description(): string {
        return this._description;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get nbCards(): number {
        return this._nbCards;
    }

    get modificationDate(): string {
        return this._modificationDate;
    }

    get creationDate(): string {
        return this._creationDate;
    }
}

export class Boards {
    all: Array<Board>;
    page: number;
    pageCount: number;

    constructor(data: IBoardsResponse) {
        this.all = data.all.map((board: IBoardItemResponse) => new Board().build(board));
        this.page = data.page;
        this.pageCount = data.pageCount;
    }
}
