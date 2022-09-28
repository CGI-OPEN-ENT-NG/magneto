import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {foldersService} from "../folders.service";
import {Folder} from "../../models";

describe('FoldersService', () => {
    it('returns data when getFolders is correctly called', done => {
        const mock = new MockAdapter(axios);

        const data = [
            {
                _id: 'id1',
                title: 'title1',
                parentId: 'parentId1',
                ownerId: 'ownerId1'
            }
        ];

        let spy = jest.spyOn(axios, "get");
        mock.onGet(`/magneto/folders?isDeleted=false`).reply(200, data);

        foldersService.getFolders(false).then(res => {
            expect(res).toEqual(data.map((folder: any) => new Folder().build(folder)));
            done();
        });
    });

    it('returns data when createFolder is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        mock.onPost(`/magneto/folder`).reply(200, data);
        foldersService.createFolder('title', 'parentId').then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when preDeleteFolders is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        mock.onPut(`/magneto/folders/predelete`).reply(200, data);
        foldersService.preDeleteFolders(['id1', 'id2']).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when restorePreDeleteFolders is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        mock.onPut(`/magneto/folders/restore`).reply(200, data);
        foldersService.restorePreDeleteFolders(['id1', 'id2']).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when deleteFolders is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        mock.onDelete(`/magneto/folders`).reply(200, data);
        foldersService.deleteFolders(['id1', 'id2']).then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });

    it('returns data when updateFolder is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        mock.onPut(`/magneto/folder/id`).reply(200, data);
        foldersService.updateFolder('id', 'title').then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });


});
