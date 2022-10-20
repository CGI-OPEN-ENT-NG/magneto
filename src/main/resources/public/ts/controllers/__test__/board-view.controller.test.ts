import * as angular from 'angular';
import 'angular-mocks';
import {boardViewController} from "../board-view.controller";
import {ng} from "../../models/__mocks__/entcore";
import {BoardsService, CardsService} from "../../services";
import {Card, CardForm} from "../../models";

describe("BoardViewController", () => {

    let boardViewControllerTest: any;
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

        boardViewController;

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

        boardViewControllerTest = $controller("BoardViewController", {
            $scope: $scope,
            $route: $rootScope,
            $location: $rootScope.location,
            $sce: $sce,
            boardsService: BoardsService,
            cardsService: CardsService
        });

        //boardViewControllerTest.$route.current.params.boardId = "boardId";

        boardViewControllerTest.$onInit();
    });

    it("test resetCards", (done) => {
        boardViewControllerTest.filter = {
            page: 1,
            boardId: "boardId"
        };
        boardViewControllerTest.cards = [{
            _id: "id",
            title: "title",
            description: "description",
            imageUrl: "imageUrl",
            modificationDate: "modificationDate"
        }];

        boardViewControllerTest.resetCards();

        expect(boardViewControllerTest.cards).toEqual([]);
        expect(boardViewControllerTest.filter.page).toEqual(0);
        done();
    });

    it("test openDeleteResourceLightbox", (done) => {
        boardViewControllerTest.displayDeleteCardLightbox = false;
        boardViewControllerTest.openDeleteResourceLightbox(card);
        expect(boardViewControllerTest.selectedCard).toEqual(card);
        expect(boardViewControllerTest.displayDeleteCardLightbox).toEqual(true);
        done();
    });

    it("test openPreviewResourceLightbox", (done) => {
        boardViewControllerTest.displayPreviewCardLightbox = false;
        boardViewControllerTest.openPreviewResourceLightbox(card);
        expect(boardViewControllerTest.selectedCard).toEqual(card);
        expect(boardViewControllerTest.displayPreviewCardLightbox).toEqual(true);
        done();
    });

    it("test openEditResourceLightbox", (done) => {
        boardViewControllerTest.cardForm = new CardForm();
        boardViewControllerTest.displayUpdateCardLightbox = false;
        boardViewControllerTest.displayCardLightbox = false;
        boardViewControllerTest.openEditResourceLightbox(card);
        expect(boardViewControllerTest.cardForm._id).toEqual(card.id);
        expect(boardViewControllerTest.cardForm.title).toEqual(card.title);
        expect(boardViewControllerTest.cardForm.description).toEqual(card.description);
        expect(boardViewControllerTest.cardForm.caption).toEqual(card.caption);
        expect(boardViewControllerTest.cardForm.resourceId).toEqual(card.resourceId);
        expect(boardViewControllerTest.cardForm.resourceType).toEqual(card.resourceType);
        expect(boardViewControllerTest.cardForm.resourceUrl).toEqual(card.resourceUrl);
        expect(boardViewControllerTest.cardForm.boardId).toEqual(card.boardId);
        expect(boardViewControllerTest.cardForm.sectionId).toEqual(0);
        expect(boardViewControllerTest.displayUpdateCardLightbox).toEqual(true);
        expect(boardViewControllerTest.displayCardLightbox).toEqual(true);
        done();
    });


});