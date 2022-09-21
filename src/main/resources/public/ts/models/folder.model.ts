export interface IFolderResponse {
    _id: string;
    title: string;
    parentId: string;
    ownerId: string;
}

export class Folder {
    private _id: string;
    private _title: string;
    private _parentId: string;
    private _ownerId: string;

    build(data: IFolderResponse): Folder {
        this._id = data._id;
        this._title = data.title;
        this._parentId = data.parentId;
        this._ownerId = data.ownerId;
        return this;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get parentId(): string {
        return this._parentId;
    }

    set parentId(value: string) {
        this._parentId = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get ownerId(): string {
        return this._ownerId;
    }

    set ownerId(value: string) {
        this._ownerId = value;
    }
}