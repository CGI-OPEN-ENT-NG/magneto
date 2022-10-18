import {Behaviours, model} from 'entcore';
import { magnetoBehaviours} from "./magnetoBehaviours";

export const MAGNETO_APP = "magneto";

Behaviours.register(MAGNETO_APP, {
    rights: magnetoBehaviours,
    resource: function (resource: any) {
        let rightsContainer = resource;
        if (resource && !resource.myRights) {
            resource.myRights = {};
        }
        for (const behaviour in  magnetoBehaviours.resources) {
            if (model.me.hasRight(rightsContainer, magnetoBehaviours.resources[behaviour]) ||
                model.me.userId === resource.owner.userId || model.me.userId === rightsContainer.owner.userId) {
                if (resource.myRights[behaviour] !== undefined) {
                    resource.myRights[behaviour] = resource.myRights[behaviour] &&
                        magnetoBehaviours.resources[behaviour];
                } else {
                    resource.myRights[behaviour] = magnetoBehaviours.resources[behaviour];
                }
            }
        }
        return resource;
    },
    resourceRights: function () {
        return ['read', 'publish', 'contrib', 'manager'];
    }
});
