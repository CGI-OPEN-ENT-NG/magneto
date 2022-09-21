import {Folder} from "../folder.model";

describe('FolderModel', () => {
   it('test Folder initialization', done => {
         const folderResponse = {
              _id: 'id',
              title: 'title',
              parentId: 'parentId',
              ownerId: 'ownerId'
         }

          const folder = new Folder().build(folderResponse);

          expect(folder.id).toEqual(folderResponse._id);
          expect(folder.title).toEqual(folderResponse.title);
          expect(folder.parentId).toEqual(folderResponse.parentId);
          expect(folder.ownerId).toEqual(folderResponse.ownerId);
          done();
   });
});