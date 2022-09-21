import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {foldersService} from "../folders.service";
import {Folder} from "../../models";

describe('BoardsService', () => {
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

        mock.onGet(`/magneto/folders`).reply(200, data);

        foldersService.getFolders().then(res => {
            expect(res).toEqual(data.map((folder: any) => new Folder().build(folder)));
            done();
        });
    });

    it('returns data when createFolder is correctly called', done => {
        const mock = new MockAdapter(axios);
        const data = {
            response: true
        }

        let spy = jest.spyOn(axios, "post");
        mock.onPost(`/magneto/folder`).reply(200, data);
        foldersService.createFolder('title', 'parentId').then(res => {
            expect(res.data).toEqual(data);
            done();
        });
    });


});
