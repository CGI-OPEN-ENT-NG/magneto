import {ng} from "entcore";
import {RootsConst} from "../../../core/constants/roots.const";
import {ILocationService, IScope, IWindowService} from "angular";

interface IViewModel extends ng.IController, ICardNotifyProps {
    doAction();
    onClickActionAnotherWay();

    // for link method
    onClickAction?(): void;
}

interface ICardNotifyProps {
    onClick?;
}

interface ICardNotifyScope extends IScope, ICardNotifyProps {
    vm: IViewModel;
}

class Controller implements IViewModel {


    constructor(private $scope: ICardNotifyScope,
                private $location:ILocationService,
                private $window: IWindowService,
                private $parse: any
                /*  inject service etc..just as we do in controller */)
    {}

    $onInit() {

    }

    $onDestroy() {

    }

    doAction(): void {
        console.log("u called my function which is doAction");
    }

    onClickActionAnotherWay(): void {
        // vm.doAction();
        console.log("hey i am notifying something as a child");
        this.$parse(this.$scope.vm.onClick())(55);
    }
}

function directive($parse) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}websocket-test/card-notify/card-notify.directive.html`,
        scope: {
            onClick: "&",
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope','$location','$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardNotifyScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.onClickAction = (): void => {
                vm.doAction();
                console.log("hey i am notifying something as a child");
                $parse($scope.vm.onClick())(55);
            }
        }
    }
}
export const cardNotify = ng.directive('cardNotify', directive)