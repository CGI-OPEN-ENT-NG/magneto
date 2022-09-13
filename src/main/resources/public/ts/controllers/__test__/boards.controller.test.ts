import * as angular from 'angular';
import 'angular-mocks';
import {boardsController} from "../boards.controller";
import {ng} from "../../models/__mocks__/entcore";
import {BoardsService} from "../../services";


describe('BoardsController', () => {

    let boardsControllerTest: any;


    beforeEach(() => {
        const testApp = angular.module('app', []);
        let $controller, $rootScope;

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
            boardsService: BoardsService
        });

        boardsControllerTest.$onInit();
    });


    it('test resetBoards', (done) => {
        boardsControllerTest.filter = {
            page: 1,
            searchText: 'test',
        }

        boardsControllerTest.boards = [{
            _id: 'id',
            title: 'title',
            imageUrl: 'imageUrl',
            nbCards: 0,
            modificationDate: 'modificationDate',
            creationDate: 'creationDate'
        }];

        boardsControllerTest.resetBoards();

        expect(boardsControllerTest.filter).toEqual({
            page: 0,
            searchText: ''
        });

        expect(boardsControllerTest.boards).toEqual([]);

        done();
    });
});