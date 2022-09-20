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
    id?: string;
    title: string;
    description: string;
    imageUrl: string;
}

export class BoardForm {
    private _id: string;
    private _title: string;
    private _description: string;
    private _imageUrl: string;

    constructor() {
        this._id = '';
        this._title = '';
        this._description = '';
        this._imageUrl = '';
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    set imageUrl(value: string) {
        this._imageUrl = value;
    }

    isValid(): boolean {
        return this.title !== null && this.title !== '' &&
            this.description != null && this.description !== '' &&
            this.imageUrl != null && this.imageUrl !== ''
    }

    toJSON(): IBoardPayload {

        let payload : IBoardPayload = {
            title: this.title,
            description: this.description,
            imageUrl: this.imageUrl
        } ;

        if (this.id && this.id != '') payload.id = this.id;

        return payload;
    }
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
