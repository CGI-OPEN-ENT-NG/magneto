import {ng} from 'entcore';
import {RootsConst} from "../../core/constants/roots.const";

export const Loader = ng.directive('loader', () => {
    return {
        restrict: 'E',
        scope: {
            title: '=',
            minHeight: '='
        },
        templateUrl: `${RootsConst.directive}loader/loader.html`
    };
});