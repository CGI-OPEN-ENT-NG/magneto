import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {DateUtils} from "../../utils/date.utils";
import {I18nUtils} from "../../utils/i18n.utils";

interface IViewModel extends ng.IController, IBoardDateProps {
    getDateText(): string;
}

interface IBoardDateProps {
    date: string;
}

interface IBoardDateScope extends IScope, IBoardDateProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    date: string;

    constructor(private $scope: IBoardDateScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
    }

    getDateText = (): string => {
        return I18nUtils.getWithParams("magneto.board.saved.at", [
            DateUtils.format(this.date, DateUtils.FORMAT["DAY-MONTH-HALFYEAR"]),
            DateUtils.format(this.date, DateUtils.FORMAT["HOUR-MIN"])
        ]);
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/board-date/board-date.html`,
        scope: {
            date: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardDateScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const boardDate = ng.directive('boardDate', directive)