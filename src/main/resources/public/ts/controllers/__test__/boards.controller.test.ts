import * as angular from 'angular';
import 'angular-mocks';
import {boardsController} from "../boards.controller";
import {ng} from "../../models/__mocks__/entcore";
import {BoardsService} from "../../services";
import {BoardsFilter} from "../../models/boards-filter.model";
import {FOLDER_TYPE} from "../../core/enums/folder-type.enum";
import {Folder} from "../../models";

describe('BoardsController', () => {

    let boardsControllerTest: any;


    beforeEach(() => {
        const testApp = angular.module('app', []);
        let $controller, $rootScope, $sce;

        angular.mock.module('app');

        boardsController;

        ng.initMockedModules(testApp);

        // Controller Injection
        angular.mock.inject((_$controller_, _$rootScope_) => {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $controller = _$controller_;
            $rootScope = _$rootScope_;
        });

        // Creates a new instance of scope
        let $scope = $rootScope.$new();

        // Fetching $location
        testApp.run(($rootScope, $location) => {
            $rootScope.location = $location;
        });

        boardsControllerTest = $controller('BoardsController', {
            $scope: $scope,
            $location: $rootScope.location,
            boardsService: BoardsService
        });

        boardsControllerTest.$onInit();
    });


    it('test resetBoards', (done) => {
        boardsControllerTest.filter = new BoardsFilter();
        boardsControllerTest.filter.page = 1;
        boardsControllerTest.filter.searchText = 'searchText';

        boardsControllerTest.boards = [{
            _id: 'id',
            title: 'title',
            imageUrl: 'imageUrl',
            nbCards: 0,
            modificationDate: 'modificationDate',
            creationDate: 'creationDate'
        }];

        boardsControllerTest.resetBoards();

        expect(boardsControllerTest.filter.page).toEqual(0);
        expect(boardsControllerTest.filter.searchText).toEqual('');
        expect(boardsControllerTest.boards).toEqual([]);

        done();
    });

    it('test openCreateForm', (done) => {
        boardsControllerTest.displayBoardLightbox = false;
        boardsControllerTest.openCreateForm();
        expect(boardsControllerTest.displayBoardLightbox).toBe(true);
        done();
    });

    it('test openDeleteForm', (done) => {
        boardsControllerTest.displayDeleteBoardLightbox = false;
        boardsControllerTest.openDeleteForm();
        expect(boardsControllerTest.displayDeleteBoardLightbox).toBe(true);
        done();
    });

    it('test moveBoards', (done) => {
        boardsControllerTest.displayMoveBoardLightbox = false;
        boardsControllerTest.moveBoards();
        expect(boardsControllerTest.displayMoveBoardLightbox).toBe(true);
        done();
    });

    it('test openRenameLightbox', (done) => {
        boardsControllerTest.displayUpdateFolderLightbox = false;
        boardsControllerTest.displayFolderLightbox = false;
        boardsControllerTest.openRenameFolderForm();
        expect(boardsControllerTest.displayUpdateFolderLightbox).toBe(true);
        expect(boardsControllerTest.displayFolderLightbox).toBe(true);
        done();
    });

    it('test initTrees', (done) => {

        const folder1 = new Folder().build({
            _id: 'id1',
            title: 'title1',
            parentId: FOLDER_TYPE.MY_BOARDS,
            ownerId: 'ownerId'
        });

        const folder2 = new Folder().build({
            _id: 'id2',
            title: 'title2',
            parentId: 'id1',
            ownerId: 'ownerId'
        });

        const deletedFolder1 = new Folder().build({
            _id: FOLDER_TYPE.DELETED_BOARDS,
            title: 'title1',
            parentId: 'id1',
            ownerId: 'ownerId'
        });


        boardsControllerTest.folderNavTrees = [];
        boardsControllerTest.folderMoveNavTrees = [];

        boardsControllerTest.folders = [];
        boardsControllerTest.folders.push(folder1);
        boardsControllerTest.folders.push(folder2);

        boardsControllerTest.deletedFolders = [];
        boardsControllerTest.deletedFolders.push(deletedFolder1);

        boardsControllerTest.initTrees();
        expect(boardsControllerTest.folderNavTrees.length).toBe(3);
        expect(boardsControllerTest.folderNavTrees[0].id).toBe(FOLDER_TYPE.MY_BOARDS);
        expect(boardsControllerTest.folderNavTrees[0].children.length).toBe(1);
        expect(boardsControllerTest.folderNavTrees[1].id).toBe(FOLDER_TYPE.PUBLIC_BOARDS);
        expect(boardsControllerTest.folderNavTrees[2].id).toBe(FOLDER_TYPE.DELETED_BOARDS);
        expect(boardsControllerTest.folderMoveNavTrees.length).toBe(1);
        expect(boardsControllerTest.folderMoveNavTrees[0].id).toBe(FOLDER_TYPE.MY_BOARDS);
        expect(boardsControllerTest.folderMoveNavTrees[0].children.length).toBe(1);
        done();
    });
});