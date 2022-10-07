import {ng} from "entcore";
import {IScope} from "angular";
import {ICardsService} from "../services";
import {EventBusService} from "../shared/event-bus-service/event-bus-sockjs.service";
import * as SockJS from "sockjs-client";

interface IViewModel extends ng.IController {
}

interface IBoardViewScope extends IScope {
    vm: IViewModel;
}

class Controller implements IViewModel {
    private eventBusService: EventBusService;
    constructor(private $scope: IBoardViewScope,
                private $route: any,
                private cardsService: ICardsService) {
        this.$scope.vm = this;
    }

    $onInit() {

    }

    $onDestroy() {
    }
}

export const boardViewController = ng.controller('BoardViewController',
    ['$scope', 'route', 'CardsService', Controller]);