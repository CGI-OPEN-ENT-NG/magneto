import {model, ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {IApp} from "../models";


export interface ILinkerService {

    getResourcesApplications(): Promise<IApp[]>;

}

export const linkerService: ILinkerService = {

    getResourcesApplications: async (): Promise<IApp[]> => {
        return http.get('/resources-applications').then((res: AxiosResponse) => {
            return model.me.apps.filter((app: IApp) => {
                return res.data.find((match: string) => {
                        return app.address.indexOf(match) !== -1 && app.icon && app.address.indexOf('#') === -1
                    }
                );
            });
        });
    }
};

export const LinkerService = ng.service('LinkerService', (): ILinkerService => linkerService);
