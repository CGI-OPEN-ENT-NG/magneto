export interface ILinkerSearch {
    application: IApp,
    text: string
}

export interface ILinkerParams {
    id?: string,
    appPrefix?: string,
    link?: string,
    blank?: boolean,
    target?: string,
    title?: string
}

export interface IResource {
    _id?: string,
    title?: string,
    path?: string
}

export interface IAppBehaviour {
    loadResourcesWithFilter?: (search: string, callback: (resourcesResponse) => void) => any;
    loadResources?: (callback: () => void) => any,
    resources?: any[]
}

export interface IApp {
    displayName?: string,
    address?: string,
    icon?: string
}