import {FolderTreeNavItem} from "../folder-tree.model";
import {Folder} from "../folder.model";

describe('FolderTreeModel', () => {
    it('test FolderTree initialization', done => {
        const folderResponse = new Folder().build({
            _id: 'id',
            title: 'title',
            parentId: 'parentId',
            ownerId: 'ownerId'
        });

        const folderChildren = [];
        folderChildren.push(new Folder().build({
            _id: 'id1',
            title: 'title1',
            parentId: 'id',
            ownerId: 'ownerId'
        }));

        folderChildren.push(new Folder().build({
            _id: 'id2',
            title: 'title2',
            parentId: 'id1',
            ownerId: 'ownerId'
        }));


        const folderTree = new FolderTreeNavItem(folderResponse, 'iconClass')
            .buildFolders(folderChildren);


        expect(folderTree.id).toEqual(folderResponse.id);
        expect(folderTree.name).toEqual(folderResponse.title);
        expect(folderTree.parentId).toEqual(folderResponse.parentId);
        expect(folderTree.iconClass).toEqual('iconClass');
        expect(folderTree.children.length).toEqual(1);
        expect(folderTree.children[0].id).toEqual(folderChildren[0].id);
        expect(folderTree.children[0].name).toEqual(folderChildren[0].title);
        expect(folderTree.children[0].parentId).toEqual(folderChildren[0].parentId);
        expect(folderTree.children[0].children.length).toEqual(1);
        expect(folderTree.children[0].children[0].id).toEqual(folderChildren[1].id);
        expect(folderTree.children[0].children[0].name).toEqual(folderChildren[1].title);
        expect(folderTree.children[0].children[0].parentId).toEqual(folderChildren[1].parentId);
        expect(folderTree.children[0].children[0].children.length).toEqual(0);
        done();
   });
});