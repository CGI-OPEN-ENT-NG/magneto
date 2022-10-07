import {ng, template} from 'entcore';
import {IScope, IWindowService} from "angular";

declare let window: any;

interface IViewModel extends ng.IController{
}

interface IMainscope extends IScope {
	vm: IViewModel;
}

class Controller implements IViewModel {

	private eventBus: any;

	constructor(private $scope: IMainscope,
				private $route: any,
				private $window: IWindowService) {
		this.$scope.vm = this;
	}

	$onInit() {

		this.$route({
			boards: () => {
				template.open('main', `boards`);
			}
		});
	}

	$onDestroy() {
	}
}

export const mainController = ng.controller('MainController',
	['$scope', 'route', '$window', Controller]);
