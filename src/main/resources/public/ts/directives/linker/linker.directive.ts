import {appPrefix, Behaviours, idiom, ng} from "entcore";
import {IParseService, IScope} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {safeApply} from "../../utils/safe-apply.utils";
import {IApp, IAppBehaviour, ILinkerParams, ILinkerSearch, IResource} from "../../models/linker.model";
import {linkerService} from "../../services/linker.service";


interface IViewModel extends ng.IController, ILinkerProps {

    display: boolean;
    externalLink?: boolean | string;
    searching: boolean;
    apps: IApp[];
    search: ILinkerSearch;
    params: ILinkerParams;
    resource: IResource;
    resources?: IResource[];

    loadApplicationResources?(): void;

    searchApplication?(): void;

    getApplications(): Promise<void>;

    resetLinker(): void;

    applyResource(resource: IResource): void;

    closeForm(): void;

    addResource?(): any
}

interface ILinkerProps {
    display: boolean;
}

interface ILinkerScope extends IScope, ILinkerProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    externalLink?: boolean | string;
    searching: boolean;
    apps: IApp[];
    search: ILinkerSearch;
    params: ILinkerParams;
    resource: IResource;
    resources?: IResource[];

    addResource?(): any


    constructor(private $scope: ILinkerScope) {

    }

    async $onInit() {
        await this.getApplications();
        this.resetLinker();

        this.display = false;

        if (appPrefix) {
            this.apps = this.apps.map((app: IApp) => {
                app.displayName = idiom.translate(app.displayName);
                return app;
            });

            const currentApp = this.apps.find((app: IApp) => {
                return app.address.indexOf(appPrefix) !== -1;
            });

            this.search.application = currentApp ? currentApp : this.apps[0];
        }

    }

    resetLinker = (): void => {
        this.searching = false;
        this.search = {
            application: (this.apps && this.apps.length > 0) ? this.apps[0] : null,
            text: ""
        };

        this.params = {
            id: "",
            appPrefix: "",
            link: "",
            blank: false,
            target: "",
            title: ""
        };
        safeApply(this.$scope);
    }

    getApplications = async (): Promise<void> => {
        this.apps = await linkerService.getResourcesApplications();
    }

    loadApplicationResources = (): void => {
        let split: string[] = this.search.application.address.split('/');
        this.params.appPrefix = split[split.length - 1];
        Behaviours.loadBehaviours(this.params.appPrefix, this.loadBehaviour);
    }


    searchApplication = (): void => {
        let split: string[] = this.search.application.address.split('/');
        this.params.appPrefix = split[split.length - 1];
        Behaviours.loadBehaviours(this.params.appPrefix, this.searchResources);
    };


    loadBehaviour = (): void => {
        const behaviour = Behaviours.applicationsBehaviours[this.params.appPrefix];
        this.addResource = behaviour.create;
        if (behaviour.loadResourcesWithFilter) {
            this.searchApplication();
        } else if (behaviour.loadResources) {
            const result = behaviour.loadResources(this.searchApplication)
            if (result && result.then) {
                result.then(() => {
                    this.searchApplication();
                });
            }
        } else {
            this.resources = [];
        }
    }


    searchResources = (appBehaviour: IAppBehaviour): void => {
        this.searching = true;
        if (appBehaviour.loadResourcesWithFilter) {
            if (this.search.text) {
                appBehaviour.loadResourcesWithFilter(this.search.text, (resourcesResponse) => {
                    this.resources = resourcesResponse;
                    this.searching = false;
                    safeApply(this.$scope);
                })
            } else {
                this.searching = false;
                safeApply(this.$scope);
            }
        } else if (appBehaviour.loadResources) {
            this.searching = false;
            this.resources = appBehaviour.resources.filter((resource: IResource) => {
                return this.search.text !== '' && (idiom.removeAccents(resource.title.toLowerCase()).indexOf(idiom.removeAccents(this.search.text).toLowerCase()) !== -1 ||
                    resource._id === this.search.text);
            });
            safeApply(this.$scope);
        } else {
            this.searching = false;
            this.resources = [];
            safeApply(this.$scope);
        }
    }


    applyResource = (resource: IResource): void => {
        this.params.link = resource.path;
        this.params.title = resource.title;
    }

    closeForm = (): void => {
        this.display = false;
        this.resetLinker();
    }

    $onDestroy() {
    }


}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}linker/linker.html`,
        scope: {
            display: '=',
            onSubmit: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ILinkerScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitLink = (): void => {
                $parse($scope.vm.onSubmit())(vm.params);
                vm.closeForm();
            }
        }
    }
}

export const linker = ng.directive('linker', directive)
