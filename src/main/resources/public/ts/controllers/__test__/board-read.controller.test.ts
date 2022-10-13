import * as angular from 'angular';
import 'angular-mocks';
import {boardReadController} from "../board-read.controller";
import {ng} from "../../models/__mocks__/entcore";
import {BoardsService, CardsService} from "../../services";
import {Card, CardForm} from "../../models";

describe("BoardReadController", () => {

    let boardReadControllerTest: any;
    let card: Card = new Card().build({
        id: "id",
        title: "title",
        description: "description",
        modificationDate: "modificationDate",
        caption: "caption",
        resourceId: "resourceId",
        resourceType: "resourceType",
        resourceUrl: "resourceUrl",
        ownerId: "ownerId",
        ownerName: "ownerName",
        creationDate: "creationDate",
        lastModifierId: "lastModifierId",
        lastModifierName: "lastModifierName",
        boardId: "boardId",
        parentId: "parentId",
        metadata: null
    });

    beforeEach(() => {
        const testApp = angular.module("app", []);
        let $controller, $rootScope, $sce;

        angular.mock.module("app");

        boardReadController;

        ng.initMockedModules(testApp);

        // Controller Injection
        angular.mock.inject((_$controller_, _$rootScope_, _$sce_) => {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $sce = _$sce_;
        });

        // Creates a new instance of scope
        let $scope = $rootScope.$new();

        // Fetching $location
        testApp.run(($rootScope, $location) => {
            $rootScope.location = $location;
        });

        boardReadControllerTest = $controller("BoardReadController", {
            $scope: $scope,
            $route: $rootScope,
            $location: $rootScope.location,
            $sce: $sce,
            boardsService: BoardsService,
            cardsService: CardsService
        });

        //boardReadControllerTest.$route.current.params.boardId = "boardId";

        boardReadControllerTest.$onInit();
    });

    it("test nextPage", (done) => {
        boardReadControllerTest.filter = {
            page: 0,
            count: 2,
            boardId: "boardId"
        };

        boardReadControllerTest.nextPage();

        expect(boardReadControllerTest.filter.page).toEqual(1);
        done();
    });

    it("test nextPage", (done) => {
        boardReadControllerTest.filter = {
            page: 1,
            count: 2,
            boardId: "boardId"
        };

        boardReadControllerTest.previousPage();

        expect(boardReadControllerTest.filter.page).toEqual(0);
        done();
    });

    it("test isLastPage", (done) => {
        boardReadControllerTest.filter = {
            page: 1,
            count: 2,
            boardId: "boardId"
        };

        expect(boardReadControllerTest.isLastPage()).toBe(true);
        done();
    });
});