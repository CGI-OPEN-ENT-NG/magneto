import {model} from "entcore";
import {rights} from "../magnetoBehaviours";

export function hasRight(right: string): boolean {
    return model.me.hasWorkflow(rights.workflow[right]);
}

